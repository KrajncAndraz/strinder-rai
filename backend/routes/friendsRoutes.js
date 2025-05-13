var express = require('express');
// Vključimo multer za file upload
var multer = require('multer');
var upload = multer({dest: 'public/images/'});

var router = express.Router();
var friendsController = require('../controllers/friendsController.js');

function requiresLogin(req, res, next){
    if(req.session && req.session.userId){
        return next();
    } else{
        var err = new Error("You must be logged in to view this page");
        err.status = 401;
        return next(err);
    }
}
router.get('/', friendsController.listFriends);
router.get('/requests', friendsController.getFriendRequests);
router.post('/accept/:id', friendsController.acceptFriend);
router.post('/add', friendsController.addFriendByUsername, requiresLogin);
router.delete('/remove/:id', friendsController.removeFriend);


module.exports = router;
