const adminschema = require("../models/adminSchema");
const bcrypt = require("bcryptjs");
const json = require("jsonwebtoken");
require("dotenv").config();

module.exports = {
  // create new admin
  newAdmin: async (req, res) => {
    const { name, email, password, gender } = req.body;
    try {
      // check email is already exist or not
      const checkEmailExist = await adminschema.find({ email });
      if (checkEmailExist.length > 0) {
        res.json({ err: "This email is already exist" });
      } else {
        // if no then added new admin
        const hashPassword = await bcrypt.hash(password, 10);
        await adminschema.create({
          name,
          email,
          gender,
          password: hashPassword,
        });
        res.status(200).json({
          message: "new admin successfully added, you can  login now ",
        });
      }
    } catch (error) {
      res.json({ err: error.message });
    }
  },
  // admin login
  adminLogin: async (req, res) => {
    const { email, password } = req.body;
    try {
      // check email is exist or not
      const checkEmailExist = await adminschema.findOne({ email });
      if (checkEmailExist) {
        // check pasword is correct or not
        if (await bcrypt.compare(password, checkEmailExist.password)) {
          // generate token with store id
          const token = json.sign(
            { id: checkEmailExist.id },
            process.env.secrate
            // {
            //   expiresIn: "1h",
            // }
          );
          res.json({
            result: "login successfully",
            token,
            username: checkEmailExist.name,
          });
        } else {
          res.json({ err: "password is not matched" });
        }
      } else {
        res.json({ err: "email is not exist" });
      }
    } catch (error) {
      res.json({ err: error.message });
    }
  },
};
