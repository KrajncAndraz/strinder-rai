var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var chatlogSchema = new Schema({
	'name' : String,
	'createdAt' : Date,
	'participants' : [{
	 	type: Schema.Types.ObjectId,
	 	ref: 'user'
	}]
});

module.exports = mongoose.model('chatlog', chatlogSchema);
