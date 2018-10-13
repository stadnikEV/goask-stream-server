const mongoose = require('../libs/mongoose'),
Schema = mongoose.Schema;

var schema = new Schema({
  streamId: {
    type: String,
    unique: true,
    required: true,
  },
  files: {
    type: Array,
  }
});


const Stream = mongoose.model('Stream', schema);

module.exports = Stream;
