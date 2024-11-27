// const request = require('supertest');
// const app = require('../service');

// const { Role, DB } = require('../database/database.js');


// const franchiseeUser = { name: randomName(), email: randomName() + '@test.com', password: 'franchisee' };
// let adminAuthToken;
// let franchiseeAuthToken;
// let franchiseeUserId;
// let createdFranchiseId;

// function randomName() {
//     return Math.random().toString(36).substring(2, 12);
// }

// async function createAdminUser() {
//     let user = { password: 'toomanysecrets', roles: [{ role: Role.Admin }] };
//     user.name = randomName();
//     user.email = user.name + '@admin.com';

//     await DB.addUser(user);

//     user.password = 'toomanysecrets';
//     return user;
// }

// beforeAll(async () => {
//     const adminUser = await createAdminUser();
//     const adminLoginRes = await request(app)
//         .put('/api/auth')
//         .send({ email: adminUser.email, password: adminUser.password });
//     adminAuthToken = adminLoginRes.body.token;
    

//     franchiseeUser.email = Math.random().toString(36).substring(2, 12) + '@test.com';
//     const registerFranchiseeRes = await request(app).post('/api/auth').send(franchiseeUser);
//     franchiseeAuthToken = registerFranchiseeRes.body.token;
//     franchiseeUserId = registerFranchiseeRes.body.user.id;
// });


// test('getFranchises', async () => {
//     const getFranchisesRes = await request(app).get('/api/franchise');

//     expect(getFranchisesRes.status).toBe(200);
//     expect(Array.isArray(getFranchisesRes.body)).toBe(true);
// });

// test('getUserFranchises', async () => {
//     const getUserFranchisesRes = await request(app)
//         .get(`/api/franchise/${franchiseeUserId}`)
//         .set('Authorization', `Bearer ${franchiseeAuthToken}`);

//     expect(getUserFranchisesRes.status).toBe(200);
//     expect(Array.isArray(getUserFranchisesRes.body)).toBe(true);
// });


// test('deleteFranchise', async () => {
//     const newFranchise = {
//         name: randomName(),
//         admins: [{ email: franchiseeUser.email }],
//     };

//     const createFranchiseRes = await request(app)
//         .post('/api/franchise')
//         .set('Authorization', `Bearer ${adminAuthToken}`)
//         .send(newFranchise);

//     expect(createFranchiseRes.status).toBe(200);
//     createdFranchiseId = createFranchiseRes.body.id;
//     const deleteFranchiseRes = await request(app)
//         .delete(`/api/franchise/${createdFranchiseId}`)
//         .set('Authorization', `Bearer ${adminAuthToken}`);

//     expect(deleteFranchiseRes.status).toBe(200);
//     expect(deleteFranchiseRes.body).toEqual({ message: 'franchise deleted' });

//     const getFranchisesRes = await request(app).get('/api/franchise');
//     const franchiseExists = getFranchisesRes.body.some(franchise => franchise.id === createdFranchiseId);
//     expect(franchiseExists).toBe(false); 
// });

// test('deleteStore', async () => {
//     const newFranchise = {
//       name: randomName(),
//       admins: [{ email: franchiseeUser.email }],
//     };
    
//     const createFranchiseRes = await request(app)
//       .post('/api/franchise')
//       .set('Authorization', `Bearer ${adminAuthToken}`)
//       .send(newFranchise);
  
//     expect(createFranchiseRes.status).toBe(200);
//     const franchiseId = createFranchiseRes.body.id;
  
//     const newStore = {
//       franchiseId: franchiseId,
//       name: 'TestStore',
//     };
  
//     const createStoreRes = await request(app)
//       .post(`/api/franchise/${franchiseId}/store`)
//       .set('Authorization', `Bearer ${adminAuthToken}`)
//       .send(newStore);
  
//     expect(createStoreRes.status).toBe(200);
//     const storeId = createStoreRes.body.id;
  
//     const deleteStoreRes = await request(app)
//       .delete(`/api/franchise/${franchiseId}/store/${storeId}`)
//       .set('Authorization', `Bearer ${adminAuthToken}`);
    
//     expect(deleteStoreRes.status).toBe(200);
//     expect(deleteStoreRes.body).toEqual({ message: 'store deleted' });
  
//     const getFranchiseRes = await request(app)
//       .get(`/api/franchise/${franchiseeUserId}`)
//       .set('Authorization', `Bearer ${franchiseeAuthToken}`);
    
//     const franchiseStores = getFranchiseRes.body.find(franchise => franchise.id === franchiseId)?.stores || [];
//     const storeExists = franchiseStores.some(store => store.id === storeId);
//     expect(storeExists).toBe(false); 

    
//   });