

const express = require('express');
const UserController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authenticateToken'); // استيراد الدالة المناسبة
const multer = require('multer');
const upload = multer();

const router = express.Router();

router.post('/login', UserController.loginUser);
router.post('/register', UserController.registerUser);
router.get('/user-profile', authenticateToken, UserController.getUserProfile);
router.post('/upload-upic', authenticateToken, upload.single('image'), UserController.uploadUserProfilePic);
router.delete('/delete-user', authenticateToken, UserController.deleteUser);
router.put('/update-user', authenticateToken, UserController.updateUser);
router.post('/book-stadium/:stadium_id', authenticateToken, UserController.bookStadium);
router.get('/user-bookings', authenticateToken, UserController.getUserBookings);
router.post('/logout', UserController.logoutUser);
router.post('/wishlist/:product_id', authenticateToken, UserController.addToWishlist);
router.get('/wishlist', authenticateToken, UserController.getWishlist);
router.delete('/wishlist/:entry_id', authenticateToken, UserController.removeFromWishlist);
router.post('/addToCart', authenticateToken, UserController.addToCart);
router.get('/viewCart', authenticateToken, UserController.viewCart);
router.put('/updateCart/:cart_id', authenticateToken, UserController.updateCart);
router.post('/placeOrder', authenticateToken, UserController.placeOrder);
router.get('/viewProducts', UserController.viewProducts);

module.exports = router;
