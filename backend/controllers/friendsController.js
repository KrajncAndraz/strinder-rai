var FriendsModel = require('../models/friendsModel.js');
var UserModel = require('../models/userModel.js');

/**
 * friendsController.js
 *
 * @description :: Server-side logic for managing friends.
 */
module.exports = {

    /**
     * friendsController.addFriend()
     */
    addFriendByUsername: function (req, res) {
        var username = req.body.username;

        // Preverimo, ali uporabnik poskuša dodati samega sebe
        UserModel.findOne({ _id: req.session.userId }, function (err, currentUser) {
            if (err) {
                console.error('Error finding current user:', err);
                return res.status(500).json({
                    message: 'Error when finding current user.',
                    error: err
                });
            }

            if (currentUser.username === username) {
                return res.status(400).json({
                    message: 'You cannot add yourself as a friend.'
                });
            }

            // Poiščemo uporabnika po username
            UserModel.findOne({ username: username }, function (err, user) {
                if (err) {
                    console.error('Err finding user:', err);
                    return res.status(500).json({
                        message: 'Error when finding user.',
                        error: err
                    });
                }

                if (!user) {
                    return res.status(404).json({
                        message: 'User not found.'
                    });
                }

                // Preverimo, ali prošnja za prijateljstvo že obstaja
                FriendsModel.findOne({
                    $or: [
                        { friend1: req.session.userId, friend2: user._id },
                        { friend1: user._id, friend2: req.session.userId }
                    ]
                }, function (err, existingRequest) {
                    if (err) {
                        console.error('Error checking existing friend request:', err);
                        return res.status(500).json({
                            message: 'Error when checking existing friend request.',
                            error: err
                        });
                    }

                    if (existingRequest) {
                        return res.status(400).json({
                            message: 'Friend request already exists or you are already friends.'
                        });
                    }

                    // Ustvarimo zahtevo za prijateljstvo
                    var friendRequest = new FriendsModel({
                        friend1: req.session.userId, // Prijavljen uporabnik
                        friend2: user._id, // ID uporabnika, ki ga želimo dodati
                        status: 'pending'
                    });

                    friendRequest.save(function (err, request) {
                        if (err) {
                            console.error('Error when saving friend request:', err);
                            return res.status(500).json({
                                message: 'Error when creating friend request.',
                                error: err
                            });
                        }

                        return res.status(201).json(request);
                    });
                });
            });
        });
    },
    /**
     * friendsController.acceptFriend()
     */
    acceptFriend: function (req, res) {
        var requestId = req.params.id;

        FriendsModel.findOne({ _id: requestId }, function (err, request) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when finding friend request.',
                    error: err
                });
            }

            if (!request) {
                return res.status(404).json({
                    message: 'No such friend request.'
                });
            }

            if (request.friend2.toString() !== req.session.userId) {
                return res.status(403).json({
                    message: 'You are not authorized to accept this request.'
                });
            }

            request.status = 'friends';

            request.save(function (err, updatedRequest) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when updating friend request.',
                        error: err
                    });
                }

                return res.json(updatedRequest);
            });
        });
    },

    /**
     * friendsController.listFriends()
     */
    listFriends: function (req, res) {
        FriendsModel.find({
            $or: [
                { friend1: req.session.userId, status: 'friends' },
                { friend2: req.session.userId, status: 'friends' }
            ]
        })
        .populate('friend1 friend2')
        .exec(function (err, friends) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when listing friends.',
                    error: err
                });
            }

            return res.json(friends);
        });
    },

    getFriendRequests: function (req, res) {
        FriendsModel.find({ friend2: req.session.userId, status: 'pending' })
            .populate('friend1', 'username') // Prikažemo samo username prijatelja
            .exec(function (err, requests) {
                if (err) {
                    return res.status(500).json({
                        message: 'Error when getting friend requests.',
                        error: err
                    });
                }

                return res.json(requests);
            });
    },

    /**
     * friendsController.removeFriend()
     */
    removeFriend: function (req, res) {
        var requestId = req.params.id;

        FriendsModel.findByIdAndRemove(requestId, function (err) {
            if (err) {
                return res.status(500).json({
                    message: 'Error when removing friend.',
                    error: err
                });
            }

            return res.status(204).json();
        });
    }
};