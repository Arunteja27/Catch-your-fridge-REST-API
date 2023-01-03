const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create the schema for a Type
let typeSchema = Schema({
  id: {
    type: String,
    required: true,
    minlength: 1,
    maxlength: 4
  },
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 13
  }

});

module.exports = mongoose.model("TypeModel", typeSchema);
