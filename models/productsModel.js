// productsModel.js
const pool = require('../db');

async function getProductByType(productType) {
  try {
    const result = await pool.query(
      'SELECT * FROM products WHERE type = $1 AND deleted = false',
      [productType]
    );
    return result.rows;
  } catch (error) {
    console.error('Error executing query', error);
    throw new Error('Internal server error');
  }
}

async function getAllProducts() {
  try {
    const result = await pool.query(
      'SELECT * FROM products WHERE deleted = false'
    );
    return result.rows;
  } catch (error) {
    console.error('Error executing query', error);
    throw new Error('Internal server error');
  }
}

module.exports = {
  getProductByType,
  getAllProducts,
};
