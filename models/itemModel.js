const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create the schema for an Item
let itemSchema = Schema({
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
    maxlength: 20
  },
  type: {
    required: true,
    type: String,
  },
  img: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 50
  }
});

module.exports = mongoose.model("ItemModel", itemSchema);
