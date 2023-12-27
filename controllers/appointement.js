const serviceSchema = require("../models/serviceSchema");
const teacherSchema = require("../models/teacherSchema");
const userSchema = require("../models/userSchema");
const appointmentSchema = require("../models/appointmentSchema");
const json = require("jsonwebtoken");
const json2xls = require("json2xls");
const fs = require("fs");
const path = require("path");
const moment = require("moment/moment");
const { insertEvent, getEvents, deleteEvent } = require("../config/googleCalender");
require("dotenv").config();

// verify token for user
const verifyuser = async (socket) => {
  try {
    let token = socket.handshake.headers.authorization;
    if (token) {
      const verify = json.verify(token, process.env.secrate);
      let checkIdExist = await userSchema.findById(verify.id);
      if (checkIdExist) {
        return checkIdExist;
      } else {
        socket.emit("response", {
          message: "Not have rights controller this module",
        });
      }
    } else {
      socket.emit("response", {
        message: "This serviceId & timerid must be required",
      });
    }
  } catch (error) {
    socket.emit("response", { message: error.message });
  }
};
module.exports = {
  // add new appointment for user
  newAppointement: async (data, socket) => {
    try {
      const { serviceId, startTime, endTime, teacherId } = data;
      if ((serviceId && startTime && endTime, teacherId)) {
        // verify user by token
        let user = await verifyuser(socket);
        if (user) {
          // get service details by unique id
          let serviceCheck = await serviceSchema.findById(serviceId);
          if (serviceCheck) {
            // check this time slote teacher is available or not
            let checkTimeSlot = await teacherSchema.find(
              {
                _id: teacherId,
                times: {
                  $elemMatch: {
                    startTime: startTime,
                    endTime: endTime,
                    status: { $ne: "booked" },
                  },
                },
              },
              { "times.$": 1 }
            );
            // if yes then move forword else return message
            if (checkTimeSlot.length > 0) {
              // check this time slot user already used or not
              let checkTimeSlotBooked = await appointmentSchema.find({
                userid: user.id,
                startTime: startTime,
                endTime: endTime,
                status: "booked",
              });
              // if yes then return message else  move forword
              if (checkTimeSlotBooked.length > 0) {
                socket.emit("response", {
                  message: "You cannot booked the slot at same time ",
                });
              } else {
                // add new appointment for this user
                await appointmentSchema.create({
                  userid: user.id,
                  serviceId: serviceCheck.id,
                  teacherId: checkTimeSlot[0].id,
                  startTime: startTime,
                  endTime: endTime,
                  status: "booked",
                });
                // change status in teacher schema for specified user time slote
                await teacherSchema.findOneAndUpdate(
                  {
                    _id: checkTimeSlot[0].id,
                    "times.startTime": startTime,
                    "times.endTime": endTime,
                  },
                  { "times.$.status": "booked" }
                );
                // schedule appoitment  on google  calender
                let event = {
                  summary: `This is the appoitment demo .`,
                  description: `this event for enrolled this course.`,
                  start: {
                    dateTime: `${moment(startTime).format(
                      "YYYY-MM-DD HH:mm:ss"
                    )}.000+05:30`,
                    timeZone: "Asia/Kolkata",
                  },
                  end: {
                    dateTime: `${moment(endTime).format(
                      "YYYY-MM-DD HH:mm:ss"
                    )}.000+05:30`,
                    timeZone: "Asia/Kolkata",
                  },
                };
                insertEvent(event)
                  .then((res) => {
                    if (res == 1) {
                      socket.emit("response", {
                        message: "Your appoinment is booked",
                      });
                    } else {
                      console.log(res);
                    }
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              }
            } else {
              socket.emit("response", {
                message: "this time slot is not available",
              });
            }
          } else {
            socket.emit("response", {
              message: "This serviceId & timerid must be required",
            });
          }
        }
      } else {
        socket.emit("response", {
          message: "Token is required",
        });
      }
    } catch (error) {
      socket.emit("response", { message: error.message });
    }
  },
  // get all appointment details for that user
  appointmentList: async (data, socket) => {
    try {
      const { teacherId, startDate, endDate, download, type, page = 1, limit = 10 } = data;
      let search = {};
      // data to json
      let json = [];
      // get appointment by teacher details
      if (teacherId) {
        search["teacherId"] = teacherId;
      }
      // get appointment by last two days
      if (type == 1) {
        search["startTime"] = {
          $gte: moment()
            .subtract(2, "days")
            .format("YYYY-MM-DDTHH:mm:ss.390+00:00"),
        };
        search["endTime"] = {
          $lte: moment().format("YYYY-MM-DDTHH:mm:ss.390+00:00"),
        };
      }
      // get appointment by last week
      if (type == 2) {
        search["startTime"] = {
          $gte: moment()
            .subtract(1, "weeks")
            .startOf("isoWeek")
            .format("YYYY-MM-DDTHH:mm:ss.390+00:00"),
        };
        search["endTime"] = {
          $lte: moment()
            .subtract(1, "weeks")
            .endOf("isoWeek")
            .format("YYYY-MM-DDTHH:mm:ss.390+00:00"),
        };
      }
      // get appointment by month week
      if (type == 3) {
        search["startTime"] = {
          $gte: moment()
            .subtract(1, "months")
            .startOf("month")
            .format("YYYY-MM-DDTHH:mm:ss.390+00:00"),
        };
        search["endTime"] = {
          $lte: moment()
            .subtract(1, "months")
            .endOf("month")
            .format("YYYY-MM-DDTHH:mm:ss.390+00:00"),
        };
      }
      // get appointment by custom Date
      if (type == 4) {
        if (startDate) {
          search["startTime"] = {
            $gte: new Date(startDate).getTime(),
          };
        }
        if (endDate) {
          search["endTime"] = {
            $lte: new Date(endDate).getTime(),
          };
        }
      }
      // verify user by token
      let user = await verifyuser(socket);
      if (user) {
        search["userid"] = user.id;
        let result = await appointmentSchema
          .find(search)
          .populate([
            { path: "userid", select: { name: 1, _id: 0 } },
            { path: "serviceId", select: { name: 1, _id: 0 } },
            { path: "teacherId", select: { name: 1, _id: 0 } },
          ])
          .limit(limit * 1)
          .skip((page - 1) * limit);
        let count = await appointmentSchema.find(search).count();
        if (download) {
          // store required filed and value for show data in excel
          result.forEach((i) => {
            json.push({
              username: i.userid.name,
              service: i.serviceId.name,
              teacher: i.teacherId.name,
              strarTime: i.startTime,
              endTime: i.endTime,
              status: i.status,
            });
          });
          // convert json to excel formate
          const xls = json2xls(json);
          let fileName = `apt_sheet_${Date.now()}.xlsx`;
          // store this file in specific forler
          fs.writeFileSync(
            path.join(__dirname, "../public", fileName),
            xls,
            "binary"
          );
          // give output
          socket.emit("response", {
            message: "List of your appointemnts ",
            downloadLink: `http://localhost:4000/${fileName}`,
            result,
          });
        } else {
          socket.emit("response", {
            message: "List of your appointemnts ",
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            result,
          });
        }
      }
    } catch (error) {
      socket.emit("response", { message: error.message });
    }
  },
  // user can cancel the appointment by id
  cancelAppoitmentById: async (data, socket) => {
    try {
      const { apId } = data;
      // verify token for user
      let user = await verifyuser(socket);
      if (user) {
        // check appoitment is exist or not
        let checkData = await appointmentSchema.findById(apId);
        if (checkData) {
          // check this appoitment for user is valid or not
          if (checkData.userid == user.id) {
            await teacherSchema.updateOne(
              {
                _id: checkData.teacherId,
                "times.startTime": moment(checkData.startTime).format(
                  "YYYY-MM-DDTHH:mm"
                ),
                "times.endTime": moment(checkData.endTime).format(
                  "YYYY-MM-DDTHH:mm"
                ),
              },
              { "times.$.status": "free" }
            );
            await appointmentSchema.findByIdAndUpdate(checkData.id, {
              status: "canceled",
            });
            socket.emit("response", {
              message: "This appointment is cancelled successfully",
            });
          } else {
            socket.emit("response", {
              message: "you dont rights to controll others appointments",
            });
          }
        } else {
          socket.emit("response", {
            message: "This appointemnt is not exist",
          });
        }
      }
    } catch (error) {
      socket.emit("response", { message: error.message });
    }
  },
  // user delete the appointment
  deleteAppoitemntById: async (data, socket) => {
    try {
      const { apId } = data;
      // verify user by token
      let user = await verifyuser(token, socket);
      if (user) {
        // check this appointment is exist or not by appoinment unique id
        let checkData = await appointmentSchema.findById(apId);
        if (checkData) {
          // check this appoitment for user is valid or not
          if (checkData.userid == user.id) {
            // delete this appoitment by appoinment unique id
            await appointmentSchema.findByIdAndDelete(checkData.id);
            socket.emit("response", {
              message: "this appoitment is deleted successfuly",
            });
          } else {
            socket.emit("response", {
              message: "you dont rights to controll others appointments",
            });
          }
        } else {
          socket.emit("response", {
            message: "This appointemnt is not exist",
          });
        }
      }
    } catch (error) {
      socket.emit("response", { message: error.message });
    }
  },
  // filter appoitments from google calender
  filterGoogleCal: async (data, socket) => {
    const { startDate, endDate } = data;
    getEvents(
      `${moment(startDate).format("YYYY-MM-DD")}T00:00:00.000Z`,
      `${moment(endDate).format("YYYY-MM-DD")}T00:00:00.000Z`
    )
      .then((res) => {
        socket.emit("response", {
          message: "List of schedule  courses on google calender ",
          res,
        });
      })
      .catch((err) => {
        socket.emit("response", { message: err });
      });
  },
  deleteGoogleCaltask: async (data, socket) => {
    const { eventid } = data;
    if (eventid) {
      deleteEvent(eventid)
        .then((res) => {
          if (res == 1) {
            socket.emit("response", {
              message: "deleted successfully from google calender",
            });
          }
        })
        .catch((err) => {
          socket.emit("response", { message: err });
        });
    } else {
      socket.emit("response", { message: "Event id is required" });
    }
  },

};
