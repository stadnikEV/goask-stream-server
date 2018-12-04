const mongoose = require('../libs/mongoose'),
Schema = mongoose.Schema;

var schema = new Schema({
  streamId: {
    type: String,
    unique: true,
    required: true,
  },
  mp4: String,
  webm: {
    type: Array,
  }
});


const Stream = mongoose.model('Stream', schema);

module.exports = Stream;
