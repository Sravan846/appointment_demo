const express = require("express");
const userRouter = require("./user");
const adminRouter = require("./admin");
const teacherRouter = require("./teacher");

const mainRouter = express();

// user module apis
mainRouter.use("/user", userRouter);
// admin module apis
mainRouter.use("/admin", adminRouter);
// Teacher module apis
mainRouter.use("/teacher", teacherRouter);

module.exports = mainRouter;
