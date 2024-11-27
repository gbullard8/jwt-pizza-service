const request = require('supertest');
const app = require('../service');

function randomName() {
  return Math.random().toString(36).substring(2, 12);
}

const testUser = { name: randomName(), email: randomName() + '@test.com', password: randomName() };

beforeAll(async () => {
  testUser.email = randomName() + '@test.com';
  await request(app).post('/api/auth').send(testUser);
});

test('login', async () => {
  const loginRes = await request(app).put('/api/auth').send(testUser);
  expect(loginRes.status).toBe(200);
  expect(loginRes.body.token).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);

  const user = { ...testUser, roles: [{ role: 'diner' }] };
  delete user.password;

  expect(loginRes.body.user).toMatchObject(user);
});

test('register', async () => {
  const newUser = {
    name: randomName(),
    email: randomName() + '@test.com',
    password: randomName(),
  };

  const registerRes = await request(app).post('/api/auth').send(newUser);
  expect(registerRes.status).toBe(200);
  expect(registerRes.body.token).toMatch(/^[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*\.[a-zA-Z0-9\-_]*$/);

  const expectedUser = { ...newUser, roles: [{ role: 'diner' }] };
  delete expectedUser.password;

  expect(registerRes.body.user).toMatchObject(expectedUser);
});

test('updateUser', async () => {
  const newUser = { name: randomName(), email: randomName() + '@test.com', password: randomName() };
  const registerRes = await request(app).post('/api/auth').send(newUser);
  expect(registerRes.status).toBe(200);
  const newUserAuthToken = registerRes.body.token;
  const newUserId = registerRes.body.user.id;

  const updatedUserData = {
    email: randomName() + '@test.com',
    password: randomName(),
  };

  const updateRes = await request(app)
    .put(`/api/auth/${newUserId}`)
    .set('Authorization', `Bearer ${newUserAuthToken}`)
    .send(updatedUserData);

  expect(updateRes.status).toBe(200);
  expect(updateRes.body).toMatchObject({
    name: newUser.name,
    email: updatedUserData.email,
    roles: [{ role: 'diner' }],
  });
});

  


  

