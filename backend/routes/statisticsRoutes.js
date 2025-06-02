const express = require('express');
const router = express.Router();
const statisticsController = require('../controllers/statisticsController');

router.get('/devices', statisticsController.getDeviceStatistics);
router.get('/trackers', statisticsController.getAllTrackers);

module.exports = router;