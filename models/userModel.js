const pool = require('../db');

async function getUserByEmail(email) {
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0];
  } catch (error) {
    console.error('Error executing getUserByEmail query', error);
    throw error;
  }
}

async function createUser(full_name, email, password, phone, user_role) {
  try {
    const result = await pool.query(
      'INSERT INTO users (full_name, email, password, phone, user_role) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [full_name, email, password, phone, user_role]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error executing createUser query', error);
    throw error;
  }
}

async function getUserById(user_id) {
  try {
    const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [user_id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error executing getUserById query', error);
    throw error;
  }
}

async function updateUser(user_id, full_name, email, phone) {
  try {
    const result = await pool.query(
      'UPDATE users SET full_name = $1, email = $2, phone = $3 WHERE user_id = $4 RETURNING *',
      [full_name, email, phone, user_id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error executing updateUser query', error);
    throw error;
  }
}

async function deleteUser(user_id) {
  try {
    const result = await pool.query('DELETE FROM users WHERE user_id = $1 RETURNING *', [user_id]);
    return result.rows[0];
  } catch (error) {
    console.error('Error executing deleteUser query', error);
    throw error;
  }
}

async function getUserBookings(user_id) {
  try {
    const result = await pool.query('SELECT * FROM bookings WHERE user_id = $1', [user_id]);
    return result.rows;
  } catch (error) {
    console.error('Error executing getUserBookings query', error);
    throw error;
  }
}

async function bookStadium(stadium_id, start_time, end_time, booking_date, note, phone, user_id, payment_method) {
  try {
      // التحقق من توفر الملعب في الفترة المحددة
      const checkAvailabilityQuery = `
        SELECT * 
        FROM bookings 
        WHERE stadium_id = $1 
        AND booking_date = $2 
        AND (
          (start_time <= $3 AND end_time >= $3) OR 
          (start_time <= $4 AND end_time >= $4) OR
          (start_time >= $3 AND end_time <= $4)
        )
      `;
      const availabilityValues = [stadium_id, booking_date, start_time, end_time];
      const availabilityResult = await pool.query(checkAvailabilityQuery, availabilityValues);

      if (availabilityResult.rows.length > 0) {
          // الملعب محجوز في هذه الفترة
          return null;
      }

      // إذا كان الملعب غير محجوز، قم بإضافة الحجز
      const addBookingQuery = `
        INSERT INTO bookings (stadium_id, start_time, end_time, booking_date, note, phone, user_id, payment_method) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING *
      `;
      const addBookingValues = [stadium_id, start_time, end_time, booking_date, note, phone, user_id, payment_method];
      const bookingResult = await pool.query(addBookingQuery, addBookingValues);

      return bookingResult.rows[0];
  } catch (error) {
      console.error('Error executing bookStadium query', error);
      throw error;
  }
}


async function addToWishlist(user_id, product_id, product_name, product_price, product_image_url) {
  try {
    const result = await pool.query(
      'INSERT INTO wishlists (user_id, product_id, product_name, product_price, product_image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user_id, product_id, product_name, product_price, product_image_url]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error executing addToWishlist query', error);
    throw error;
  }
}

async function getWishlist(user_id) {
  try {
    const result = await pool.query(
      'SELECT id, product_id, product_name, product_price, product_image_url FROM wishlists WHERE user_id = $1',
      [user_id]
    );

    return result.rows.map(entry => ({
      id: entry.id,
      product_id: entry.product_id,
      product_name: entry.product_name,
      product_price: entry.product_price,
      product_images: Array.isArray(entry.product_image_url)
        ? entry.product_image_url.map(url => ({ url }))
        : entry.product_image_url.split(',').map(url => ({ url })),
    }));
  } catch (error) {
    console.error('Error executing getWishlist query', error);
    throw error;
  }
}

async function removeFromWishlist(entry_id, user_id) {
  try {
    const result = await pool.query(
      'DELETE FROM wishlists WHERE id = $1 AND user_id = $2 RETURNING *',
      [entry_id, user_id]
    );
    return result.rows[0];
  } catch (error) {
    console.error('Error executing removeFromWishlist query', error);
    throw error;
  }
}
async function addToCart(user_id, product_id, quantity) {
  try {
    const productResult = await pool.query('SELECT * FROM products WHERE id_product = $1', [product_id]);

    if (productResult.rows.length === 0) {
      throw new Error('Product not found');
    }

    const product = productResult.rows[0];
    const total_price = product.price * quantity;

    if (product.quantity < quantity) {
      throw new Error('Insufficient quantity available');
    }

    const cartResult = await pool.query(
      `INSERT INTO cart (user_id, product_id, quantity, total_price, created_at)
        VALUES ($1, $2, $3, $4, current_timestamp) RETURNING *`,
      [user_id, product_id, quantity, total_price]
    );

    const updatedQuantity = product.quantity - quantity;
    await pool.query('UPDATE products SET quantity = $1 WHERE id_product = $2', [updatedQuantity, product_id]);

    return cartResult.rows[0];
  } catch (error) {
    throw error;
  }
}

async function viewCart(user_id) {
  try {
    const result = await pool.query(
      `SELECT c.*, p.price, p.name as product_name
       FROM cart c
       JOIN products p ON c.product_id = p.id_product
       WHERE c.user_id = $1`,
      [user_id]
    );

    return result.rows;
  } catch (error) {
    throw error;
  }
}


async function updateCart(cart_id, user_id, quantity) {
  try {
    const cartItemResult = await pool.query('SELECT * FROM cart WHERE cart_id = $1 AND user_id = $2', [cart_id, user_id]);

    if (cartItemResult.rows.length === 0) {
      throw new Error('Cart item not found');
    }

    const cartItem = cartItemResult.rows[0];
    const { product_id, previous_quantity } = cartItem;

    const productResult = await pool.query('SELECT * FROM products WHERE id_product = $1', [product_id]);

    if (productResult.rows.length === 0) {
      throw new Error('Product not found');
    }

    const product = productResult.rows[0];
    const { quantity: availableQuantity, price } = product;

    const updatedAvailableQuantity = availableQuantity + previous_quantity - quantity;

    if (updatedAvailableQuantity < 0) {
      throw new Error('Quantity not available');
    }

    const updatedCartItemResult = await pool.query(
      `UPDATE cart SET quantity = $1, total_price = $2 WHERE cart_id = $3 RETURNING *`,
      [quantity, price * quantity, cart_id]
    );

    await pool.query('UPDATE products SET quantity = $1 WHERE id_product = $2', [updatedAvailableQuantity, product_id]);

    return updatedCartItemResult.rows[0];
  } catch (error) {
    throw error;
  }
}

async function placeOrder(user_id, cart_id) {
  try {
    const cartResult = await pool.query('SELECT * FROM cart WHERE user_id = $1 AND cart_id = $2', [user_id, cart_id]);

    if (cartResult.rows.length === 0) {
      throw new Error('Cart not found');
    }

    const cartItem = cartResult.rows[0];

    await pool.query(
      `INSERT INTO orders (user_id, product_id, quantity, total_price, created_at)
        VALUES ($1, $2, $3, $4, current_timestamp)`,
      [user_id, cartItem.product_id, cartItem.quantity, cartItem.total_price]
    );

    await pool.query('DELETE FROM cart WHERE cart_id = $1', [cart_id]);
  } catch (error) {
    throw error;
  }
}

async function viewProducts() {
  try {
    const result = await pool.query('SELECT * FROM products WHERE deleted = false');
    return result.rows;
  } catch (error) {
    throw error;
  }
}
module.exports = {
  getUserByEmail,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getUserBookings,
  bookStadium,
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  addToCart,
  viewCart,
  updateCart,
  placeOrder,
  viewProducts,
};
