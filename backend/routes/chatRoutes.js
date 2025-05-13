const express = require('express');
const router = express.Router();
const { getFriendChats, createFriendChat, getChatMessages, sendMessage } = require('../controllers/chatController');


function requiresLogin(req, res, next){
    if(req.session && req.session.userId){
        return next();
    } else{
        var err = new Error("You must be logged in to view this page");
        err.status = 401;
        return next(err);
    }
}
// Pridobi vse chatloge za prijavljenega uporabnika
router.get('/', getFriendChats, requiresLogin);

// Ustvari nov chatlog z iskanjem uporabnika po username
router.post('/create', createFriendChat, requiresLogin);
router.get('/messages/:chatId', getChatMessages, requiresLogin);
router.post('/messages/:chatId', sendMessage, requiresLogin);

module.exports = router;