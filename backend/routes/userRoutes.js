var express = require('express');
var router = express.Router();
var userController = require('../controllers/userController.js');


router.get('/', userController.list);
//router.get('/register', userController.showRegister);
//router.get('/login', userController.showLogin);
router.get('/profile', userController.profile);
router.get('/logout', userController.logout);
router.get('/:id', userController.show);

router.post('/', userController.create);
router.post('/login', userController.login);

router.put('/:id', userController.update);

router.delete('/:id', userController.remove);

router.post('/:id/set-2fa', userController.faceSetup);
router.get('/:id/check-2fa', userController.check2FA);
router.post('/:id/verify-2fa', userController.verify2FA);
router.post('/send-push-notification', userController.sendPushNotification);
router.post('/confirm-login', userController.confirmLogin);
router.post('/decline-login', userController.declineLogin);
router.post('/check-login-confirmed', userController.checkLoginConfirmed);
router.post('/save-push-token', userController.savePushToken);

module.exports = router;
