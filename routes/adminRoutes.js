const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticateAdminToken } = require('../middleware/authenticateAdminToken');
const multer = require('multer'); // تأكد من استيراد Multer
const { getStorage, ref, uploadBytes, getDownloadURL } = require('firebase/storage');
const router = express.Router();

// تكوين Multer Middleware
const memoryStorage = multer.memoryStorage();
const upload = multer({ storage: memoryStorage });


router.post('/register-admin', adminController.registerAdmin);
router.post('/admin-login', adminController.adminLogin);
router.get('/stadium-requests', authenticateAdminToken, adminController.getStadiumRequests);
router.get('/all-stadiums', authenticateAdminToken, adminController.getAllStadiums);
router.post('/search', authenticateAdminToken, adminController.searchStadiums);
router.put('/approve-stadium/:stadium_id', authenticateAdminToken, adminController.approveStadium);
router.put('/reject-stadium/:stadium_id', authenticateAdminToken, adminController.rejectStadium);
router.delete('/delete-stadium/:stadium_id', authenticateAdminToken, adminController.deleteStadium);
router.delete('/delete-stadium-owner/:user_id', authenticateAdminToken, adminController.deleteStadiumOwner);
router.get('/Deleteduser', authenticateAdminToken, adminController.getDeletedUsers);
router.get('/user-count', authenticateAdminToken, adminController.getUserCount);
router.get('/allusers', authenticateAdminToken, adminController.getAllUsers);
router.get('/stadium-count/:status', authenticateAdminToken, adminController.getStadiumCountByStatus);
router.get('/bookings-info', authenticateAdminToken, adminController.getBookingsInfo);
router.post('/add-product', authenticateAdminToken, upload.array('images', 5), adminController.addProduct); 
router.put('/update-user-role/:user_id', authenticateAdminToken, adminController.updateUserRole);
router.delete('/deleteUser/:user_id', authenticateAdminToken, adminController.deletedUser);
router.post('/admin-reply', authenticateAdminToken, adminController.ContactReply);
router.get('/allStadiums', authenticateAdminToken, adminController.AllStadiums);

module.exports = router;
