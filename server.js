const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const multer = require('multer');
const app = express();
const secretKey = 'your_secret_key';
const cors = require('cors');
const path = require("path");
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const axios = require('axios');

const admin = require("firebase-admin");
const imagesArray = ["url1", "url2", "url3"];
const imagesString = JSON.stringify(imagesArray);
require('dotenv').config();
app.use(express.json());


const userRoutes = require('./routes/userRoutes');
const contactsRoutes = require('./routes/contactsRoutes');
const stadiumRoutes = require('./routes/stadiumRoutes'); 
const adminRoutes = require('./routes/adminRoutes'); 
const productsRoute = require('./routes/productsRoute');
const BookingRoutes=require(`./routes/BookingRoutes`)
const stripe = require('stripe')('sk_test_51OFEgrGROfSjwnSRPJAx7TNHX9OLkJDGMAZGz9erdBAKxhhpASVfzwdrOWtgjXASyPEAsO5n8WPVhoMNMZKDnQpI00VTEQPxcd');
const stripeApiEndpoint = 'https://api.stripe.com/v1/payment_intents'; 

const retrievedArray = JSON.parse(imagesString);
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(cors());
// Initialize Firebase
const { initializeApp } = require("firebase/app");
const firebaseConfig = {
  apiKey: "AIzaSyCeNNeNQ4Ec7rezMUKd_PyiOX7pESvh8tA",
  authDomain: "football-626b1.firebaseapp.com",
  projectId: "football-626b1",
  storageBucket: "football-626b1.appspot.com",
  messagingSenderId: "1019343220790",
  appId: "1:1019343220790:web:0fe1482e424a9b5df0a897"
};

const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp);

const memoryStorage = multer.memoryStorage();
const upload = multer({ storage: memoryStorage });
const uploadPath = 'C:/Users/Orange/Desktop/masterpiece/masterpiece/images'; 
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

app.use(bodyParser.json());
const pool = new Pool({
  user: 'postgres',
  password: '123',
  host: 'localhost',
  port: 5432,
  database: 'football',
});


// Middleware
app.use(cors()); 
app.use(bodyParser.json());

// Routes
app.use('/', userRoutes);
app.use('/', contactsRoutes);
app.use('/', adminRoutes); 
app.use('/', productsRoute);
app.use('/', stadiumRoutes);
app.use('/',BookingRoutes)

// // Middleware للتحقق من التوكن
function authenticateToken(req, res, next) {
  const token = req.header('Authorization') && req.header('Authorization').replace('Bearer ', '');
// console.log(token);
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(token, secretKey);

    if (decoded.is_deleted) {
      return res.status(401).json({ message: 'User account has been deleted' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}


function authenticateAdminToken(req, res, next) {
    const token = req.header('Authorization');
    
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
  
    try {
      const decoded = jwt.verify(token, secretKey);
      
      if (decoded.user_role !== "1") {
        return res.status(403).json({ message: 'Forbidden, admin access required' });
      }
  
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  }
  
 
  // تمديد حجز الملعب
  app.put('/extend-booking/:booking_id', authenticateToken, async (req, res) => {
    const { booking_id } = req.params;
    const { start_time, end_time } = req.body;
  
    try {
      // التحقق من وجود الحجز والتحقق من أن الحجز للمستخدم الحالي
      const result = await pool.query(
        'UPDATE bookings SET start_time = $1::time, end_time = $2::time WHERE booking_id = $3 AND user_id = $4 RETURNING *',
        [start_time, end_time, booking_id, req.user.user_id]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Booking not found or unauthorized' });
      }
  
      res.json({ message: 'Booking extended successfully', booking: result.rows[0] });
    } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.put('/cancelBooking/:booking_id', authenticateToken, async (req, res) => {
    const { booking_id } = req.params;

    try {
        const result = await pool.query(
            'UPDATE bookings SET deleted = true WHERE booking_id = $1 AND user_id = $2 RETURNING *',
            [booking_id, req.user.user_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Booking not found or unauthorized' });
        }

        res.json({ message: 'Booking canceled successfully', booking: result.rows[0] });
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


/////////////////////////// add comment & rete ////////////////////////////////////////////////////////////
// إضافة تقييم وتعليق
app.post('/add-review', authenticateToken, async (req, res) => {
  const { stadium_id, rating, comment } = req.body;
  const { user_id } = req.user;

  try {
    // التحقق من وجود تقييم سابق للمستخدم على هذا الملعب
    const existingReviewResult = await pool.query(
      'SELECT * FROM stadium_reviews WHERE stadium_id = $1 AND user_id = $2',
      [stadium_id, user_id]
    );

    if (existingReviewResult.rows.length === 0) {
      // إذا لم يكن هناك تقييم سابق، أقم بإضافة تقييم جديد
      const result = await pool.query(
        'INSERT INTO stadium_reviews (stadium_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
        [stadium_id, user_id, rating, comment]
      );

      res.json({ message: 'Review added successfully', review: result.rows[0] });
    } else {
      // إذا كان هناك تقييم سابق، قم بتحديثه
      const result = await pool.query(
        'UPDATE stadium_reviews SET rating = $1, comment = $2 WHERE stadium_id = $3 AND user_id = $4 RETURNING *',
        [rating, comment, stadium_id, user_id]
      );

      res.json({ message: 'Review updated successfully', review: result.rows[0] });
    }
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


//////////////////////////////////////////////////////////////////////////////////////////////////////////////





/////////////////////////////////////////payment////////////////////////////////////////////////////////////////////
app.post('/payment', authenticateToken, async (req, res) => {
  try {
    const { user_id, email, name } = req.user;

    // Create a Stripe customer
    const customer = await stripe.customers.create({
      email,
      name,
    });

    // Create a PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: req.body.currency || "USD",
      customer: customer.id,
    });
    const updateStatusQuery = 'UPDATE stadiums SET approval_status = $1 WHERE owner_id = $2 AND approval_status = $3 RETURNING approval_status';
    const updatedStatus = await pool.query(updateStatusQuery, ['approved', user_id, 'pending']);

    const updateUserRoleQuery = 'UPDATE users SET user_role = $1 WHERE user_id = $2 RETURNING user_role';
    const updatedUserRole = await pool.query(updateUserRoleQuery, [2, user_id]);

    const updateBookingQuery = 'UPDATE bookings SET status = $1, payment_method = $2 WHERE booking_id = $3 RETURNING *';
    const updatedBooking = await pool.query(updateBookingQuery, ['approved', 'stripe', req.body.booking_id]);

    // Insert payment details into the payments table
    const insertPaymentQuery = `
      INSERT INTO payments (user_id, stadium_id, booking_id, payment_amount, payment_date)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`;

    const paymentResult = await pool.query(insertPaymentQuery, [
      user_id,
      req.body.stadium_id,
      req.body.booking_id,
      req.body.amount,
      new Date()
    ]);

    // Return success response
    res.status(200).json({
      success: true,
      message: 'Payment processed successfully',
      updatedStatus: updatedStatus.rows[0],
      updatedUserRole: updatedUserRole.rows[0],
      updatedBooking: updatedBooking.rows[0],
      paymentResult: paymentResult.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while processing payment' });
  }
});
;
app.get('/create-checkout-session', async function getPayment(req, res){
  try{
      // const userID = req.user.id;
      // const allOrders = await Order.findAll({
      //     where : {
      //         user_order_id : userID,
      //         is_deleted : false,
      //         is_payed : false,
      //     }
      // });
      // let total = 0;
      let items = [];
      for (let i = 0; i < 1; i++){
          // total = total + (allOrders[i].order_price * allOrders[i].order_count);
          // let theProduct = await Products.findByPk(allOrders[i].product_order_id);
          // console.log(allOrders[i].order_price)
          items.push({
              price_data : {
                  currency : "usd",
                  product_data : {
                      name : `name of the product from tha array`,
                      // images : [theProduct.img_url],
                      description : `description for all the products from the array`,
                  },
                  unit_amount : `1110`,
              },
              quantity: 5,
          })
      };
      const successUrl = `http://localhost:3000/`;
      const cancelUrl = `http://localhost:3000/not`;
  const session = await stripe.checkout.sessions.create({
      line_items : items,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    res.send(session.url);
  }catch(error){
      console.log(error);
      res.status(500).json('error in payment controller')
  }
})

app.post('/order', authenticateToken, async (req, res) => {
  const { cart_id } = req.body;
  const { user_id } = req.user;

  try {
    const cartResult = await pool.query('SELECT * FROM cart WHERE user_id = $1 AND cart_id = $2', [user_id, cart_id]);

    if (cartResult.rows.length === 0) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const cartItem = cartResult.rows[0];
    
    // إضافة العناصر من السلة إلى جدول الطلبات
    await pool.query(
      `INSERT INTO orders (user_id, product_id, quantity, total_price, created_at)
        VALUES ($1, $2, $3, $4, current_timestamp)`,
      [user_id, cartItem.product_id, cartItem.quantity, cartItem.total_price]
    );

    // حذف العنصر من جدول السلة بعد إكمال الشراء
    await pool.query('DELETE FROM cart WHERE cart_id = $1', [cart_id]);

    res.json({ message: 'Purchase completed successfully' });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.get('/view-products', async (req, res) => {
  try {
      const result = await pool.query('SELECT * FROM products WHERE deleted = false');
      res.json({ message: 'Products retrieved successfully', products: result.rows });
  } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/wishlist/:entry_id', authenticateToken, async (req, res) => {
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
});


/////////////////////////// add comment & rete ////////////////////////////////////////////////////////////
// الطلب للحصول على متوسط التقييم وتحديثه في جدول الاستعراضات
app.post('/add-review', authenticateToken, async (req, res) => {
  const { stadium_id, rating, comment } = req.body;
  const { user_id } = req.user;

  try {
    // التحقق من وجود تقييم سابق للمستخدم على هذا الملعب
    const existingReviewResult = await pool.query(
      'SELECT * FROM stadium_reviews WHERE stadium_id = $1 AND user_id = $2',
      [stadium_id, user_id]
    );

    if (rating >= 1 && rating <= 5) {
      if (existingReviewResult.rows.length === 0) {
        // إذا لم يكن هناك تقييم سابق، أقم بإضافة تقييم جديد
        const result = await pool.query(
          'INSERT INTO stadium_reviews (stadium_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
          [stadium_id, user_id, rating, comment]
        );

        // حساب متوسط التقييم وتحديثه في جدول الاستعراضات
        await updateAverageRating(stadium_id);

        res.json({ message: 'Review added successfully', review: result.rows[0] });
      } else {
        // إذا كان هناك تقييم سابق، قم بتحديثه
        const result = await pool.query(
          'UPDATE stadium_reviews SET rating = $1, comment = $2 WHERE stadium_id = $3 AND user_id = $4 RETURNING *',
          [rating, comment, stadium_id, user_id]
        );

        // حساب متوسط التقييم وتحديثه في جدول الاستعراضات
        await updateAverageRating(stadium_id);

        res.json({ message: 'Review updated successfully', review: result.rows[0] });
      }
    } else {
      res.status(400).json({ message: 'Invalid rating. Rating must be between 1 and 5.' });
    }
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// function for avg 
async function updateAverageRating(stadiumId) {
  try {
    const result = await pool.query(
      'UPDATE stadium_reviews SET average_rating = (SELECT AVG(rating) FROM stadium_reviews WHERE stadium_id = $1) WHERE stadium_id = $1',
      [stadiumId]
    );
  } catch (error) {
    console.error('Error updating average rating', error);
  }
}

// get reviwe and comments for stadium 
app.get('/stadium-reviews/:stadium_id', async (req, res) => {
  const stadiumId = req.params.stadium_id;

  try {
    const averageRatingResult = await pool.query(
      'SELECT AVG(rating) as average_rating FROM stadium_reviews WHERE stadium_id = $1',
      [stadiumId]
    );

    const averageRating = averageRatingResult.rows[0]?.average_rating || 0;

    const commentsResult = await pool.query(
      'SELECT * FROM stadium_reviews WHERE stadium_id = $1',
      [stadiumId]
    );

    const comments = commentsResult.rows;

    res.json({ averageRating, comments });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.post('/create-payment-intent', async (req, res) => {
  const { amount, currency } = req.body;

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).send({ error: 'Failed to create payment intent' });
  }
});
/////////////////////////////////////////////////////////////////////////////
app.listen(2000, () => {
  console.log("server running at http://localhost:2000");
});
module.exports = app;