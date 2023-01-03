const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create the schema for a Fridge
let fridgeSchema = Schema({
  id: {
    type: String,
    required: true,
    minlength: 4,
    maxlength: 6
  },
  name : {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 25
  },
  numItemsAccepted: {
    type: Number,
    default: 0
  },
  canAcceptItems: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  contactInfo: {
    contactPerson :{
      type: String,
      required: true
    },
    contactPhone: String
  },
  address: {
    street: {type: String, required: true},
    postalCode: {type: String, required: true},
    city: {type: String, required: true},
    province: {type: String, required: true},
    country: {type: String, required: true}
  },
  acceptedTypes: {
    type: [String],
    required: true
  },
  items: [{id: String, quantity: Number}]

});


module.exports = mongoose.model("FridgeModel", fridgeSchema);
