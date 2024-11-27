const express = require('express');
const fetch = require('node-fetch');

const router = express.Router();


router.get('/menu', async (req, res) => {
  try {
    const backendUrl = 'https://pizza-service.cs329jwtpizza.com/api/order/menu'; 

    const response = await fetch(backendUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch menu: ${response.statusText}`);
    }

    const menuData = await response.json();

    res.json(menuData);
  } catch (error) {
    console.error('Error fetching menu data:', error);
    res.status(500).json({ error: 'Failed to fetch menu data' });
  }
});

module.exports = router;




