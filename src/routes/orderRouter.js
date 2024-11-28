const express = require('express');
const config = require('../config.js');
const { Role, DB } = require('../database/database.js');
const { authRouter } = require('./authRouter.js');
const { asyncHandler, StatusCodeError } = require('../endpointHelper.js');
const metrics = require('../metrics.js');
const logger = require('../logging.js');



const orderRouter = express.Router();
orderRouter.use(logger.httpLogger);

orderRouter.endpoints = [
  {
    method: 'GET',
    path: '/api/order/menu',
    description: 'Get the pizza menu',
    example: `curl localhost:3000/api/order/menu`,
    response: [{ id: 1, title: 'Veggie', image: 'pizza1.png', price: 0.0038, description: 'A garden of delight' }],
  },
  {
    method: 'PUT',
    path: '/api/order/menu',
    requiresAuth: true,
    description: 'Add an item to the menu',
    example: `curl -X PUT localhost:3000/api/order/menu -H 'Content-Type: application/json' -d '{ "title":"Student", "description": "No topping, no sauce, just carbs", "image":"pizza9.png", "price": 0.0001 }'  -H 'Authorization: Bearer tttttt'`,
    response: [{ id: 1, title: 'Student', description: 'No topping, no sauce, just carbs', image: 'pizza9.png', price: 0.0001 }],
  },
  {
    method: 'GET',
    path: '/api/order',
    requiresAuth: true,
    description: 'Get the orders for the authenticated user',
    example: `curl -X GET localhost:3000/api/order  -H 'Authorization: Bearer tttttt'`,
    response: { dinerId: 4, orders: [{ id: 1, franchiseId: 1, storeId: 1, date: '2024-06-05T05:14:40.000Z', items: [{ id: 1, menuId: 1, description: 'Veggie', price: 0.05 }] }], page: 1 },
  },
  {
    method: 'POST',
    path: '/api/order',
    requiresAuth: true,
    description: 'Create a order for the authenticated user',
    example: `curl -X POST localhost:3000/api/order -H 'Content-Type: application/json' -d '{"franchiseId": 1, "storeId":1, "items":[{ "menuId": 1, "description": "Veggie", "price": 0.05 }]}'  -H 'Authorization: Bearer tttttt'`,
    response: { order: { franchiseId: 1, storeId: 1, items: [{ menuId: 1, description: 'Veggie', price: 0.05 }], id: 1 }, jwt: '1111111111' },
  },
];

// getMenu
orderRouter.get(
  '/menu',
  asyncHandler(async (req, res) => {
    metrics.incrementRequests("GET");
    res.send(await DB.getMenu());
    logger.log('info', 'menu', { message: 'Fetched menu' });
  })
);

// addMenuItem
orderRouter.put(
  '/menu',
  authRouter.authenticateToken,
  asyncHandler(async (req, res) => {
    if (!req.user.isRole(Role.Admin)) {
      throw new StatusCodeError('unable to add menu item', 403);
    }

    const addMenuItemReq = req.body;
    await DB.addMenuItem(addMenuItemReq);
    metrics.incrementRequests("PUT");
    logger.log('info', 'menu', { message: 'Menu item added', item: addMenuItemReq.title });
    res.send(await DB.getMenu());
  })
);

// getOrders
orderRouter.get(
  '/',
  authRouter.authenticateToken,
  asyncHandler(async (req, res) => {
    metrics.incrementRequests("GET");
    logger.log('info', 'order', { message: 'Fetched user orders', user: req.user.id });
    res.json(await DB.getOrders(req.user, req.query.page));
  })
);

// createOrder
orderRouter.post(
  '/',
  authRouter.authenticateToken,
  asyncHandler(async (req, res) => {
    const orderReq = req.body;
    const startTime = Date.now(); // Start timing latency
    try {
      const order = await DB.addDinerOrder(req.user, orderReq);
      logger.log('info', 'factory', { message: 'Sending request to factory service', url: `${config.factory.url}/api/order`, order });
      const r = await fetch(`${config.factory.url}/api/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', authorization: `Bearer ${config.factory.apiKey}` },
        body: JSON.stringify({ diner: { id: req.user.id, name: req.user.name, email: req.user.email }, order }),
      });
      const j = await r.json();

      if (r.ok) {
        const endTime = Date.now();
        const latency = endTime - startTime;

        metrics.incrementRequests('POST');
        metrics.incrementPizzaSales(orderReq.items.reduce((sum, item) => sum + item.price, 0));
        metrics.logLatency(latency);
        logger.log('info', 'order', { message: 'Order created successfully', orderId: order.id, user: req.user.id });
        logger.log('info', 'factory', { message: 'Received successful response from factory service', response: j });

        res.send({ order, jwt: j.jwt, reportUrl: j.reportUrl });
      } else {
        metrics.incrementCreationFailures();
        logger.log('error', 'factory', { message: 'Failed to fulfill order at factory', status: r.status, response: j });
        res.status(500).send({ message: 'Failed to fulfill order at factory', reportUrl: j.reportUrl });
      }
    } catch (error) {
      metrics.incrementCreationFailures();
      console.error('Error creating order:', error);
      logger.log('error', 'order', { message: 'Error creating order', error: error.message });
      res.status(500).send({ message: 'Failed to process order' });
    }
  })
);

module.exports = orderRouter;
