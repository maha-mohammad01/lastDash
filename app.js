const express = require('express');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const multer = require('multer');
const cors = require('cors');
const app = express();
const secretKey = 'your_secret_key';
app.use(bodyParser.json());
app.use(cors());

const pool = new Pool({
  user: 'postgres',
  password: '1234',
  host: 'localhost',
  port: 5432,
  database: 'footbolai',
});

// Move the storage definition above the multer middleware creation
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'C:/Users/Orange/Desktop/masterpiece/pic');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });
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

app.get('/puser', authenticateToken, async (req, res) => {
  const { user_id } = req.user;

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE user_id = $1 AND is_deleted = false', [user_id]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User profile retrieved successfully', user: userResult.rows[0] });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/update-user', authenticateToken, async (req, res) => {
  const { full_name, email } = req.body;
  const { user_id } = req.user; 

  try {
    const userExists = await pool.query('SELECT * FROM users WHERE user_id = $1 AND is_deleted = false', [user_id]);

    if (userExists.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const result = await pool.query('UPDATE users SET full_name = $1, email = $2 WHERE user_id = $3 RETURNING *', [full_name, email, user_id]);

    res.json({ message: 'User updated successfully', user: result.rows[0] });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Soft Delete للمستخدم
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
  
      // تشفير كلمة المرور باستخدام bcrypt
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // إضافة المستخدم إلى جدول اليوزر وتحديد رقم الرول إلى 1
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
  
 // الموافقة أو الرفض على طلب ملعب
app.put('/approve-stadium-request/:stadium_id', authenticateAdminToken, async (req, res) => {
    const { stadium_id } = req.params;
  
    try {
      const result = await pool.query('UPDATE stadiums SET approval_status = $1 WHERE stadium_id = $2 RETURNING *', ['approved', stadium_id]);
  
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


  
// Middleware للتحقق من توكن الأدمن
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
  
  app.get('/allusers', authenticateAdminToken, async (req, res) => {
    try {
      const { page = 1, pageSize = 20 } = req.query;
      const offset = (page - 1) * pageSize;
      const result = await pool.query('SELECT user_id, full_name, email ,user_role FROM users WHERE is_deleted = false');
    
      res.json({ message: 'Users with "false" status retrieved successfully', users: result.rows });
    } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  
  ///////////////////////////////////////////STAD/////////////////////////////////////////////////////////////////
  
// إضافة ملعب جديد
app.post('/add-stadium', authenticateToken, async (req, res) => {
    const { name, city, location, size, hourly_rate, description, images_url } = req.body;
    const { user_id } = req.user;
  
    try {
      // إضافة الطلب إلى جدول الملاعب مع حالة الموافقة محددة كـ 'pending'
      const result = await pool.query(
        'INSERT INTO stadiums (name, city, location, size, hourly_rate, description, owner_id, approval_status, images_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
        [name, city, location, size, hourly_rate, description, user_id, 'pending', images_url]
      );
  
      res.json({ message: 'Stadium request added successfully', stadium: result.rows[0] });
    } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  

  
  // موافقة أو رفض طلب ملعب
  app.put('/respond-to-stadium-request/:stadium_id', authenticateAdminToken, async (req, res) => {
    const { stadium_id } = req.params;
    const { approval_status } = req.body;
  
    try {
      // تحديث حالة الموافقة
      const result = await pool.query('UPDATE stadiums SET approval_status = $1 WHERE stadium_id = $2 RETURNING *', [approval_status, stadium_id]);
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Stadium not found' });
      }
  
      res.json({ message: 'Stadium request updated successfully', stadium: result.rows[0] });
    } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  ////////////////////////////////////////// BOOKING ////////////////////////////////////////////////////////////
// حجز الملعب
app.post('/book-stadium', authenticateToken, async (req, res) => {
  const { stadium_id, start_time, end_time, booking_date } = req.body;
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

    // قم بإضافة الحجز
    const result = await pool.query(
      'INSERT INTO bookings (stadium_id, user_id, start_time, end_time, booking_date) VALUES ($1, $2, $3::time, $4::time, $5) RETURNING *',
      [stadium_id, user_id, start_time, end_time, booking_date]
    );

    res.json({ message: 'Stadium booked successfully', booking: result.rows[0] });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////
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
  
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////

// استرجاع بيانات المستخدم وحجوزاته
app.get('/user-profile', authenticateToken, async (req, res) => {
  const { user_id } = req.user;

  try {
      // استرجاع بيانات المستخدم
      const userResult = await pool.query('SELECT * FROM users WHERE user_id = $1 AND is_deleted = false', [user_id]);

      if (userResult.rows.length === 0) {
          return res.status(404).json({ message: 'User not found' });
      }

      const userData = userResult.rows[0];

      // استرجاع حجوزات المستخدم
      const bookingsResult = await pool.query('SELECT * FROM bookings WHERE user_id = $1', [user_id]);

      res.json({ user: userData, bookings: bookingsResult.rows });
  } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

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
// Endpoint to handle contact form submissions
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'hma91109@gmail.com',
    pass: 'kjnhebktzoqaqhgs'
  }
});

// نقطة نهاية لمعالجة نموذج الاتصال
app.post('/contact', async (req, res) => {
  const { name, email, message } = req.body;

  try {
    const mailOptions = {
      from: "",
      to: email,
      subject: `replay`,
      text: `thankyou`
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error('Error sending email', error);
        res.status(500).json({ message: 'Failed to send email' });
      } else {
        console.log('Email sent: ' + info.response);
        res.json({ message: 'Email sent successfully' });
      }
    });
  } catch (error) {
    console.error('Error processing contact form', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/////////////////////////////////////////////////////////////////////////////
app.listen(2010, () => {
  console.log("server running at http://localhost:2010");
});
module.exports = app;