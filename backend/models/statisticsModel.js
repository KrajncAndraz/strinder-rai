const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const statisticsSchema = new Schema({
  loginTime: { type: Date, required: true },
  device: {
    brand: String,
    modelName: String,
    osName: String,
    osVersion: String,
    manufacturer: String,
  }
});

module.exports = mongoose.model('statistics', statisticsSchema);