// stadiumRoutes.js
const express = require('express');
const multer = require('multer');

const { addStadium, getMyStadium, updateStadium, deleteMyStadiumController,getApprovedStadiumsController,getStadiumDetailsController} = require('../controllers/stadiumController');

const { authenticateToken } = require('../middleware/authenticateToken');

const router = express.Router();

const memoryStorage = multer.memoryStorage();
const upload = multer({ storage: memoryStorage });

router.post('/add-stadium', authenticateToken, upload.array('images_url', 5), addStadium);
router.get('/my-stadium', authenticateToken, getMyStadium);
router.post('/update-stadium', authenticateToken, upload.array('images_url', 5), updateStadium);
router.delete('/delete-my-stadium', authenticateToken, deleteMyStadiumController);
router.get('/stadiums', getApprovedStadiumsController);
router.get('/details/:stadium_id', getStadiumDetailsController);

module.exports = router;
