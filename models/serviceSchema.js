const mongoose = require("mongoose");

const service = new mongoose.Schema({
  name: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "admininfo" },
});
service.set("timestamps", true);
module.exports = mongoose.model("serviceinfo", service);
