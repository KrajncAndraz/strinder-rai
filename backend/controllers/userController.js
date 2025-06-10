var UserModel = require('../models/userModel.js');
const { Expo } = require('expo-server-sdk');
const expo = new Expo();

/**
 * userController.js
 *
 * @description :: Server-side logic for managing users.
 */
module.exports = {

    /**
     * userController.list()
     */
    list: function (req, res) {
        UserModel.find(function (err, users) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting user.',
                    error: err
                });
            }

            return res.json(users);
        });
    },

    /**
     * userController.show()
     */
    show: function (req, res) {
        var id = req.params.id;

        UserModel.findOne({_id: id}, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting user.',
                    error: err
                });
            }

            if (!user) {
                return res.status(404).json({
                    message: 'No such user'
                });
            }

            return res.json(user);
        });
    },

    /**
     * userController.create()
     */
    create: function (req, res) {
        var user = new UserModel({
			username : req.body.username,
			password : req.body.password,
			email : req.body.email,
            pushToken: "",
            loginConfirmed: false 
        });

        user.save(function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when creating user',
                    error: err
                });
            }

            return res.status(201).json(user);
            //return res.redirect('/users/login');
        });
    },

    /**
     * userController.update()
     */
    update: function (req, res) {
        var id = req.params.id;

        UserModel.findOne({_id: id}, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when getting user',
                    error: err
                });
            }

            if (!user) {
                return res.status(404).json({
                    message: 'No such user'
                });
            }

            user.username = req.body.username ? req.body.username : user.username;
			user.password = req.body.password ? req.body.password : user.password;
			user.email = req.body.email ? req.body.email : user.email;
			
            user.save(function (err, user) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating user.',
                        error: err
                    });
                }

                return res.json(user);
            });
        });
    },

    /**
     * userController.remove()
     */
    remove: function (req, res) {
        var id = req.params.id;

        UserModel.findByIdAndRemove(id, function (err, user) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when deleting the user.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    },

    showRegister: function(req, res){
        res.render('user/register');
    },

    showLogin: function(req, res){
        res.render('user/login');
    },

    login: function(req, res, next){
        UserModel.authenticate(req.body.username, req.body.password, function(err, user){
            if(err || !user){
                var err = new Error('Wrong username or paassword');
                err.status = 401;
                return next(err);
            }
            req.session.userId = user._id;
            req.session.username = req.body.username;
            
            if (typeof req.body.use2FA !== "undefined") {
                user['2faInProgress'] = !!req.body.use2FA;
                user.loginConfirmed = false;
                user.save(function(saveErr) {
                    if (saveErr) {
                        return res.status(500).json({ message: 'Error updating 2FA state', error: saveErr });
                    }
                    return res.json(user);
                });
            } else {
                return res.json(user);
            }
        });
    },

    profile: function(req, res,next){
        UserModel.findById(req.session.userId)
        .exec(function(error, user){
            if(error){
                return next(error);
            } else{
                if(user===null){
                    var err = new Error('Not authorized, go back!');
                    err.status = 400;
                    return next(err);
                } else{
                    //return res.render('user/profile', user);
                    return res.json(user);
                }
            }
        });  
    },

    logout: function(req, res, next){
        if(req.session){
            req.session.destroy(function(err){
                if(err){
                    return next(err);
                } else{
                    //return res.redirect('/');
                    return res.status(201).json({});
                }
            });
        }
    },

    faceSetup: function (req, res) {
        var userId = req.params.id;
        var images = req.body.images;

        if (!images || !Array.isArray(images)) {
            return res.status(400).json({ message: 'You must provide images.' });
        }

        fetch('http://localhost:5000/setup-face', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: userId, images: images }),
        })
        .then(function(flaskRes) {
            return flaskRes.json().then(function(flaskData) {
                if (flaskRes.ok && flaskData.success) {
                    UserModel.findOne({ _id: userId }, function(err, user) {
                    if (err) {
                        return res.status(500).json({ message: 'Error finding user', error: err });
                    }
                    if (!user) {
                        return res.status(404).json({ message: 'User not found' });
                    }

                    user.has2FA = true;

                    user.save(function(err, savedUser) {
                        if (err) {
                            return res.status(500).json({ message: 'Error updating user', error: err });
                        }
                        return res.json({ message: '2FA face setup successful', user: savedUser });
                    });
                });
                } else {
                    return res.status(500).json({ message: flaskData.message || 'Flask server error' });
                }
            });
        })
        .catch(function(err) {
            console.error('Error contacting Flask server:', err);
            return res.status(500).json({ message: 'Internal server error', error: err });
        });
    },
    check2FA: function(req, res) {
        const userId = req.params.id;
        UserModel.findById(userId, (err, user) => {
            if (err || !user) return res.status(404).json({ twoFAInProgress: false });
            return res.json({ twoFAInProgress: user['2faInProgress'] });
        });
    },
    verify2FA: function(req, res) {
        const userId = req.params.id;
        const { image } = req.body;
        if (!image) {
            return res.status(400).json({ message: 'You must provide 1 image.' });
        }

        fetch('http://localhost:5000/verify-face', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, image }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.success == true) {
                UserModel.findById(userId, (err, user) => {
                    console.log('Prejel sem:', data.success);
                    if (err || !user) return res.status(404).json({ message: 'User not found' });
                    user['2faInProgress'] = false;
                    user.save(err => {
                        if (err) return res.status(500).json({ message: 'Error saving user', error: err });
                        return res.json({ success: true, message: data.message || 'Face verification successful'});
                    });
                });
            } else {
                return res.status(400).json({ success: false, message: data.message || 'Face verification failed' });
            }
        })
        .catch(err => {
            console.error('Error verifying face:', err);
            return res.status(500).json({ message: 'Internal server error', error: err });
        });
    },

    savePushToken: async function(req, res) {
        const { userId, pushToken } = req.body;
        try {
            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({ success: false, message: 'User not found' });
            }
            user.pushToken = pushToken;
            await user.save();
            return res.json({ success: true });
        } catch (err) {
            return res.status(500).json({ success: false, error: err });
        }
    },

    sendPushNotification: async function(req, res) {
        const { username } = req.body;
        try {
            const user = await UserModel.findOne({ username });
            if (!user || !user.pushToken) {
                return res.status(400).json({ error: 'No push token for user' });
            }

            const messages = [];
            if (Expo.isExpoPushToken(user.pushToken)) {
                messages.push({
                    to: user.pushToken,
                    sound: 'default',
                    body: 'Potrdi prijavo v aplikacijo!',
                    data: { type: 'login_confirmation', username },
                });
            }

            await expo.sendPushNotificationsAsync(messages);
            return res.json({ success: true });
        } catch (err) {
            console.error('Push notification error:', err);
            return res.status(500).json({ error: 'Push failed' });
        }
    },

    confirmLogin: async function(req, res) {
    const { userId } = req.body;
        try {
            const user = await UserModel.findById(userId);
            if (!user) return res.status(404).json({ success: false });
            user.loginConfirmed = true;
            user['2faInProgress'] = false;
            await user.save();
            return res.json({ success: true });
        } catch (err) {
            return res.status(500).json({ success: false, error: err });
        }
    },

    declineLogin: async function(req, res) {
        const { userId } = req.body;
        try {
            const user = await UserModel.findById(userId);
            if (!user) return res.status(404).json({ success: false });
            user.loginConfirmed = false;
            user['2faInProgress'] = false;
            await user.save();
            return res.json({ success: true });
        } catch (err) {
            return res.status(500).json({ success: false, error: err });
        }
    },

    checkLoginConfirmed: async function(req, res) {
        const { username } = req.body;
        try {
            const user = await UserModel.findOne({ username });
            if (!user) {
                return res.status(404).json({ confirmed: false });
            }
            return res.json({ confirmed: !!user.loginConfirmed });
        } catch (err) {
            return res.status(500).json({ confirmed: false, error: err });
        }
    },

};
