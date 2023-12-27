const express = require("express");
const adminCntrl = require("../controllers/admin");
const teacherCntrl = require("../controllers/teacher");
const auth = require("../middleware/auth");

const adminRouter = express();

adminRouter.post("/add", auth.newAdminValidator, adminCntrl.newAdmin);
adminRouter.post("/login", auth.loginValidator, adminCntrl.adminLogin);
adminRouter.post("/assign", teacherCntrl.serviceAssign);


module.exports = adminRouter;
