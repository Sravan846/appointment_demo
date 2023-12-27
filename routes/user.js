const express = require("express");
const userCntrl = require("../controllers/user");
const aptCntrl = require("../controllers/appointement");
const auth = require("../middleware/auth");

const userRouter = express();
/**
 * @typedef userRegister
 * @property {string} email.required
 * @property {string} password.required
 * @property {string} name.required
 * @property {string} gender.required
 */

/**
 * user Register
 * @route POST /user/register
 * @param {userRegister.model} userRegister.body.required - admin login object
 * @group Admin - Admin operation
 * @returns {object} 200 -
 *      Return Jwt Token in key result.token
 *
 * @returns {Error}  Error - Unexpected error
 */
userRouter.post("/register", auth.registerValidator, async (req, res) => {
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
      await userSchema.create({
        name,
        email,
        gender,
        password: hashPassword,
        otp: null,
        otpExpires: null,
      });
      res.status(200).json({
        message: "you are  register successfully, you can login now ",
      });
    }
  } catch (error) {
    res.json({ err: error.message });
  }
});
userRouter.post("/login", auth.loginValidator, userCntrl.userLogin);
userRouter.post("/forgotPassowrd", userCntrl.forgotPassowrd);
userRouter.post("/verifyOtp", auth.otpValidator, userCntrl.verifyOtp);



userRouter.post("/newapt", aptCntrl.newAppointement);
userRouter.get("/myapt", aptCntrl.appointmentList);
userRouter.post("/cancelapt", aptCntrl.cancelAppoitmentById);
userRouter.delete("/deleteapt", aptCntrl.deleteAppoitemntById);



module.exports = userRouter;
