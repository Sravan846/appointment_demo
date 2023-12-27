const mongoose = require("mongoose");

const teacher = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  gender: String,
  subject: String,
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "serviceinfo" },
  times: Array,
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "admininfo" },
});
teacher.set("timestamps", true);
module.exports = mongoose.model("teacherinfo", teacher);
