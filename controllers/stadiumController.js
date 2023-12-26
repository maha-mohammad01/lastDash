const path = require('path');
const pool = require('../db');
require('dotenv').config();
const { checkStadiumNameExists, insertStadium } = require('../models/stadiumModel');
const { getApprovedStadiums } = require('../models/stadiumModel');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const stadiumModel = require('../models/stadiumModel');
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

async function addStadium(req, res) {
  const { name, city, location, size, hourly_rate, description, phone, start_time, end_time } = req.body;
  const { user_id } = req.user;

  try {
    // التحقق من عدم تكرار اسم الملعب
    const isNameExists = await checkStadiumNameExists(name);

    if (isNameExists) {
      return res.status(400).json({ message: 'Stadium name already exists' });
    }

    let formattedUrls = [];

    if (req.files && req.files.length > 0) {
      const storageRef = ref(storage, 'stadium-images');

      // رفع كل صورة إلى Firebase Storage
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

    const result = await insertStadium(
      name, city, location, size, hourly_rate, description, user_id, 'pending', formattedUrls, phone, start_time, end_time
    );

    res.json({ message: 'Stadium request added successfully', stadium: result });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function getMyStadium(req, res) {
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
  }

  const updateStadium = async (req, res) => {
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
  
        // رفع كل صورة إلى Firebase Storage
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
  };
  

  const { deleteMyStadium } = require('../models/stadiumModel');

  async function deleteMyStadiumController(req, res) {
    const { user_id } = req.user;
    const { stadium_id } = req.body;
  
    try {
      const updatedStadium = await deleteMyStadium(stadium_id, user_id);
  
      if (!updatedStadium) {
        return res.status(404).json({ message: 'Stadium not found or unauthorized' });
      }
  
      res.json({ message: 'Stadium deleted successfully', stadium: updatedStadium });
    } catch (error) {
      console.error('Error executing query', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async function getApprovedStadiumsController(req, res) {
    try {
      const stadiums = await getApprovedStadiums();
      res.json(stadiums);
    } catch (error) {
      console.error('Error fetching stadiums:', error);
      res.status(500).send('Internal Server Error');
    }
  }


  async function getStadiumDetailsController(req, res) {
    const stadiumId = req.params.stadium_id;

    try {
        const stadiumData = await stadiumModel.getStadiumDetails(stadiumId);

        if (!stadiumData) {
            return res.status(404).json({ message: 'Stadium not found' });
        }

        res.json({ stadium: stadiumData });
    } catch (error) {
        console.error('Error executing query', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


    getStadiumDetailsController,

  
module.exports = {
  addStadium,
  getMyStadium,
  updateStadium,
  deleteMyStadiumController,
  getApprovedStadiumsController,
  getStadiumDetailsController,

};
