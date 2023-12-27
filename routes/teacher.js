const express = require("express");
const teacherCntrl = require("../controllers/teacher");
const auth = require("../middleware/auth");

const adminRouter = express();

adminRouter.post("/add", auth.newTeacherValidator, teacherCntrl.newteacher);
adminRouter.post("/login", auth.loginValidator, teacherCntrl.teacherLogin);
adminRouter.post("/schedule", teacherCntrl.todayShedule);

module.exports = adminRouter;
