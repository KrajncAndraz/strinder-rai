var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var messageSchema = new Schema({
	'content' : String,
	'sentAt' : Date,
	'sentBy' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'user'
	},
	'belongsTo' : {
     	type: Schema.Types.ObjectId,
     	ref: 'chatlog'
    }
});

module.exports = mongoose.model('message', messageSchema);
