const mongoose = require("mongoose");

const admin = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  gender: String,
});
admin.set("timestamps", true);
module.exports = mongoose.model("admininfo", admin);
