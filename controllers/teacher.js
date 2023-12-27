const teacherSchema = require("../models/teacherSchema");
const bcrypt = require("bcryptjs");
const json = require("jsonwebtoken");
const { verifyAdmin } = require("./service");
const serviceSchema = require("../models/serviceSchema");
require("dotenv").config();
// verify token for teacher 
const verifyTeacher = async (socket) => {
  try {
    let token = socket.handshake.headers.authorization;
    if (token) {
      const verify = json.verify(token, process.env.secrate);
      let checkIdExist = await teacherSchema.findById(verify.id);
      if (checkIdExist) {
        return checkIdExist;
      } else {
        io.emit("response", {
          message: "Not have rights controller this module",
        });
      }
    } else {
      socket.emit("response", {
        message: "This fields  subject, startTime, endTime are required",
      });
    }
  } catch (error) {
    io.emit("response", { message: error.message });
  }
};
module.exports = {
  // add  new teacher
  newteacher: async (req, res) => {
    const { name, email, password, gender,subject } = req.body;
    try {
      const checkEmailExist = await teacherSchema.find({ email });
      if (checkEmailExist.length > 0) {
        res.json({ err: "This email is already exist" });
      } else {
        const hashPassword = await bcrypt.hash(password, 10);
        await teacherSchema.create({
          name,
          email,
          gender,
          password: hashPassword,
          subject: subject,
          serviceId: null,
          approvedBy: null,
        });
        res.status(200).json({
          message: "New teacher is  register successfully, you can  login now ",
        });
      }
    } catch (error) {
      res.json({ err: error.message });
    }
  },
  // teacher login
  teacherLogin: async (req, res) => {
    const { email, password } = req.body;
    try {
      const checkEmailExist = await teacherSchema.findOne({ email });
      if (checkEmailExist) {
        if (await bcrypt.compare(password, checkEmailExist.password)) {
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
          // res.status(401).json({ err: "password is not matched" });
          res.json({ err: "password is not matched" });
        }
      } else {
        res.json({ err: "email is not exist" });
      }
    } catch (error) {
      res.json({ err: error.message });
    }
  },
  // schedule daily available time hours wise(startTime,endTime)
  todayShedule: async (data, socket) => {
    try {
      const { times } = data;
      if (times) {
        // verify token and get teacher details using id
        let teachid = await verifyTeacher(socket);
        if (teachid) {
          // schedule the daily route times
          await teacherSchema.findByIdAndUpdate(teachid.id, {
            times,
          });
          socket.emit("response", { message: "task  is added" });
        }
      } else {
        socket.emit("response", { message: "Token is required" });
      }
    } catch (error) {
      socket.emit("response", { message: error.message });
    }
  },
  // admin assign serivice to teacher
  serviceAssign: async (data, socket) => {
    try {
      const { teacherId, serviceId } = data;
      if (teacherId && serviceId) {
        // verify token get admin details
        let admin = await verifyAdmin(socket);
        if (admin) {
          // check and get service details by id
          let service = await serviceSchema.findById(serviceId);
          if (service) {
            // check and get teacher details by id
            let teacher = await teacherSchema.findById(teacherId);
            if (teacher) {
              // set serviceid and approviedby in side teacher schema
              await teacherSchema.findByIdAndUpdate(teacher.id, {
                serviceId: service.id,
                approvedBy: admin.id,
              });
              socket.emit("response", {
                message: "service is assigned to this teacher",
              });
            } else {
              socket.emit("response", {
                message: "This teacher id is not exist",
              });
            }
          } else {
            socket.emit("response", {
              message: "This service id is not exist",
            });
          }
        }
      } else {
        socket.emit("response", { message: "Token is required" });
      }
    } catch (error) {
      socket.emit("response", { message: error.message });
    }
  },
};
