const path = require('path');
require('dotenv').config();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const adminModel = require('../models/adminModel');


const secretKey = process.env.SECRET_KEY;
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const storage = getStorage();

const { initializeApp } = require("firebase/app");
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};
const imagesArray = ["url1", "url2", "url3"];
const imagesString = JSON.stringify(imagesArray);

const multer = require('multer');

// Multer setup
const retrievedArray = JSON.parse(imagesString);
// app.use('/images', express.static(path.join(__dirname, 'images')));

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

async function registerAdmin(req, res) {
  const { full_name, email, password, phone } = req.body;

  try {
    const emailExists = await adminModel.getUserByEmail(email);

    if (emailExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await adminModel.insertAdmin(full_name, email, hashedPassword, phone);

    res.json({ message: 'Admin registered successfully', admin: newAdmin });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function adminLogin(req, res) {
  const { email, password } = req.body;

  try {
    const admin = await adminModel.getUserByEmail(email);

    if (!admin || admin.user_role !== "1") {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: admin.user_id, email: admin.email, user_role: admin.user_role }, 
      secretKey, 
      { expiresIn: '10d' }
    );

    res.json({ message: 'Admin logged in successfully', token: token });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function getStadiumRequests(req, res) {
  try {
    const requests = await adminModel.getStadiumRequests();
    res.json({ message: 'Stadium requests retrieved successfully', requests });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function getAllStadiums(req, res) {
  try {
    const { page = 1, pageSize = 20 } = req.query;
    const stadiums = await adminModel.getAllStadiums(page, pageSize);

    res.json({ message: 'All stadiums retrieved successfully', stadiums });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function searchStadiums(req, res) {
  const { searchQuery } = req.body;

  try {
    const stadiums = await adminModel.searchStadiums(searchQuery);

    res.json({ message: 'Search results retrieved successfully', searchResults: stadiums });
  } catch (error) {
    console.error('Error executing search query', error);
    res.status(500).json({ message: 'Internal server error during search' });
  }
}

async function approveStadium(req, res) {
  const { stadium_id } = req.params;

  try {
    const stadium = await adminModel.approveStadium(stadium_id);

    if (!stadium) {
      return res.status(404).json({ message: 'Stadium not found' });
    }

    // تحديث رقم الرول للمستخدم إلى 2 (owner)
    const updateUserResult = await adminModel.updateUserRole(stadium.owner_id, 2);

    if (!updateUserResult) {
      return res.status(500).json({ message: 'Error updating user role' });
    }

    res.json({ message: 'Stadium request approved successfully', stadium });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function rejectStadium(req, res) {
  const { stadium_id } = req.params;

  try {
    const stadium = await adminModel.rejectStadium(stadium_id);

    if (!stadium) {
      return res.status(404).json({ message: 'Stadium not found' });
    }


    res.json({ message: 'Stadium request rejected successfully', stadium });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function deleteStadium(req, res) {
  const { stadium_id } = req.params;

  try {
    console.log('Deleting stadium with ID:', stadium_id);

    const stadium = await adminModel.deleteStadium(stadium_id);

    if (!stadium) {
      return res.status(404).json({ message: 'Stadium not found' });
    }

    res.json({ message: 'Stadium marked as deleted successfully', stadium });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function deleteStadiumOwner(req, res) {
  const { user_id } = req.params;

  try {
    const user = await adminModel.deleteStadiumOwner(user_id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully', user });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}


  async function getUserCount(req, res) {
    try {
      const result = await pool.query('SELECT COUNT(*) FROM users WHERE is_deleted = false');
      res.json({ message: 'User count retrieved successfully', userCount: result.rows[0].count });
    } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async function getAllUsers(req, res) {
    try {
      const { page = 1, pageSize = 20 } = req.query;
      const users = await adminModel.getAllUsers(page, pageSize);
      res.json({ message: 'Users retrieved successfully', users });
    } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  async function getStadiumCountByStatus(req, res) {
    const { status } = req.params;
  
    try {
      let query;
      switch (status) {
        case 'approved':
        case 'pending':
        case 'rejected':
          query = 'SELECT COUNT(*) FROM stadiums WHERE approval_status = $1';
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
  }

  async function getStadiumCountByStatus(status) {
    try {
      let query;
      switch (status) {
        case 'approved':
        case 'pending':
        case 'rejected':
          query = 'SELECT COUNT(*) FROM stadiums WHERE approval_status = $1';
          break;
        default:
          throw new Error('Invalid status parameter');
      }
  
      const result = await pool.query(query, [status]);
      return result.rows[0].count;
    } catch (error) {
      console.error('Error executing query', error);
      throw new Error('Internal server error');
    }
  }
  

  async function getDeletedUsers(req, res) {
    try {
      const deletedUsers = await adminModel.getDeletedUsers();
      res.json({ users: deletedUsers });
    } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  async function getUserCount(req, res) {
    try {
      const userCount = await adminModel.getUserCount();
      res.json({ message: 'User count retrieved successfully', userCount });
    } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  async function getAllUsers(req, res) {
    try {
      const { page = 1, pageSize = 20 } = req.query;
      const users = await adminModel.getAllUsers(page, pageSize);
      res.json({ message: 'Users retrieved successfully', users });
    } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  async function getStadiumCountByStatus(req, res) {
    const { status } = req.params;
  
    try {
      const stadiumCount = await adminModel.getStadiumCountByStatus(status);
      res.json({ message: 'Stadium count retrieved successfully', stadiumCount });
    } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async function getBookingsInfo(req, res) {
    try {
      const { page = 1, pageSize = 20 } = req.query;
      const offset = (page - 1) * pageSize;
  
      const result = await adminModel.getBookingsInfo(pageSize, offset); // Use the bookingModel
  
      res.json({ message: 'Booking information retrieved successfully', bookings: result });
    } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }


  async function addProduct(req, res) {
    const { type, name, description, price, categories, color, quantity, size_38, size_39, size_40,
      size_small, size_medium, size_large } = req.body;
  
    try {
      let images = [];
  
      if (req.files && req.files.length > 0) {
        const storageRef = ref(storage, 'product-images');
  
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
  
      const result = await adminModel.addProduct(
        type, name, description, price, categories, color, quantity,
        images, 
        size_38 === 'true', size_39 === 'true', size_40 === 'true',
        size_small === 'true', size_medium === 'true', size_large === 'true'
      );
  
      if (result) {
        res.json({ message: 'Product added successfully', product: result });
      } else {
        return res.status(500).json({ message: 'Error adding product to the store' });
      }
    } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
 
  async function updateUserRole(req, res) {
    const { user_id } = req.params;
    const { new_role } = req.body;
  
    try {
      const result = await adminModel.updateUserRole(user_id, new_role);
  
      if (!result) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.json({ message: 'User role updated successfully', user: result });
    } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  async function deletedUser (req, res) {
    const { user_id } = req.params;
  
    try {
      const deletedUser = await adminModel.deleteUser(user_id);
  
      if (!deletedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (deletedUser.is_deleted) {
        res.json({ message: 'User deleted successfully', user: deletedUser });
      } else {
        res.json({ message: 'Cannot delete admin or stadium owner', user: deletedUser });
      }
    } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }



  async function ContactReply(req, res) {
    const { email, reply } = req.body;
  
    try {
      // Update the contact message with the admin's reply based on email
      const updateResult = await pool.query('UPDATE public.contacts SET admin_reply = $1 WHERE email = $2 RETURNING *', [reply, email]);
  
      if (updateResult.rows.length === 0) {
        return res.status(404).json({ message: 'Contact message not found' });
      }
  
      const updatedMessage = updateResult.rows[0];
  
      const selectResult = await pool.query('SELECT * FROM public.contacts WHERE email = $1', [email]);
  
      if (selectResult.rows.length === 0) {
        return res.status(404).json({ message: 'Contact message not found' });
      }
  
      res.json({ message: 'Admin reply sent successfully', updatedMessage: selectResult.rows[0] });
    } catch (error) {
      console.error('Error replying to contact message', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
  
  async function AllStadiums(req, res) {
    try {
      const stadiums = await adminModel.AllStadiums();
      res.json({ message: 'All stadiums retrieved successfully for admin', stadiums });
    } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

module.exports = {
  registerAdmin,
  adminLogin,
  getStadiumRequests,
  getAllStadiums,
  searchStadiums,
  approveStadium,
  rejectStadium,
  deleteStadium,
  deleteStadiumOwner,
  getDeletedUsers,
  getUserCount,
  getAllUsers,
  getStadiumCountByStatus,
  getBookingsInfo, 
  addProduct,
  updateUserRole,
  deletedUser ,
  ContactReply,
  AllStadiums,
};
