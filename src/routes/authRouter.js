const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('../config.js');
const { asyncHandler } = require('../endpointHelper.js');
const { DB, Role } = require('../database/database.js');
const metrics = require('../metrics.js'); 
const logger = require('../logging.js');

const authRouter = express.Router();
authRouter.use(logger.httpLogger);

authRouter.endpoints = [
  {
    method: 'POST',
    path: '/api/auth',
    description: 'Register a new user',
    example: `curl -X POST localhost:3000/api/auth -d '{"name":"pizza diner", "email":"d@jwt.com", "password":"diner"}' -H 'Content-Type: application/json'`,
    response: { user: { id: 2, name: 'pizza diner', email: 'd@jwt.com', roles: [{ role: 'diner' }] }, token: 'tttttt' },
  },
  {
    method: 'PUT',
    path: '/api/auth',
    description: 'Login existing user',
    example: `curl -X PUT localhost:3000/api/auth -d '{"email":"a@jwt.com", "password":"admin"}' -H 'Content-Type: application/json'`,
    response: { user: { id: 1, name: '常用名字', email: 'a@jwt.com', roles: [{ role: 'admin' }] }, token: 'tttttt' },
  },
  {
    method: 'PUT',
    path: '/api/auth/:userId',
    requiresAuth: true,
    description: 'Update user',
    example: `curl -X PUT localhost:3000/api/auth/1 -d '{"email":"a@jwt.com", "password":"admin"}' -H 'Content-Type: application/json' -H 'Authorization: Bearer tttttt'`,
    response: { id: 1, name: '常用名字', email: 'a@jwt.com', roles: [{ role: 'admin' }] },
  },
  {
    method: 'DELETE',
    path: '/api/auth',
    requiresAuth: true,
    description: 'Logout a user',
    example: `curl -X DELETE localhost:3000/api/auth -H 'Authorization: Bearer tttttt'`,
    response: { message: 'logout successful' },
  },
];

async function setAuthUser(req, res, next) {
  const token = readAuthToken(req);
  if (token) {
    try {
      if (await DB.isLoggedIn(token)) {
        // Check the database to make sure the token is valid.
        req.user = jwt.verify(token, config.jwtSecret);
        req.user.isRole = (role) => !!req.user.roles.find((r) => r.role === role);
      }
    } catch {
      req.user = null;
    }
  }
  next();
}

// Authenticate token
authRouter.authenticateToken = (req, res, next) => {
  if (!req.user) {
    return res.status(401).send({ message: 'unauthorized' });
  }
  next();
};

// register
authRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      metrics.incrementAuthFailure()
      logger.log('warn', 'auth', { message: 'Invalid email or password', email: email });
      return res.status(400).json({ message: 'name, email, and password are required' });
    }
    const user = await DB.addUser({ name, email, password, roles: [{ role: Role.Diner }] });
    const auth = await setAuth(user);
    metrics.incrementRequests("POST");
    metrics.incrementAuthSuccess();
    logger.log('info', 'auth', { message: 'User registered successfully', user: user.id });
    res.json({ user: user, token: auth });
  })
  
);

// login
authRouter.put(
  '/',
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await DB.getUser(email, password);
      if (!user) {
        metrics.incrementAuthFailure(); 
        logger.log('warn', 'auth', { message: 'Invalid email or password', email: email });
        return res.status(401).json({ message: 'Invalid email or password' });
      }
      const auth = await setAuth(user);
      metrics.incrementRequests('PUT');
      metrics.incrementAuthSuccess(); 
      metrics.incrementActiveUsers(); 
      logger.log('info', 'auth', { message: 'User logged in successfully', user: user.id });
      res.json({ user: user, token: auth });
    } catch (error) {
      metrics.incrementAuthFailure();
      console.error('Login error:', error);
      logger.log('error', 'auth', { message: 'Login error', error: error.message });
      res.status(500).json({ message: 'An error occurred during login' });
    }
  })
);
// logout
authRouter.delete(
  '/',
  authRouter.authenticateToken,
  asyncHandler(async (req, res) => {
    await clearAuth(req);
    metrics.incrementRequests("DELETE");
    metrics.decrementActiveUsers();
    logger.log('info', 'auth', { message: 'User logged out successfully', user: req.user.id });
    res.json({ message: 'logout successful' });
  })
);

// updateUser
authRouter.put(
  '/:userId',
  authRouter.authenticateToken,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const userId = Number(req.params.userId);
    const user = req.user;
    if (user.id !== userId && !user.isRole(Role.Admin)) {
      return res.status(403).json({ message: 'unauthorized' });
    }
    metrics.incrementRequests("PUT");
    const updatedUser = await DB.updateUser(userId, email, password);
    logger.log('info', 'auth', { message: 'User updated successfully', user: userId });
    res.json(updatedUser);
  })
);

authRouter.put(
  '/chaos/:state',
  authRouter.authenticateToken,
  asyncHandler(async (req, res) => {
    if (!req.user.isRole(Role.Admin)) {
      throw new StatusCodeError('unknown endpoint', 404);
    }
    enableChaos = req.params.state === 'true';
    if (enableChaos) {
      metrics.incrementChaosEnabled('chaos_mode_enabled');
    } else {
      metrics.incrementChaosDisabled('chaos_mode_disabled');
    }

    logger.log('info', 'chaos', { message: `Chaos mode toggled`, state: enableChaos });

    
    res.json({ chaos: enableChaos });
  })
);

async function setAuth(user) {
  const token = jwt.sign(user, config.jwtSecret);
  try {
    await DB.loginUser(user.id, token);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      logger.log('warn', 'auth', { message: 'Duplicate login detected', user: user.id });
      throw new Error('Concurrent login attempt detected');
    }
    throw error;
  }
  return token;
}

async function clearAuth(req) {
  const token = readAuthToken(req);
  if (token) {
    await DB.logoutUser(token);
  }
}

function readAuthToken(req) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    return authHeader.split(' ')[1];
  }
  return null;
}

module.exports = { authRouter, setAuthUser };
