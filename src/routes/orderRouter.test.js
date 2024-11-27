// const request = require('supertest');
// const app = require('../service');

// const { Role, DB } = require('../database/database.js');

// function randomName() {
//     return Math.random().toString(36).substring(2, 12);
// }

// async function createAdminUser() {
//   let user = { password: 'toomanysecrets', roles: [{ role: Role.Admin }] };
//   user.name = randomName();
//   user.email = user.name + '@admin.com';

//   await DB.addUser(user);

//   user.password = 'toomanysecrets';
//   return user;
// }

// let testAdminUser;
// let testAdminAuthToken;

// const testUser = { name: 'Regular User', email: 'user@test.com', password: 'userpass' };
// let testUserAuthToken;

// beforeAll(async () => {
//   testAdminUser = await createAdminUser();
//   const loginAdminRes = await request(app).put('/api/auth').send({
//     email: testAdminUser.email,
//     password: 'toomanysecrets',
//   });
//   testAdminAuthToken = loginAdminRes.body.token;

//   testUser.email = Math.random().toString(36).substring(2, 12) + '@test.com';
//   const registerUserRes = await request(app).post('/api/auth').send(testUser);
//   testUserAuthToken = registerUserRes.body.token;
// });

// test('getMenu', async () => {
//   const res = await request(app).get('/api/order/menu');
//   expect(res.status).toBe(200);
//   expect(Array.isArray(res.body)).toBe(true);
//   expect(res.body.length).toBeGreaterThanOrEqual(0);
//   if (res.body.length > 0) {
//     expect(res.body[0]).toHaveProperty('id');
//     expect(res.body[0]).toHaveProperty('title');
//     expect(res.body[0]).toHaveProperty('image');
//     expect(res.body[0]).toHaveProperty('price');
//     expect(res.body[0]).toHaveProperty('description');
//   }
// });

// test('addMenuItem', async () => {
//   const newMenuItem = {
//     title: 'Test Pizza',
//     description: 'A test pizza for the menu',
//     image: 'testpizza.png',
//     price: 0.004,
//   };

//   const res = await request(app)
//     .put('/api/order/menu')
//     .set('Authorization', `Bearer ${testAdminAuthToken}`) 
//     .send(newMenuItem);

//   expect(res.status).toBe(200);
//   expect(Array.isArray(res.body)).toBe(true);
//   const addedItem = res.body.find(item => item.title === newMenuItem.title);
//   expect(addedItem).toMatchObject(newMenuItem);
// });

// test('getOrders', async () => {
//   const res = await request(app)
//     .get('/api/order')
//     .set('Authorization', `Bearer ${testUserAuthToken}`);  
  
//   expect(res.status).toBe(200);
//   expect(res.body).toHaveProperty('dinerId');
//   expect(res.body).toHaveProperty('orders');
//   expect(Array.isArray(res.body.orders)).toBe(true);
// });

// test('createOrder', async () => {
//   const newOrder = {
//     franchiseId: 1,
//     storeId: 1,
//     items: [
//       {
//         menuId: 1,
//         description: 'Veggie',
//         price: 0.05,
//       },
//     ],
//   };

//   const res = await request(app)
//     .post('/api/order')
//     .set('Authorization', `Bearer ${testUserAuthToken}`)  
//     .send(newOrder);

//   expect(res.status).toBe(200);
//   expect(res.body).toHaveProperty('order');
//   expect(res.body.order).toMatchObject({
//     franchiseId: newOrder.franchiseId,
//     storeId: newOrder.storeId,
//     items: newOrder.items,
//   });
//   expect(res.body).toHaveProperty('jwt');
//   expect(typeof res.body.jwt).toBe('string');
// });
