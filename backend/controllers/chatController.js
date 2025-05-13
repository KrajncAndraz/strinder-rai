const Chatlog = require('../models/chatlogModel');
const User = require('../models/userModel');
const FriendsModel = require('../models/friendsModel');
const Message = require('../models/chatModel');

module.exports = {
    /**
     * Prikaži vse chatloge za prijavljenega uporabnika
     */
    getFriendChats: async (req, res) => {
        try {
            const chats = await Chatlog.find({ participants: req.session.userId })
                .populate('participants', 'username');

            res.status(200).json(chats.length > 0 ? chats : []); // Vedno vrni array
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    

    /**
     * Ustvari nov chatlog z iskanjem uporabnika po username
     */
    createFriendChat: async (req, res) => {
        try {
            const { username } = req.body;

            // Preverimo, ali uporabnik obstaja
            const otherUser = await User.findOne({ username });
            if (!otherUser) {
                return res.status(404).json({ error: 'User not found.' });
            }
            const currentId = req.session.userId;
            const currentUser = await User.findOne({ _id: currentId });
            if (!otherUser) {
                return res.status(404).json({ error: 'User not found.' });
            }

            // Preverimo, ali sta uporabnika prijatelja
            const isFriend = await FriendsModel.findOne({
                $or: [
                    { friend1: req.session.userId, friend2: otherUser._id, status: 'friends' },
                    { friend1: otherUser._id, friend2: req.session.userId, status: 'friends' }
                ]
            });

            if (!isFriend) {
                return res.status(403).json({ error: 'You can only create chats with friends.' });
            }

            // Preverimo, ali chatlog že obstaja
            const existingChat = await Chatlog.findOne({
                participants: { $all: [req.session.userId, otherUser._id] }
            });

            if (existingChat) {
                return res.status(400).json({ error: 'Chat already exists.' });
            }
            console.log(currentUser.username);
            console.log(otherUser.username);
            // Ustvarimo nov chatlog
            const newChat = new Chatlog({
                name: `${currentUser.username} & ${otherUser.username}`,
                createdAt: new Date(),
                participants: [req.session.userId, otherUser._id]
            });

            await newChat.save();
            res.status(201).json(newChat);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    getChatMessages: async (req, res) => {
        try {
            const { chatId } = req.params;

            // Preverimo, ali chat obstaja
            const chat = await Chatlog.findById(chatId);
            if (!chat) {
                return res.status(404).json({ error: 'Chat not found.' });
            }

            // Pridobimo vsa sporočila in populiramo `sentBy` z uporabniškimi podatki
            const messages = await Message.find({ belongsTo: chatId })
                .populate('sentBy', 'username') // Pridobi samo `username` iz povezane zbirke
                .sort({ sentAt: 1 });

            res.status(200).json(messages);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    sendMessage: async (req, res) => {
        try {
            const { chatId } = req.params;
            const { content } = req.body;

            // Preverimo, ali chat obstaja
            const chat = await Chatlog.findById(chatId);
            if (!chat) {
                return res.status(404).json({ error: 'Chat not found.' });
            }

            // Ustvarimo novo sporočilo
            const newMessage = new Message({
                content,
                sentAt: new Date(),
                sentBy: req.session.userId, // ID trenutnega uporabnika
                belongsTo: chatId,
            });

            await newMessage.save();

            // Populiramo `sentBy` z uporabniškimi podatki
            const populatedMessage = await newMessage.populate('sentBy', 'username');

            // Pošlji shranjeno sporočilo nazaj kot odgovor
            res.status(201).json(populatedMessage);

            // Obvesti vse uporabnike v istem chatu prek Socket.IO
            const io = req.app.get('io'); // Pridobi Socket.IO instanco iz Express app
            io.to(chatId).emit('receiveMessage', populatedMessage);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};