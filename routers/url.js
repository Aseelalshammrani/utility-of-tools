const express = require('express')
const router = new express.Router()
const db = require('../db/db')

router.get('/dbeaver', async (req, res) => {
    try {
      const result = await db.query('SELECT id , Employee_name ,Employee_salary ,Employee_bonus FROM Employee ;');
      res.json(result.rows);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  });

module.exports = router;
