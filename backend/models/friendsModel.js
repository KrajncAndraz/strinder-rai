var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var friendsSchema = new Schema({
    'friend1' : {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    'friend2' : {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    'status' : {
        type: String,
        enum: ['pending', 'friends'],
        default: 'pending'
    },
});

module.exports = mongoose.model('friends', friendsSchema);
