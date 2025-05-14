const express = require('express');
const router = express.Router();

router.get('/ping', (req, res) => {
  res.send('response from test route');
});

module.exports = router;
