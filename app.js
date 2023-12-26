// const express = require('express');
// const jwt = require('jsonwebtoken');
// const bodyParser = require('body-parser');
// const bcrypt = require('bcrypt');
// const { Pool } = require('pg');
// const nodemailer = require('nodemailer');
// const multer = require('multer');
// const cors = require('cors');
// const app = express();
// const secretKey = 'your_secret_key';
// app.use(bodyParser.json());
// app.use(cors());
// app.use(express.json());


// const pool = new Pool({
//   user: 'postgres',
//   password: '1234',
//   host: 'localhost',
//   port: 5432,
//   database: 'footbolai',
// });

// // Move the storage definition above the multer middleware creation
// // const storage = multer.diskStorage({
// //   destination: function (req, file, cb) {
// //     cb(null, 'C:/Users/Orange/Desktop/Futbolia/src/images');
// //   },
// //   filename: function (req, file, cb) {
// //     cb(null, file.originalname);
// //   },
// // });

// // const upload = multer({ storage: storage });
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'C:/Users/Orange/Desktop/Futbolia/src/images'); // Adjust the destination folder as needed
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + '-' + file.originalname);
//   },
// });

// const upload = multer({ storage: storage });

// app.use(express.json());
// ///////////////////////////////////////////// USERS ///////////////////////////////////////////////////////////
// app.post('/login', async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const result = await pool.query('SELECT * FROM users WHERE email = $1 AND is_deleted = false', [email]);

//     if (result.rows.length === 0) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }
//     const user = result.rows[0];
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }
//     const token = jwt.sign({ user_id: user.user_id, email: user.email, user_role: user.user_role }, secretKey, { expiresIn: '10d' });
//     res.json({ token });
//   } catch (error) {
//     console.error('Error executing query', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// app.post('/register', async (req, res) => {
//     const { full_name, email, password, phone } = req.body;
//     const user_role = 3; 
  
//     try {
//       const emailExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
//       if (emailExists.rows.length > 0) {
//         return res.status(400).json({ message: 'Email already exists' });
//       }
  
//       const hashedPassword = await bcrypt.hash(password, 10);
  
//       const result = await pool.query('INSERT INTO users (full_name, email, password, phone, user_role, is_deleted) VALUES ($1, $2, $3, $4, $5, false) RETURNING *', [full_name, email, hashedPassword, phone, user_role]);

//       res.json({ message: 'User registered successfully' });
//     } catch (error) {
//       console.error('Error executing query', error);

//       res.status(500).json({ message: 'Internal server error' });
//     }
//   });

// app.get('/puser', authenticateToken, async (req, res) => {
//   const { user_id } = req.user;

//   try {
//     const userResult = await pool.query('SELECT * FROM users WHERE user_id = $1 AND is_deleted = false', [user_id]);

//     if (userResult.rows.length === 0) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     res.json({ message: 'User profile retrieved successfully', user: userResult.rows[0] });
//   } catch (error) {
//     console.error('Error executing query', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });
// // إضافة صورة إلى مستخدم باستخدام Multer
// app.post('/upload-upic', authenticateToken, upload.single('image'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: 'لم يتم تحميل ملف.' });
//     }

//     const imageData = req.file.filename; 

//     const updateResult = await pool.query('UPDATE users SET pic_user = $1 WHERE user_id = $2 RETURNING *', [imageData, req.user.user_id]);

//     if (updateResult.rows.length === 0) {
//       return res.status(500).json({ message: 'فشل في تحديث صورة المستخدم.' });
//     }

//     res.json({ message: 'تمت إضافة صورة المستخدم بنجاح', user: updateResult.rows[0] });
//   } catch (error) {
//     console.error('حدث خطأ أثناء تنفيذ الاستعلام', error);
//     res.status(500).json({ message: 'خطأ في الخادم الداخلي' });
//   }
// });
// app.put('/update-user', authenticateToken, async (req, res) => {
//   const { full_name, email } = req.body;
//   const { user_id } = req.user; 

//   try {
//     const userExists = await pool.query('SELECT * FROM users WHERE user_id = $1 AND is_deleted = false', [user_id]);

//     if (userExists.rows.length === 0) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const result = await pool.query('UPDATE users SET full_name = $1, email = $2 WHERE user_id = $3 RETURNING *', [full_name, email, user_id]);

//     res.json({ message: 'User updated successfully', user: result.rows[0] });
//   } catch (error) {
//     console.error('Error executing query', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });


// // Soft Delete للمستخدم
// app.delete('/delete-user', authenticateToken, async (req, res) => {
//   const { user_id } = req.user;

//   try {
//     const result = await pool.query('UPDATE users SET is_deleted = true WHERE user_id = $1 RETURNING *', [user_id]);

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     res.json({ message: 'User deleted successfully' });
//   } catch (error) {
//     console.error('Error executing query', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// // Middleware للتحقق من التوكن
// function authenticateToken(req, res, next) {
//   const token = req.header('Authorization') && req.header('Authorization').replace('Bearer ', '');
// console.log(token);
//   if (!token) {
//     return res.status(401).json({ message: 'Unauthorized' });
//   }

//   try {
//     const decoded = jwt.verify(token, secretKey);

//     if (decoded.is_deleted) {
//       return res.status(401).json({ message: 'User account has been deleted' });
//     }

//     req.user = decoded;
//     next();
//   } catch (error) {
//     return res.status(401).json({ message: 'Invalid token' });
//   }
// }

// // Logout
// app.post('/logout', (req, res) => {
//   res.clearCookie('token');
//   res.json({ message: 'Logout successful' });
// });
// /////////////////////////////////////////// ADMIN////////////////////////////////////////////////////////
// // تسجيل مستخدم جديد للأدمن
// app.post('/register-admin', async (req, res) => {
//     const { full_name, email, password, phone } = req.body;
  
//     try {
//       // التحقق مما إذا كان البريد الإلكتروني مسجل من قبل
//       const emailExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  
//       if (emailExists.rows.length > 0) {
//         return res.status(400).json({ message: 'Email already exists' });
//       }
  
//       const hashedPassword = await bcrypt.hash(password, 10);
  
//       const result = await pool.query('INSERT INTO users (full_name, email, password, phone, user_role, is_deleted) VALUES ($1, $2, $3, $4, $5, false) RETURNING *', [full_name, email, hashedPassword, phone, 1]);
  
//       res.json({ message: 'Admin registered successfully', admin: result.rows[0] });
//     } catch (error) {
//       console.error('Error executing query', error);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   });
//   /////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//   // تسجيل دخول الأدمن
//   app.post('/admin-login', async (req, res) => {
//     const { email, password } = req.body;
  
//     try {
//       const result = await pool.query('SELECT * FROM users WHERE email = $1 AND user_role = $2', [email, 1]);
  
//       if (result.rows.length === 0) {
//         return res.status(401).json({ message: 'Invalid credentials' });
//       }
  
//       const admin = result.rows[0];
  
//       const isPasswordValid = await bcrypt.compare(password, admin.password);
  
//       if (!isPasswordValid) {
//         return res.status(401).json({ message: 'Invalid credentials' });
//       }
  
//       const token = jwt.sign({ userId: admin.user_id, email: admin.email, user_role: admin.user_role }, secretKey, { expiresIn: '10d' });
  
//       res.json({ message: 'Admin logged in successfully', token: token });
//     } catch (error) {
//       console.error('Error executing query', error);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   });
  
//   // عرض طلبات الملعب
//   app.get('/stadium-requests', authenticateAdminToken, async (req, res) => {
//     try {
//     const result = await pool.query('SELECT * FROM stadiums WHERE approval_status = $1', ['pending']);
//     // const result = await pool.query('SELECT * FROM stadiums');

//       res.json({ message: 'Stadium requests retrieved successfully', requests: result.rows });
//     } catch (error) {
//       console.error('Error executing query', error);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   });
  
//  // الموافقة أو الرفض على طلب ملعب
// app.put('/approve-stadium-request/:stadium_id', authenticateAdminToken, async (req, res) => {
//     const { stadium_id } = req.params;
  
//     try {
//       const result = await pool.query('UPDATE stadiums SET approval_status = $1 WHERE stadium_id = $2 RETURNING *', ['approved', stadium_id]);
  
//       if (result.rows.length === 0) {
//         return res.status(404).json({ message: 'Stadium not found' });
//       }
  
//       // تحديث رقم الرول للمستخدم إلى 2 (owner)
//       const updateUserResult = await pool.query('UPDATE users SET user_role = $1 WHERE user_id = $2 RETURNING *', [2, result.rows[0].owner_id]);
  
//       if (updateUserResult.rows.length === 0) {
//         return res.status(500).json({ message: 'Error updating user role' });
//       }
  
//       res.json({ message: 'Stadium request approved successfully', stadium: result.rows[0] });
//     } catch (error) {
//       console.error('Error executing query', error);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   });
  
  
//   // حذف الملعب
//   app.delete('/delete-stadium/:stadium_id', authenticateAdminToken, async (req, res) => {
//     const { stadium_id } = req.params;
  
//     try {
//       const result = await pool.query('DELETE FROM stadiums WHERE stadium_id = $1 RETURNING *', [stadium_id]);
  
//       if (result.rows.length === 0) {
//         return res.status(404).json({ message: 'Stadium not found' });
//       }
  
//       res.json({ message: 'Stadium deleted successfully', stadium: result.rows[0] });
//     } catch (error) {
//       console.error('Error executing query', error);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   });
  
//   // حذف صاحب الملعب
//   app.delete('/delete-stadium-owner/:user_id', authenticateAdminToken, async (req, res) => {
//     const { user_id } = req.params;
  
//     try {
//       const result = await pool.query('DELETE FROM users WHERE user_id = $1 RETURNING *', [user_id]);
  
//       if (result.rows.length === 0) {
//         return res.status(404).json({ message: 'User not found' });
//       }
  
//       res.json({ message: 'User deleted successfully', user: result.rows[0] });
//     } catch (error) {
//       console.error('Error executing query', error);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   });
  
  
// // Middleware للتحقق من توكن الأدمن
// function authenticateAdminToken(req, res, next) {
//     const token = req.header('Authorization');
    
//     if (!token) {
//       return res.status(401).json({ message: 'Unauthorized' });
//     }
  
//     try {
//       const decoded = jwt.verify(token, secretKey);
      
//       if (decoded.user_role !== "1") {
//         return res.status(403).json({ message: 'Forbidden, admin access required' });
//       }
  
//       req.user = decoded;
//       next();
//     } catch (error) {
//       return res.status(401).json({ message: 'Invalid token' });
//     }
//   }
  
  
//   ///////////////////////////////////////////STAD/////////////////////////////////////////////////////////////////
  
// // إضافة ملعب جديد

// // app.post('/add-stadium', authenticateToken, async (req, res) => {
// //   const { name, city, location, size, hourly_rate, description, phone, start_time, end_time } = req.body;
// //   const { user_id } = req.user;

// //   try {
// //     const result = await pool.query(
// //       'INSERT INTO stadiums (name, city, location, size, hourly_rate, description, owner_id, approval_status, phone, start_time, end_time, delet) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, false) RETURNING *',
// //       [name, city, location, size, hourly_rate, description, user_id, 'pending', phone, start_time, end_time]

// //     );

// //     return res.status(201).json({ message: 'Stadium request added successfully', stadium: result.rows[0] });
// //   } catch (error) {
// //     console.error('Error executing query', error);
// //     res.status(500).json({ message: 'Internal server error' });
// //   }
// // });


// app.post('/add-stadium', authenticateToken, upload.array('images', 5), async (req, res) => {
//   const { name, city, location, size, hourly_rate, description, phone, start_time, end_time } = req.body;
//   const { user_id } = req.user;

//   try {
//     const result = await pool.query(
//       'INSERT INTO stadiums (name, city, location, size, hourly_rate, description, owner_id, approval_status, phone, start_time, end_time, delet) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, false) RETURNING *',
//       [name, city, location, size, hourly_rate, description, user_id, 'pending', phone, start_time, end_time]
//     );

//     // Update the field name to match the Multer configuration
//     const images_url = req.files.map((file) => `/images_url/${file.filename}`);

//     return res.status(201).json({ message: 'Stadium request added successfully', stadium: result.rows[0], images_url });
//   } catch (error) {
//     console.error('Error executing query', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });







//   ////////////////////////////////////////// BOOKING ////////////////////////////////////////////////////////////
//   app.post('/book-stadium', authenticateToken, async (req, res) => {
//     const { stadium_id, start_time, end_time, booking_date,note,phone} = req.body.formData;
//     const { user_id } = req.user;
//     console.log(req.body.formData);
  
//     try {
//       // التحقق من توفر الملعب والتحقق من عدم وجود تعارض في الحجز
//       const conflictCheck = await pool.query(
//         'SELECT * FROM bookings WHERE stadium_id = $1 AND booking_date = $2 AND ((start_time >= $3 AND start_time < $4) OR (end_time > $3 AND end_time <= $4))',
//         [stadium_id, booking_date, start_time, end_time]
//       );
  
//       if (conflictCheck.rows.length > 0) {
//         return res.status(400).json({ message: 'Stadium is already booked during this period' });
//       }
  
//       // قم بإضافة الحجز
//       const result = await pool.query(
//         'INSERT INTO bookings (stadium_id, user_id, start_time, end_time, booking_date,note,phone) VALUES ($1, $2, $3::time, $4::time, $5,$6,$7) RETURNING *',
//         [stadium_id, user_id, start_time, end_time, booking_date,note,phone]
//       );
  
//       res.json({ message: 'Stadium booked successfully', booking: result.rows[0] });
//     } catch (error) {
//       console.error('Error executing query', error);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   });

//   ///////////////////////////////////////////////////////////////////////////////////////////////////////////
//   // تمديد حجز الملعب
//   app.put('/extend-booking/:booking_id', authenticateToken, async (req, res) => {
//     const { booking_id } = req.params;
//     const { start_time, end_time } = req.body;
  
//     try {
//       // التحقق من وجود الحجز والتحقق من أن الحجز للمستخدم الحالي
//       const result = await pool.query(
//         'UPDATE bookings SET start_time = $1::time, end_time = $2::time WHERE booking_id = $3 AND user_id = $4 RETURNING *',
//         [start_time, end_time, booking_id, req.user.user_id]
//       );
  
//       if (result.rows.length === 0) {
//         return res.status(404).json({ message: 'Booking not found or unauthorized' });
//       }
  
//       res.json({ message: 'Booking extended successfully', booking: result.rows[0] });
//     } catch (error) {
//       console.error('Error executing query', error);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   });
  
//   //////////////////////////////////////////////////////////////////////////////////////////////////////////////
// // إضافة صورة إلى مستخدم باستخدام Multer
// app.post('/upload-upic', authenticateToken, upload.single('image'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: 'لم يتم تحميل ملف.' });
//     }

//     const imageData = req.file.filename; 

//     const updateResult = await pool.query('UPDATE users SET pic_user = $1 WHERE user_id = $2 RETURNING *', [imageData, req.user.user_id]);

//     if (updateResult.rows.length === 0) {
//       return res.status(500).json({ message: 'فشل في تحديث صورة المستخدم.' });
//     }

//     res.json({ message: 'تمت إضافة صورة المستخدم بنجاح', user: updateResult.rows[0] });
//   } catch (error) {
//     console.error('حدث خطأ أثناء تنفيذ الاستعلام', error);
//     res.status(500).json({ message: 'خطأ في الخادم الداخلي' });
//   }
// });
// // استرجاع بيانات المستخدم وحجوزاته
// app.get('/user-profile', authenticateToken, async (req, res) => {
//   const { user_id } = req.user;

//   try {
//       // استرجاع بيانات المستخدم
//       const userResult = await pool.query('SELECT * FROM users WHERE user_id = $1 AND is_deleted = false', [user_id]);

//       if (userResult.rows.length === 0) {
//           return res.status(404).json({ message: 'User not found' });
//       }

//       const userData = userResult.rows[0];

//       // استرجاع حجوزات المستخدم
//       const bookingsResult = await pool.query('SELECT * FROM bookings WHERE user_id = $1', [user_id]);

//       res.json({ user: userData, bookings: bookingsResult.rows });
//   } catch (error) {
//       console.error('Error executing query', error);
//       res.status(500).json({ message: 'Internal server error' });
//   }
// });

// // تحديث بيانات المستخدم
// app.put('/update-user', authenticateToken, async (req, res) => {
//   const { full_name, email, phone } = req.body;
//   const { user_id } = req.user; 

//   try {
//     const userExists = await pool.query('SELECT * FROM users WHERE user_id = $1 AND is_deleted = false', [user_id]);

//     if (userExists.rows.length === 0) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const result = await pool.query('UPDATE users SET full_name = $1, email = $2, phone = $3 WHERE user_id = $4 RETURNING *', [full_name, email, phone, user_id]);

//     res.json({ message: 'User updated successfully', user: result.rows[0] });
//   } catch (error) {
//     console.error('Error executing query', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });
// /////////////////////////// add comment & rete ////////////////////////////////////////////////////////////
// // إضافة تقييم وتعليق
// app.post('/add-review', authenticateToken, async (req, res) => {
//   const { stadium_id, rating, comment } = req.body;
//   const { user_id } = req.user;

//   try {
//     // التحقق من وجود تقييم سابق للمستخدم على هذا الملعب
//     const existingReviewResult = await pool.query(
//       'SELECT * FROM stadium_reviews WHERE stadium_id = $1 AND user_id = $2',
//       [stadium_id, user_id]
//     );

//     if (existingReviewResult.rows.length === 0) {
//       // إذا لم يكن هناك تقييم سابق، أقم بإضافة تقييم جديد
//       const result = await pool.query(
//         'INSERT INTO stadium_reviews (stadium_id, user_id, rating, comment) VALUES ($1, $2, $3, $4) RETURNING *',
//         [stadium_id, user_id, rating, comment]
//       );

//       res.json({ message: 'Review added successfully', review: result.rows[0] });
//     } else {
//       // إذا كان هناك تقييم سابق، قم بتحديثه
//       const result = await pool.query(
//         'UPDATE stadium_reviews SET rating = $1, comment = $2 WHERE stadium_id = $3 AND user_id = $4 RETURNING *',
//         [rating, comment, stadium_id, user_id]
//       );

//       res.json({ message: 'Review updated successfully', review: result.rows[0] });
//     }
//   } catch (error) {
//     console.error('Error executing query', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// app.get('/user-reviews', authenticateToken, async (req, res) => {
//   const { user_id } = req.user;

//   try {
//     // Retrieve reviews for the authenticated user
//     const reviewsResult = await pool.query(
//       'SELECT stadium_id, rating, comment FROM stadium_reviews WHERE user_id = $1',
//       [user_id]
//     );

//     // Send the reviews as the response
//     res.json({ reviews: reviewsResult.rows });
//   } catch (error) {
//     console.error('Error executing query', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// //////////////////////////////////////////////////////////////////////////////////////////////////////////////
// // Configure Nodemailer transporter
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: 'nedalraed55@gmail.com',
//     pass: 'rzwykxqmyisuvwuc',
//   },
// });

// app.use(express.json());

// // Endpoint for handling contact form submissions
// app.post('/contact', async (req, res) => {
//   const { name, email, message } = req.body;

//   try {
//     // Log the received data
//     console.log('Received contact form submission:', { name, email, message });

//     // Validate the form data if needed

//     // Configure email options
//     const mailOptions = {
//       from: 'nedalraed55@gmail.com',
//       to: email,
//       subject: 'Subject for the email',
//       text: 'Thank you for your message',
//     };

//     // Send the email
//     transporter.sendMail(mailOptions, function (error, info) {
//       if (error) {
//         console.error('Error sending email', error);

//         // Log the error on the server
//         res.status(500).json({ message: 'Failed to send email', error: error.message });
//       } else {
//         console.log('Email sent:', info.response);
//         res.json({ message: 'Email sent successfully' });
//       }
//     });
//   } catch (error) {
//     console.error('Error processing contact form', error);

//     // Log the error on the server
//     res.status(500).json({ message: 'Internal server error', error: error.message });
//   }
// });
// /////////////////////////////////////////////////////////////////////////////
// const stripe = require("stripe")("sk_test_51OGgPBGQpG0LBUoZ6LIKxJhKwK4syOUFCRtPE1xFDtHor5jCRVBHoeVmoVkrCUxU6nCCw9l74cqDeJxj1PygxH3T00p8lOG0Eh");
// app.post("/Payment", cors(), async (req, res) => {
//   let { amount, id } = req.body;
//   try {
//     const payment = await stripe.paymentIntents.create({
//       amount,
//       currency: "USD",
//       description: "Spatula company",
//       payment_method: id,
//       confirm: true,
//       return_url: "http://localhost:2000/",
//     });
//     console.log("Payment", payment);
//     res.json({
//       message: "Payment successful",
//       success: true,
//     });
//   } catch (error) {
//     console.log("Error", error);
//     res.json({
//       message: "Payment failed",
//       success: false,
//     });
//   }
// });
// // app.post('/Payment', async (req, res) => {
// //   const { amount, id } = req.body;

// //   try {
// //     const paymentIntent = await stripe.paymentIntents.create({
// //       amount,
// //       currency: 'usd',
// //       description: 'Example Payment',
// //       payment_method: id,
// //       confirm: true,
// //     });

// //     console.log('PaymentIntent:', paymentIntent);

// //     return res.status(200).json({ success: true });
// //   } catch (error) {
// //     console.error('Error:', error);
// //     return res.status(500).json({ success: false, error: error.message });
// //   }
// // });
// /////////////////////////////////////////////////////////////////////////////
// app.listen(2000, () => {
//   console.log("server running at http://localhost:2000");
// });
// module.exports = app;






const express = require('express');
const jwt = require('jsonwebtoken');
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
app.use(express.json());



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
  password: '1234',
  host: 'localhost',
  port: 5432,
  database: 'footbal',
});

///////////////////////////////////////////// USERS ///////////////////////////////////////////////////////////
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
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
});

app.post('/register', async (req, res) => {
  const { full_name, email, password, phone } = req.body;
  const user_role = 3;

  try {
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
});

app.get('/user-profile', authenticateToken, async (req, res) => {
  const { user_id } = req.user;

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE user_id = $1 AND is_deleted = false', [user_id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = userResult.rows[0];

    let imageBuffer;
    if (user.pic_user) {
      const imageRef = ref(storage, user.pic_user);
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
});


app.post('/upload-upic', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'لم يتم تحميل ملف.' });
    }

    const fileBuffer = req.file.buffer;
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileExtension = 'jpeg';

    const fileName = `image-${uniqueSuffix}.${fileExtension}`;
    const storageRef = ref(storage, fileName);
    await uploadBytes(storageRef, fileBuffer);

    // Save the image reference in the database
    const imageUrl = await getDownloadURL(storageRef);
    const { user_id } = req.user;

    // Update the 'pic_user' column in the 'users' table
    const updateResult = await pool.query('UPDATE users SET pic_user = $1 WHERE user_id = $2 RETURNING *', [imageUrl, user_id]);

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send the image URL in the response
    res.json({ message: 'Image uploaded and database updated successfully', imageUrl });
  } catch (error) {
    console.error(' Error executing query', error);
    res.status(500).json({ message: 'خطInternal server error', error: error.message });
  }
});

//deactive user 
app.delete('/delete-user', authenticateToken, async (req, res) => {
  const { user_id } = req.user;

  try {
    const result = await pool.query('UPDATE users SET is_deleted = true WHERE user_id = $1 RETURNING *', [user_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Middleware للتحقق من التوكن
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



// تحديث بيانات المستخدم
app.put('/update-user', authenticateToken, async (req, res) => {
  const { full_name, email, phone } = req.body;
  const { user_id } = req.user; 

  try {
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
});

// Logout
app.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logout successful' });
});
/////////////////////////////////////////// ADMIN////////////////////////////////////////////////////////
// تسجيل مستخدم جديد للأدمن
app.post('/register-admin', async (req, res) => {
    const { full_name, email, password, phone } = req.body;
  
    try {
      // التحقق مما إذا كان البريد الإلكتروني مسجل من قبل
      const emailExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  
      if (emailExists.rows.length > 0) {
        return res.status(400).json({ message: 'Email already exists' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const result = await pool.query('INSERT INTO users (full_name, email, password, phone, user_role, is_deleted) VALUES ($1, $2, $3, $4, $5, false) RETURNING *', [full_name, email, hashedPassword, phone, 1]);
  
      res.json({ message: 'Admin registered successfully', admin: result.rows[0] });
    } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });


  // تسجيل دخول الأدمن
  app.post('/admin-login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const result = await pool.query('SELECT * FROM users WHERE email = $1 AND user_role = $2', [email, 1]);
  
      if (result.rows.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      const admin = result.rows[0];
  
      const isPasswordValid = await bcrypt.compare(password, admin.password);
  
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
  
      const token = jwt.sign({ userId: admin.user_id, email: admin.email, user_role: admin.user_role }, secretKey, { expiresIn: '10d' });
  
      res.json({ message: 'Admin logged in successfully', token: token });
    } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  // عرض طلبات الملعب
  app.get('/stadium-requests', authenticateAdminToken, async (req, res) => {
    try {
    const result = await pool.query('SELECT * FROM stadiums WHERE approval_status = $1', ['pending']);
    // const result = await pool.query('SELECT * FROM stadiums');

      res.json({ message: 'Stadium requests retrieved successfully', requests: result.rows });
    } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
// الموافقة على طلب ملعب
app.put('/approve-stadium/:stadium_id', authenticateAdminToken, async (req, res) => {
  const { stadium_id } = req.params;

  try {
      const result = await pool.query('UPDATE stadiums SET approval_status = $1, deleted = $2 WHERE stadium_id = $3 RETURNING *', ['approved', false, stadium_id]);

      if (result.rows.length === 0) {
          return res.status(404).json({ message: 'Stadium not found' });
      }

      // تحديث رقم الرول للمستخدم إلى 2 (owner)
      const updateUserResult = await pool.query('UPDATE users SET user_role = $1 WHERE user_id = $2 RETURNING *', [2, result.rows[0].owner_id]);

      if (updateUserResult.rows.length === 0) {
          return res.status(500).json({ message: 'Error updating user role' });
      }

      res.json({ message: 'Stadium request approved successfully', stadium: result.rows[0] });
  } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

// رفض طلب ملعب
app.put('/reject-stadium/:stadium_id', authenticateAdminToken, async (req, res) => {
  const { stadium_id } = req.params;

  try {
      const result = await pool.query('UPDATE stadiums SET approval_status = $1, deleted = $2 WHERE stadium_id = $3 RETURNING *', ['rejected', true, stadium_id]);

      if (result.rows.length === 0) {
          return res.status(404).json({ message: 'Stadium not found' });
      }

      // يمكنك إضافة أي إجراءات إضافية هنا إذا كنت بحاجة إلى تحديث المستخدم أو أي شيء آخر

      res.json({ message: 'Stadium request rejected successfully', stadium: result.rows[0] });
  } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

  
  // حذف الملعب
app.delete('/delete-stadium/:stadium_id', authenticateAdminToken, async (req, res) => {
  const { stadium_id } = req.params;

  try {
    const result = await pool.query('DELETE FROM stadiums WHERE stadium_id = $1 RETURNING *', [stadium_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Stadium not found' });
    }

    res.json({ message: 'Stadium deleted successfully', stadium: result.rows[0] });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

  
  // حذف صاحب الملعب
  app.delete('/delete-stadium-owner/:user_id', authenticateAdminToken, async (req, res) => {
    const { user_id } = req.params;
  
    try {
      const result = await pool.query('DELETE FROM users WHERE user_id = $1 RETURNING *', [user_id]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.json({ message: 'User deleted successfully', user: result.rows[0] });
    } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  
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
  
  app.post('/add-product', authenticateAdminToken, upload.array('images', 5), async (req, res) => {
    const { type, name, description, price, categories, color, quantity,
        size_38, size_39, size_40, size_small, size_medium, size_large,
    } = req.body;
  
    try {
        let images = [];
  
        if (req.files && req.files.length > 0) {
            const storageRef = ref(storage, 'product-images');
  
            // رفع كل صورة إلى Firebase Storage
            for (const file of req.files) {
                try {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                    const fileExtension = path.extname(file.originalname);
                    const fileName = `images-${uniqueSuffix}${fileExtension}`;
                    const fileRef = ref(storageRef, fileName);
                    await uploadBytes(fileRef, file.buffer);
  
                    const downloadURL = await getDownloadURL(fileRef);
                    images.push(downloadURL);
                } catch (error) {
                    console.error('Error uploading image to Firebase Storage:', error);
                    return res.status(500).json({ message: 'Error uploading image to Firebase Storage' });
                }
            }
        }
  
        const result = await pool.query(
            `INSERT INTO products (type, name, description, price, categories, color, quantity, images, created_at, deleted, 
            size_38, size_39, size_40, size_small, size_medium, size_large)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, current_timestamp, false, $9, $10, $11, $12, $13, $14) RETURNING *`,
            [
                type, name, description, price, categories, color, quantity,
                images, // استخدم النص المنسق مباشرة
                size_38 === 'true', size_39 === 'true', size_40 === 'true',
                size_small === 'true', size_medium === 'true', size_large === 'true'
            ]
        );
  
        // تحديث الكمية في حال نجاح إدراج المنتج
        if (result.rows.length > 0) {
            const productId = result.rows[0].id_product;
            await pool.query(
                'UPDATE products SET quantity = $1 WHERE id_product = $2',
                [quantity, productId]
            );
            res.json({ message: 'Product added successfully', product: result.rows[0] });
        } else {
            return res.status(500).json({ message: 'Error adding product to the store' });
        }
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  
  // قم بإضافة هذه القطعة من الكود إلى ملف الخادم الخاص بك
  
  app.get('/products/:type?', async (req, res) => {
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
  });
  


  app.get('/all-stadiums',authenticateAdminToken, async (req, res) => {
    try {
      const { page = 1, pageSize = 20 } = req.query;
      const offset = (page - 1) * pageSize;
  
      const allStadiumsResult = await pool.query(
        'SELECT * FROM stadiums WHERE deleted = false LIMIT $1 OFFSET $2',
        [pageSize, offset]
      );
  
      res.json({ message: 'All stadiums retrieved successfully', stadiums: allStadiumsResult.rows });
    } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  app.post('/search', authenticateAdminToken, async (req, res) => {
    const { searchQuery } = req.body;
  
    try {
        const result = await performSearch(searchQuery);
  
        res.json({ message: 'Search results retrieved successfully', searchResults: result });
    } catch (error) {
        console.error('Error executing search query', error);
        res.status(500).json({ message: 'Internal server error during search' });
    }
  });
  
  async function performSearch(searchQuery) {
    // Use a regular expression to check if the search query is a numeric value
    const isNumeric = /^\d+$/.test(searchQuery);
  
    // Construct the SQL query dynamically based on whether the search query is numeric
    let usersQuery;
    if (isNumeric) {
        usersQuery = `
            SELECT *
            FROM users
            WHERE
                CAST(user_id AS TEXT) ILIKE $1 OR
                CAST(phone AS TEXT) ILIKE $1
        `;
    } else {
        usersQuery = 'SELECT * FROM users WHERE full_name ILIKE $1';
    }
  
    const usersResult = await pool.query(usersQuery, [`%${searchQuery}%`]);
  
    const stadiumsResult = await pool.query('SELECT * FROM stadiums WHERE name ILIKE $1', [`%${searchQuery}%`]);
  
    const bookingsResult = await pool.query(`
        SELECT
            b.booking_id,
            u.full_name,
            b.phone,
            b.start_time,
            b.end_time,
            b.note,
            b.status,
            EXTRACT(HOUR FROM (b.end_time - b.start_time)) AS total_hours
        FROM
            public.bookings b
        JOIN
            public.users u ON b.user_id = u.user_id
        WHERE
            u.full_name ILIKE $1 OR
            CAST(b.phone AS TEXT) ILIKE $1
    `, [`%${searchQuery}%`]);
  
    return {
        users: usersResult.rows,
        stadiums: stadiumsResult.rows,
        bookings: bookingsResult.rows,
    };
  }

  // //لاشخاص المحذوفين //
 
app.get('/Deleteduser', authenticateAdminToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT user_id, full_name FROM users WHERE is_deleted = true');

    res.json({users: result.rows });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/user-count', authenticateAdminToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM users WHERE is_deleted = false');

    res.json({ message: 'User count retrieved successfully', userCount: result.rows[0].count });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



app.get('/allusers', authenticateAdminToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT user_id, full_name, email, user_role FROM users WHERE is_deleted = false ORDER BY user_id'
    );

    res.json({ message: 'Users with "false" status retrieved successfully', users: result.rows });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.delete('/users/:user_id', async (req, res) => {
  const { user_id } = req.params;

  try {
    console.log(`Received DELETE request for user with ID: ${user_id}`);

    // Convert user_id to an integer to ensure it's treated correctly in the SQL query
    const userIdAsInt = parseInt(user_id, 10);

    if (isNaN(userIdAsInt)) {
      res.status(400).json({ message: 'Invalid user ID format' });
      return;
    }

    // Execute the DELETE query to delete the user using user_id
    const result = await pool.query('DELETE FROM users WHERE user_id = $1 RETURNING *', [userIdAsInt]);

    if (result.rows.length === 0) {
      // If the user is not found based on user_id
      res.status(404).json({ message: 'User not found' });
    } else {
      res.json({ message: 'User deleted successfully', deletedUser: result.rows[0] });
    }
  } catch (error) {
    console.error('Error executing DELETE query', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/allusers', async (req, res) => {
  try {
    const { full_name, email, user_role } = req.body;

    if (!full_name || !email || !user_role) {
      return res.status(400).json({ error: 'Please provide all required fields.' });
    }

    // Add the user to the database
    const newUser = await User.create({ full_name, email, user_role });

    res.status(201).json({ message: 'User added successfully!', user: newUser });
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});









app.get('/stadium-count/:status', authenticateAdminToken, async (req, res) => {
  const { status } = req.params;

  try {
    let query;
    switch (status) {
      case 'approved':
      case 'pending':
      case 'rejected':
        query = `SELECT COUNT(*) FROM stadiums WHERE approval_status = $1`;
        break;
      default:
        return res.status(400).json({ message: 'Invalid status parameter' });
    }

    const result = await pool.query(query, [status]);

    res.json({ message: 'Stadium count retrieved successfully', stadiumCount: result.rows[0].count });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// عرض معلومات الحجوزات للمشرفين فقط
app.get('/bookings-info', authenticateAdminToken, async (req, res) => {
  try {
    const { page = 1, pageSize = 20 } = req.query;
    const offset = (page - 1) * pageSize;
      const result = await pool.query(`
          SELECT
              b.booking_id,
              u.full_name,
              b.phone,
              b.start_time,
              b.end_time,
              b.note,
              b.status,
              EXTRACT(HOUR FROM (b.end_time - b.start_time)) AS total_hours
          FROM
              public.bookings b
          JOIN
              public.users u ON b.user_id = u.user_id;
      `);

      res.json({ message: 'Booking information retrieved successfully', bookings: result.rows });
  } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});


///////////////////////////super user //////////////////////////////////////////////////////////////////////
app.get('/stadium-bookings', authenticateToken, async (req, res) => {
  const { user_id } = req.user;

  try {
    // استرجاع حجوزات الملعب مع معلومات المستخدم والملعب
    const bookingsResult = await pool.query(`
      SELECT 
        bookings.booking_id,
        bookings.booking_date,
        bookings.start_time,
        bookings.end_time,
        bookings.note,
        stadiums.name AS stadium_name,
        users.full_name AS user_name,
        EXTRACT(EPOCH FROM (bookings.end_time - bookings.start_time))/3600 AS hours_booked
      FROM 
        bookings
      JOIN 
        stadiums ON bookings.stadium_id = stadiums.stadium_id
      JOIN 
        users ON bookings.user_id = users.user_id
      WHERE 
        stadiums.owner_id = $1
    `, [user_id]);

    res.json({ stadium_bookings: bookingsResult.rows });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
app.post('/approve-booking/:booking_id', authenticateToken, async (req, res) => {
  const { user_id } = req.user;
  const { booking_id } = req.params;

  try {
    // تحقق مما إذا كان المستخدم هو مالك الملعب
    const stadiumResult = await pool.query('SELECT owner_id FROM stadiums WHERE owner_id = $1', [user_id]);

    if (stadiumResult.rows.length === 0) {
      return res.status(403).json({ message: 'Unauthorized. You are not the owner of this stadium.' });
    }

    // قم بتحديث حالة الحجز إلى "approved" بدون التحقق من التضارب
    const updateResult = await pool.query('UPDATE bookings SET status = $1 WHERE booking_id = $2 RETURNING *', ['approved', booking_id]);

    res.json({ message: 'Booking approved successfully', booking: updateResult.rows[0] });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/reject-booking/:booking_id', authenticateToken, async (req, res) => {
  const { user_id } = req.user;
  const { booking_id } = req.params;

  try {
    const stadiumResult = await pool.query('SELECT owner_id FROM stadiums WHERE owner_id = $1', [user_id]);

    if (stadiumResult.rows.length === 0) {
      return res.status(403).json({ message: 'Unauthorized. You are not the owner of this stadium.' });
    }

    const bookingResult = await pool.query('SELECT * FROM bookings WHERE booking_id = $1', [booking_id]);

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = bookingResult.rows[0];

    // قم بتحديث حالة الحجز إلى "rejected" بدون التحقق من التضارب
    const updateResult = await pool.query('UPDATE bookings SET status = $1 WHERE booking_id = $2 RETURNING *', ['rejected', booking_id]);

    res.json({ message: 'Booking rejected successfully', booking: updateResult.rows[0] });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/book-stadium', authenticateToken, async (req, res) => {
  const { stadium_id, start_time, end_time, booking_date, note, phone, payment_method } = req.body;
  const { user_id } = req.user;

  try {
    // Check for conflicts in existing bookings
    const conflictCheck = await pool.query(
      'SELECT * FROM bookings WHERE stadium_id = $1 AND booking_date = $2 AND ((start_time >= $3 AND start_time < $4) OR (end_time > $3 AND end_time <= $4))',
      [stadium_id, booking_date, start_time, end_time]
    );

    if (conflictCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Stadium is already booked during this period' });
    }

    // Insert the new booking
    const result = await pool.query(
      'INSERT INTO bookings (stadium_id, user_id, start_time, end_time, booking_date, note, phone, status, payment_method) VALUES ($1, $2, $3::time, $4::time, $5, $6, $7, $8, $9) RETURNING *',
      [stadium_id, user_id, start_time, end_time, booking_date, note, phone, 'pending', payment_method]
    );

    res.json({ message: 'Booking request added successfully', booking: result.rows[0] });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//   ///////////////////////////////////////////STAD/////////////////////////////////////////////////////////////////
  // بوست لإضافة ملعب
  app.post('/add-stadium', authenticateToken, upload.array('images_url', 5), async (req, res) => {
    const { name, city, location, size, hourly_rate, description, phone, start_time, end_time } = req.body;
    const { user_id } = req.user;

    try {
        // Check for existing stadium name
        const existingStadium = await pool.query('SELECT * FROM stadiums WHERE name = $1', [name]);

        if (existingStadium.rows.length > 0) {
            return res.status(400).json({ message: 'Stadium name already exists' });
        }

        let formattedUrls = [];

        if (req.files && req.files.length > 0) {
            const storageRef = ref(storage, 'stadium-images');

            // Upload each image to Firebase Storage
            for (const file of req.files) {
                try {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                    const fileExtension = path.extname(file.originalname);
                    const fileName = `image-${uniqueSuffix}${fileExtension}`;
                    const fileRef = ref(storageRef, fileName);
                    await uploadBytes(fileRef, file.buffer);

                    const downloadURL = await getDownloadURL(fileRef);
                    formattedUrls.push(downloadURL);
                } catch (error) {
                    console.error('Error uploading image to Firebase Storage:', error);
                    return res.status(500).json({ message: 'Error uploading image to Firebase Storage' });
                }
            }
        }

        const result = await pool.query(
            'INSERT INTO stadiums (name, city, location, size, hourly_rate, description, owner_id, approval_status, images_url, phone, start_time, end_time, deleted) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, false) RETURNING *',
            [name, city, location, size, hourly_rate, description, user_id, 'pending', formattedUrls, phone, start_time, end_time]
        );

        res.status(201).json({ message: 'Stadium request added successfully', stadium: result.rows[0] });
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



app.get('/stadiums', async (req, res) => {
  try {
    const result = await pool.query('SELECT stadium_id, name, city, location, size, hourly_rate, description, owner_id, approval_status, images_url, phone, start_time, end_time, deleted FROM public.stadiums WHERE approval_status = $1', ['approved']);
    const stadiums = result.rows;

    const stadiumsWithImageUrl = stadiums.map(stadium => {
      if (stadium.images_url && Array.isArray(stadium.images_url)) {
        return {
          ...stadium,
          images_url: stadium.images_url.map(url => {
            const basename = path.basename(url);
            const formattedUrl = `https://firebasestorage.googleapis.com/v0/b/football-626b1.appspot.com/o/${basename}?alt=media&token=860bf795-35f4-485e-a2d7-285a02d27bcd`;
            return formattedUrl;
          })
        };
      } else if (stadium.images_url && typeof stadium.images_url === 'object') {
        return {
          ...stadium,
          images_url: stadium.images_url
        };
      } else {
        return stadium;
      }
    });

    res.json(stadiumsWithImageUrl);
  } catch (error) {
    console.error('Error fetching stadiums:', error);
    res.status(500).send('Internal Server Error');
  }
});
app.post('/stadiums', async (req, res) => {
  const {
    name,
    phone,
    location,
    city,
    size,
    hourly_rate,
    start_time,
    end_time,
    description,
  } = req.body;
  

  try {
    const result = await pool.query(
      'INSERT INTO public.stadiums (name, phone, location, city, size, hourly_rate, start_time, end_time, description, approval_status, deleted) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [name, phone, location, city, size, hourly_rate, start_time, end_time, description,  'pending', false]
    );

    const insertedStadium = result.rows[0];

    res.status(201).json({
      message: 'Stadium added successfully',
      stadium: {
        ...insertedStadium,
        images_url: formatImagesUrl(insertedStadium.images_url)
      }
    });
  } catch (error) {
    console.error('Error adding stadium:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Function to format images_url
function formatImagesUrl(imagesUrl) {
  if (imagesUrl && Array.isArray(imagesUrl)) {
    return imagesUrl.map(url => {
      const basename = path.basename(url);
      const formattedUrl = `https://firebasestorage.googleapis.com/v0/b/football-626b1.appspot.com/o/${basename}?alt=media&token=860bf795-35f4-485e-a2d7-285a02d27bcd`;
      return formattedUrl;
    });
  } else if (imagesUrl && typeof imagesUrl === 'object') {
    return imagesUrl;
  } else {
    return imagesUrl;
  }
}

app.get('/my-stadium', authenticateToken, async (req, res) => {
  const { user_id } = req.user;

  try {
    
    const mystadium = await pool.query('SELECT * FROM stadiums WHERE owner_id = $1', [user_id]);

    if (mystadium.rows.length === 0) {
      return res.status(404).json({ message: 'Stadium not found or unauthorized' });
    }

    res.json({ message: 'Stadium retrieved successfully', stadium: mystadium.rows[0] });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.get('/details/:stadium_id', async (req, res) => {
  const stadiumId = req.params.stadium_id;

  try {
      const stadiumResult = await pool.query('SELECT * FROM stadiums WHERE stadium_id = $1', [stadiumId]);

      if (stadiumResult.rows.length === 0) return res.status(404).json({ message: 'Stadium not found' });

      const { stadium_id, name, city, location, size, hourly_rate, description, phone, start_time, end_time, images_url } = stadiumResult.rows[0];

      // استخدم JSON.parse لتحويل النص إلى مصفوفة إذا كانت ليست بالفعل
      const imagesArray = Array.isArray(images_url) ? images_url : JSON.parse(images_url);

      const stadiumData = {
          stadium_id,
          name,
          city,
          location,
          size,
          hourly_rate,
          description,
          phone,
          start_time,
          end_time,
          images_url: imagesArray
      };

      res.json({ stadium: stadiumData });

  } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

// بوست لتحديث بيانات الملعب
app.post('/update-stadium', authenticateToken, upload.array('images_url', 5), async (req, res) => {
  const { name, city, location, size, hourly_rate, description, phone, start_time, end_time } = req.body;
  const { user_id } = req.user;

  try {
      // التحقق من أن المستخدم هو مالك الملعب
      const isStadiumOwner = await pool.query('SELECT * FROM stadiums WHERE owner_id = $1', [user_id]);

      if (isStadiumOwner.rows.length === 0) {
          return res.status(403).json({ message: 'Unauthorized - User is not the stadium owner' });
      }

      let formattedUrls = [];

      if (req.files && req.files.length > 0) {
          const storageRef = ref(storage, 'stadium-images');

          // Upload each image to Firebase Storage
          for (const file of req.files) {
              try {
                  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                  const fileExtension = path.extname(file.originalname);
                  const fileName = `image-${uniqueSuffix}${fileExtension}`;
                  const fileRef = ref(storageRef, fileName);
                  await uploadBytes(fileRef, file.buffer);

                  const downloadURL = await getDownloadURL(fileRef);
                  formattedUrls.push(downloadURL);
              } catch (error) {
                  console.error('Error uploading image to Firebase Storage:', error);
                  return res.status(500).json({ message: 'Error uploading image to Firebase Storage' });
              }
          }
      }

      // تحديث بيانات الملعب
      const result = await pool.query(`
          UPDATE stadiums 
          SET 
              name = $1, 
              city = $2, 
              location = $3, 
              size = $4, 
              hourly_rate = $5, 
              description = $6, 
              phone = $7, 
              start_time = $8, 
              end_time = $9, 
              images_url = $10 
          WHERE owner_id = $11
          RETURNING *
      `, [name, city, location, size, hourly_rate, description, phone, start_time, end_time, formattedUrls, user_id]);

      res.json({ message: 'Stadium updated successfully', stadium: result.rows[0] });
  } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});



app.delete('/delete-my-stadium', authenticateToken, async (req, res) => {
  const { user_id } = req.user;

  try {
   
    const stadiumResult = await pool.query('UPDATE stadiums SET deleted = true, owner_id = null WHERE stadium_id = $1 AND owner_id = $2 RETURNING *', [stadium_id, user_id]);

    if (stadiumResult.rows.length === 0) {
      return res.status(404).json({ message: 'Stadium not found or unauthorized' });
    }

    const stadium_id = stadiumResult.rows[0].stadium_id;

    // Soft Delete للملعب
    const updateResult = await pool.query('UPDATE stadiums SET deleted = true, owner_id = null WHERE stadium_id = $1 RETURNING *', [stadium_id]);

    res.json({ message: 'Stadium deleted successfully', stadium: updateResult.rows[0] });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

///////////////////////////////////////// BOOKING ////////////////////////////////////////////////////////////

app.post('/book-stadium/:stadium_id', authenticateToken, async (req, res) => {
  const stadium_id = req.params.stadium_id;
  console.log("stadium_id",stadium_id)
  const { start_time, end_time, booking_date, note, phone } = req.body; // تعديل هنا
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
});



app.get('/user-bookings', authenticateToken, async (req, res) => {
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
});


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




// تحديث نقطة النهاية لجلب رسائل الاتصال للأدمن
app.get('/admin-contact', authenticateAdminToken, async (req, res) => {
    try {
      const messagesResult = await pool.query('SELECT * FROM public.contacts'); // قم بتحديث هذا الجزء
      res.json({ messages: messagesResult.rows });
    } catch (error) {
      console.error('Error fetching contact messages', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  




// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'nedalraed55@gmail.com',
    pass: 'rzwykxqmyisuvwuc',
  },
});

app.use(express.json());

// Endpoint for handling contact form submissions
app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;

  try {
    // Log the received data
    console.log('Received contact form submission:', { name, email, message });

    // Validate the form data if needed

    // Configure email options
    const mailOptions = {
      from: 'nedalraed55@gmail.com',
      to: email,
      subject: 'Subject for the email',
      text: 'Thank you for your message',
    };

    // Send the email
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error('Error sending email', error);

        // Log the error on the server
        res.status(500).json({ message: 'Failed to send email', error: error.message });
      } else {
        console.log('Email sent:', info.response);
        res.json({ message: 'Email sent successfully' });
      }
    });
  } catch (error) {
    console.error('Error processing contact form', error);

    // Log the error on the server
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});



app.post('/admin-reply', authenticateAdminToken, async (req, res) => {
  const { email, reply } = req.body;

  try {
    // Update the contact message with the admin's reply based on email
    const updateResult = await pool.query('UPDATE public.contacts SET admin_reply = $1 WHERE email = $2 RETURNING *', [reply, email]);

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    const updatedMessage = updateResult.rows[0];

    // Fetch the updated message including the admin_reply
    const selectResult = await pool.query('SELECT * FROM public.contacts WHERE email = $1', [email]);

    if (selectResult.rows.length === 0) {
      return res.status(404).json({ message: 'Contact message not found' });
    }

    res.json({ message: 'Admin reply sent successfully', updatedMessage: selectResult.rows[0] });
  } catch (error) {
    console.error('Error replying to contact message', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post('/AddToCart', authenticateToken, async (req, res) => {
  const { id_product, quantity } = req.body;
  const { user_id } = req.user;

  try {
    // جلب معلومات المنتج من جدول البروداكت
    const productResult = await pool.query('SELECT * FROM products WHERE id_product = $1', [id_product]);

    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = productResult.rows[0];
    const total_price = product.price * quantity;

    if (product.quantity < quantity) {
      return res.status(400).json({ message: 'Insufficient quantity available' });
    }

    const cartResult = await pool.query(
      `INSERT INTO cart (user_id, product_id, quantity, total_price, created_at)
        VALUES ($1, $2, $3, $4, current_timestamp) RETURNING *`,
      [user_id, id_product, quantity, total_price]
    );

    // تحديث كمية المنتج في جدول البروداكت
    const updatedQuantity = product.quantity - quantity;
    await pool.query('UPDATE products SET quantity = $1 WHERE id_product = $2', [updatedQuantity, id_product]);

    res.json({ message: 'Product added to cart successfully', cart_item: cartResult.rows[0] });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


app.get('/ViewCart', authenticateToken, async (req, res) => {
  const { user_id } = req.user;

  try {
    const cartItemsResult = await pool.query(
      `SELECT c.*, p.price
       FROM cart c
       JOIN products p ON c.product_id = p.id_product
       WHERE c.user_id = $1`,
      [user_id]
    );

    res.json({ message: 'Cart items retrieved successfully', cart_items: cartItemsResult.rows });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



app.put('/UpdateCart/:cart_id', authenticateToken, async (req, res) => {
  const { cart_id } = req.params;
  const { quantity } = req.body;
  const { user_id } = req.user;

  // تحقق من أن القيمة هي رقم صحيح أو عشري
  const parsedQuantity = parseFloat(quantity);

  if (isNaN(parsedQuantity)) {
    return res.status(400).json({ message: 'Invalid quantity value' });
  }

  try {
    // جلب معلومات العنصر في سلة التسوق
    const cartItemResult = await pool.query('SELECT * FROM cart WHERE cart_id = $1 AND user_id = $2', [cart_id, user_id]);

    if (cartItemResult.rows.length === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    const cartItem = cartItemResult.rows[0];
    const { product_id, previous_quantity } = cartItem;

    // جلب معلومات المنتج من جدول المنتجات
    const productResult = await pool.query('SELECT * FROM store WHERE id_store = $1', [product_id]);

    if (productResult.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const product = productResult.rows[0];
    const { quantity: availableQuantity, price } = product;

    // حساب الكمية المتاحة بعد التحديث
    const updatedAvailableQuantity = availableQuantity + previous_quantity - parsedQuantity;

    // التحقق من أن الكمية المتاحة لا تصبح سالبة
    if (updatedAvailableQuantity < 0) {
      return res.status(400).json({ message: 'Quantity not available' });
    }

    // تحديث الكمية والسعر في جدول سلة التسوق
    const updatedCartItemResult = await pool.query(
      `UPDATE cart SET quantity = $1, total_price = $2 WHERE cart_id = $3 RETURNING *`,
      [parsedQuantity, price * parsedQuantity, cart_id]
    );

    // إعادة الكمية المتاحة إلى جدول المنتجات
    await pool.query('UPDATE store SET quantity = $1 WHERE id_store = $2', [updatedAvailableQuantity, product_id]);

    res.json({ message: 'Cart item updated successfully', cart_item: updatedCartItemResult.rows[0] });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});




app.post('/order', authenticateToken, async (req, res) => {
  const { cart_id } = req.body;
  const { user_id } = req.user;

  try {
    // جلب معلومات السلة للمستخدم
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
//--------------------------------------------------------------------------------------------------------//
const stripe = require("stripe")("sk_test_51OGgPBGQpG0LBUoZ6LIKxJhKwK4syOUFCRtPE1xFDtHor5jCRVBHoeVmoVkrCUxU6nCCw9l74cqDeJxj1PygxH3T00p8lOG0Eh");
app.post("/Payment", cors(), async (req, res) => {
  let { amount, id } = req.body;
  try {
    const payment = await stripe.paymentIntents.create({
      amount,
      currency: "USD",
      description: "Spatula company",
      payment_method: id,
      confirm: true,
      return_url: "http://localhost:2000/",
    });
    console.log("Payment", payment);
    res.json({
      message: "Payment successful",
      success: true,
    });
  } catch (error) {
    console.log("Error", error);
    res.json({
      message: "Payment failed",
      success: false,
    });
  }
});

/////////////////////////////////////////////////////////////////////////////
app.listen(2000, () => {
  console.log("server running at http://localhost:2000");
});
module.exports = app;