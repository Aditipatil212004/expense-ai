const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: {
  type: String,
  required: true,
},
});

module.exports = mongoose.model("User", userSchema);