const userSchema = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const json = require("jsonwebtoken");
require("dotenv").config();

module.exports = {
  
  // register new user
  userRegister: async (req, res) => {
    const { name, email, password, gender } = req.body;
    try {
      // email is exist or not
      const checkEmailExist = await userSchema.find({ email });
      if (checkEmailExist.length > 0) {
        res.json({ err: "This email is already exist" });
      } else {
        // password  hassing
        const hashPassword = await bcrypt.hash(password, 10);
        // insert new user
        await userSchema.create({name,email,gender,password: hashPassword,otp: null,otpExpires: null});
        res.status(200).json({
          message: "you are  register successfully, you can login now ",
        });
      }
    } catch (error) {
      res.json({ err: error.message });
    }
  },
  //  user login
  userLogin: async (req, res) => {
    const { email, password } = req.body;
    try {
      // check email is exist or not
      const checkEmailExist = await userSchema.findOne({ email });
      if (checkEmailExist) {
        // compare password in a plan
        if (await bcrypt.compare(password, checkEmailExist.password)) {
          // store data in a token
          const token = json.sign(
            { id: checkEmailExist.id },
            process.env.secrate,
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
  // password change
  forgotPassowrd: async (req, res) => {
    try {
      const { email } = req.body;
      if (email) {
        // check email is exist or not
        const checkEmailExist = await userSchema.findOne({ email });
        if (checkEmailExist) {
          // generate random otp code and also set time 5 min extra
          let otpcode = Math.floor(Math.random() * 100000 + 1);
          let date = new Date();
          date.setTime(date.getTime() + 5 * 60 * 1000);
          // set values of otp and datetime
          await userSchema.findByIdAndUpdate(checkEmailExist.id, {
            otp: otpcode,
            otpExpires: date,
          });
          res.status(200).json({ message: "email is sended" });
        } else {
          res.status(400).json({ message: "email is not exist" });
        }
      } else {
        res.status(400).json({ message: "Email is required" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
  // verify otp
  verifyOtp: async (req, res) => {
    const { otp, password } = req.body;
    try {
      // verify otp
      let optexist = await userSchema.findOne({ otp });
      if (optexist) {
        var date = new Date();
        // check the date is grenter then current time
        if (optexist.otpExpires > date) {
          // password hassing
          const hashPassword = await bcrypt.hash(password, 10);
          // update the password with matched object id
          await userSchema.findByIdAndUpdate(optexist.id, {
            password: hashPassword,
          });
          res.status(200).json({ message: "Password is changed" });
        } else {
          res.status(400).json({
            message:
              "The time is expired , please go to  hit  forgot password api again. ",
          });
        }
      } else {
        res.status(400).json({ message: "This otp is not matched" });
      }
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },
};
