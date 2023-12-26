// productsController.js
const pool = require('../db');

async function getProducts(req, res) {
  try {
    let result;

    if (req.params.type) {
      const productType = req.params.type;
      result = await pool.query(
        'SELECT * FROM products WHERE type = $1 AND deleted = false',
        [productType]
      );
    } else {
      result = await pool.query(
        'SELECT * FROM products WHERE deleted = false'
      );
    }

    res.json(result.rows);
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

module.exports = {
  getProducts,
};
