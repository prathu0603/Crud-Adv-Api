const mongoose = require("mongoose");

const CrudSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  surname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  job: {
    type: String,
    required: true,
  },
  contact: {
    type: Number,
    required: true,
  },
  skill: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("user", CrudSchema);
