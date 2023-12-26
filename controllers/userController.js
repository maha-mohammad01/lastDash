const UserModel = require('../models/userModel');
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const axios = require('axios');
const authenticateToken = require('../middleware/authenticateToken');
const multer = require('multer');
const upload = multer();
const pool = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const secretKey = process.env.SECRET_KEY;
const { initializeApp } = require("firebase/app");
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

// تهيئة Firebase App
const firebaseApp = initializeApp(firebaseConfig);

class UserController {
    async loginUser(req, res) {
        try {
            const { email, password } = req.body;
            const result = await pool.query('SELECT * FROM users WHERE email = $1 AND is_deleted = false', [email]);

            if (result.rows.length === 0) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const user = result.rows[0];
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            const token = jwt.sign({ user_id: user.user_id, email: user.email, user_role: user.user_role }, secretKey, { expiresIn: '10d' });
            res.json({ token });
        } catch (error) {
            console.error('Error executing query', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async registerUser(req, res) {
        try {
            const { full_name, email, password, phone } = req.body;
            const user_role = 3;

            const emailExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            if (emailExists.rows.length > 0) {
                return res.status(400).json({ message: 'Email already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const result = await pool.query('INSERT INTO users (full_name, email, password, phone, user_role, is_deleted) VALUES ($1, $2, $3, $4, $5, false) RETURNING *', [full_name, email, hashedPassword, phone, user_role]);

            res.json({ message: 'User registered successfully' });
        } catch (error) {
            console.error('Error executing query', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async getUserProfile(req, res) {
        try {
            const { user_id } = req.user;
            const userResult = await pool.query('SELECT * FROM users WHERE user_id = $1 AND is_deleted = false', [user_id]);

            if (userResult.rows.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            const user = userResult.rows[0];

            let imageBuffer;
            if (user.pic_user) {
                const imageRef = ref(getStorage(), user.pic_user);
                const imageDownloadURL = await getDownloadURL(imageRef);
                const imageResponse = await axios.get(imageDownloadURL, { responseType: 'arraybuffer' });
                imageBuffer = Buffer.from(imageResponse.data, 'binary');
            }

            const response = {
                message: 'User profile retrieved successfully',
                user: {
                    ...user,
                    pic_user: imageBuffer ? `data:image/jpeg;base64,${imageBuffer.toString('base64')}` : null,
                },
            };

            res.json(response);
        } catch (error) {
            console.error('Error executing query', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async uploadUserProfilePic(req, res) {
      try {
          if (!req.file) {
              return res.status(400).json({ message: 'لم يتم تحميل ملف.' });
          }

          const fileBuffer = req.file.buffer;
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const fileExtension = 'jpeg';

          const fileName = `image-${uniqueSuffix}.${fileExtension}`;
          const storageRef = ref(getStorage(), fileName);
          await uploadBytes(storageRef, fileBuffer);

          const imageUrl = await getDownloadURL(storageRef);
          const { user_id } = req.user;

          const updateResult = await pool.query('UPDATE users SET pic_user = $1 WHERE user_id = $2 RETURNING *', [imageUrl, user_id]);

          if (updateResult.rows.length === 0) {
              return res.status(404).json({ message: 'User not found' });
          }

          res.json({ message: 'Image uploaded and database updated successfully', imageUrl });
      } catch (error) {
          console.error('Error executing query', error);
          res.status(500).json({ message: 'Internal server error', error: error.message });
      }
  }
    
    async deleteUser(req, res) {
        try {
            const { user_id } = req.user;
            const result = await pool.query('UPDATE users SET is_deleted = true WHERE user_id = $1 RETURNING *', [user_id]);

            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            res.json({ message: 'User deleted successfully' });
        } catch (error) {
            console.error('Error executing query', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async updateUser(req, res) {
        try {
            const { full_name, email, phone } = req.body;
            const { user_id } = req.user;

            const userExists = await pool.query('SELECT * FROM users WHERE user_id = $1 AND is_deleted = false', [user_id]);

            if (userExists.rows.length === 0) {
                return res.status(404).json({ message: 'User not found' });
            }

            const result = await pool.query('UPDATE users SET full_name = $1, email = $2, phone = $3 WHERE user_id = $4 RETURNING *', [full_name, email, phone, user_id]);

            res.json({ message: 'User updated successfully', user: result.rows[0] });
        } catch (error) {
            console.error('Error executing query', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async logoutUser(req, res) {
        try {
            res.clearCookie('token');
            res.json({ message: 'Logout successful' });
        } catch (error) {
            console.error('Error logging out', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async bookStadium(req, res) {
      const stadium_id = req.params.stadium_id;
      const { start_time, end_time, booking_date, note, phone } = req.body;
      const { user_id } = req.user;
    
      try {
        // التحقق من توفر الملعب والتحقق من عدم وجود تعارض في الحجز
        const conflictCheck = await pool.query(
          'SELECT * FROM bookings WHERE stadium_id = $1 AND booking_date = $2 AND ((start_time >= $3 AND start_time < $4) OR (end_time > $3 AND end_time <= $4))',
          [stadium_id, booking_date, start_time, end_time]
        );
    
        if (conflictCheck.rows.length > 0) {
          return res.status(400).json({ message: 'Stadium is already booked during this period' });
        }
    
        // إضافة الحجز
        const result = await pool.query(
          'INSERT INTO bookings (stadium_id, user_id, start_time, end_time, booking_date, note, phone) VALUES ($1, $2, $3::time, $4::time, $5, $6, $7) RETURNING *',
          [stadium_id, user_id, start_time, end_time, booking_date, note, phone]
        );
    
        res.json({ message: 'Stadium booked successfully', booking: result.rows[0] });
      } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }
    
    async getUserBookings(req, res) {
      const { user_id } = req.user;
    
      try {
        const bookingsResult = await pool.query('SELECT bookings.*, stadiums.name FROM bookings JOIN stadiums ON bookings.stadium_id = stadiums.stadium_id WHERE bookings.user_id = $1', [user_id]);
    
        const formattedBookings = bookingsResult.rows.map(booking => ({
          booking_date: booking.booking_date, // Keep the raw date value
          start_time: booking.start_time,
          end_time: booking.end_time,
          name: booking.name 
        }));
    
        res.json({ bookings: formattedBookings });
    
      } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    }


    async addToWishlist(req, res) {
        const { product_id } = req.params;
        const { user_id } = req.user;
    
        try {
          // Check if the product is already in the wishlist
          const existingWishlistEntry = await pool.query(
            'SELECT * FROM wishlists WHERE user_id = $1 AND product_id = $2',
            [user_id, product_id]
          );
    
          if (existingWishlistEntry.rows.length > 0) {
            return res.status(400).json({ message: 'Product already in wish list' });
          }
    
          // Get product information from the products table
          const productInfo = await pool.query(
            'SELECT name AS product_name, price AS product_price, images AS product_image_url FROM products WHERE id_product = $1',
            [product_id]
          );
    
          if (productInfo.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
          }
    
          const { product_name, product_price, product_image_url } = productInfo.rows[0];
    
          // Add the product to the wishlist
          const result = await pool.query(
            'INSERT INTO wishlists (user_id, product_id, product_name, product_price, product_image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [user_id, product_id, product_name, product_price, product_image_url]
          );
    
          res.json({ message: 'Product added to wish list successfully', wishlistEntry: result.rows[0] });
        } catch (error) {
          console.error('Error executing query', error);
          res.status(500).json({ message: 'Internal server error' });
        }
      }
    
      async getWishlist(req, res) {
        const { user_id } = req.user;
    
        try {
          const wishlistEntries = await pool.query(
            'SELECT id, product_id, product_name, product_price, product_image_url FROM wishlists WHERE user_id = $1',
            [user_id]
          );
    
          // Convert the selected image storage format into an array
          const formattedWishlist = wishlistEntries.rows.map(entry => ({
            id: entry.id,
            product_id: entry.product_id,
            product_name: entry.product_name,
            product_price: entry.product_price,
            product_images: Array.isArray(entry.product_image_url)
              ? entry.product_image_url.map(url => ({ url }))
              : entry.product_image_url.split(',').map(url => ({ url })),
          }));
    
          res.json({ message: 'Wishlist retrieved successfully', wishlistEntries: formattedWishlist });
        } catch (error) {
          console.error('Error executing query', error);
          res.status(500).json({ message: 'Internal server error' });
        }
      }
    
      async removeFromWishlist(req, res) {
        const { entry_id } = req.params;
        const { user_id } = req.user;
    
        try {
          const deleteResult = await pool.query(
            'DELETE FROM wishlists WHERE id = $1 AND user_id = $2 RETURNING *',
            [entry_id, user_id]
          );
    
          if (deleteResult.rows.length === 0) {
            return res.status(404).json({ message: 'Wishlist entry not found' });
          }
    
          res.json({ message: 'Wishlist entry deleted successfully', deletedEntry: deleteResult.rows[0] });
        } catch (error) {
          console.error('Error executing query', error);
          res.status(500).json({ message: 'Internal server error' });
        }
      }
      async addToCart(req, res) {
        const { id_product, quantity } = req.body;
        const { user_id } = req.user;
    
        try {
          const result = await UserModel.addToCart(user_id, id_product, quantity);
          res.json({ message: 'Product added to cart successfully', cart_item: result });
        } catch (error) {
          console.error('Error executing addToCart query', error);
          res.status(500).json({ message: 'Internal server error' });
        }
      }
    
      async viewCart(req, res) {
        const { user_id } = req.user;
    
        try {
          const result = await UserModel.viewCart(user_id);
          res.json({ message: 'Cart items retrieved successfully', cart_items: result });
        } catch (error) {
          console.error('Error executing viewCart query', error);
          res.status(500).json({ message: 'Internal server error' });
        }
      }
    
      async updateCart(req, res) {
        const { cart_id } = req.params;
        const { quantity } = req.body;
        const { user_id } = req.user;
    
        try {
          const result = await UserModel.updateCart(cart_id, user_id, quantity);
          res.json({ message: 'Cart item updated successfully', cart_item: result });
        } catch (error) {
          console.error('Error executing updateCart query', error);
          res.status(500).json({ message: 'Internal server error' });
        }
      }
    
      async placeOrder(req, res) {
        const { cart_id } = req.body;
        const { user_id } = req.user;
    
        try {
          await UserModel.placeOrder(user_id, cart_id);
          res.json({ message: 'Purchase completed successfully' });
        } catch (error) {
          console.error('Error executing placeOrder query', error);
          res.status(500).json({ message: 'Internal server error' });
        }
      }
    
      async viewProducts(req, res) {
        try {
          const result = await UserModel.viewProducts();
          res.json({ message: 'Products retrieved successfully', products: result });
        } catch (error) {
          console.error('Error executing viewProducts query', error);
          res.status(500).json({ message: 'Internal server error' });
        }
      }
    
    }
    



module.exports = new UserController();
