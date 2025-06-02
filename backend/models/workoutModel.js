var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var workoutSchema = new Schema({
    'name' : String,
    'description' : String,
    'startTime' : {
        type: Date,
        default: Date.now
    },
    totalTime: { 
        type: Number, default: 0 
    },
    'createdBy' : {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    'category' : {
        type: Schema.Types.ObjectId,
        ref: 'category'
    },
    'trackers' : [{
        'lat' : String,
        'long' : String,
        'pingTime' : Date,
    }]
});

module.exports = mongoose.model('workout', workoutSchema);
