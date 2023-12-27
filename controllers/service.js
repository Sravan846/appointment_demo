const serviceSchema = require("../models/serviceSchema");
const adminSchema = require("../models/adminSchema");
const json = require("jsonwebtoken");
const teacherSchema = require("../models/teacherSchema");
const userSchema = require("../models/userSchema");
require("dotenv").config();

// verify token for admin
const verifyAdmin = async (socket) => {
  try {
    let token = socket.handshake.headers.authorization;
    if (token) {
      const verify = json.verify(token, process.env.secrate);
      let checkIdExist = await adminSchema.findById(verify.id);
      if (checkIdExist) {
        return checkIdExist;
      } else {
        socket.emit("response", {
          message: "Not have rights controller this module",
        });
      }
    } else {
      socket.emit("response", { message: "Service name is required" });
    }
  } catch (error) {
    socket.emit("response", { message: error.message });
  }
};
module.exports = {
  // add new service
  newService: async (data, socket) => {
    try {
      const { serviceName } = data;
      if (serviceName) {
        let adminid = await verifyAdmin(token, socket);
        if (adminid) {
          let checkServiceExist = await serviceSchema.find({
            name: serviceName,
          });
          if (checkServiceExist.length > 0) {
            socket.emit("response", {
              message: "This type of service is already exist",
            });
          } else {
            await serviceSchema.create({
              name: serviceName,
              createdBy: adminid.id,
            });
            socket.emit("response", { message: "New service is added" });
          }
        }
      } else {
        socket.emit("response", { message: "Token is required" });
      }
    } catch (error) {
      socket.emit("response", { message: error.message });
    }
  },
  //  get all service details
  getAllService: async (data, socket) => {
    try {
      const { name } = data;
      let search = {};
      if (name) {
        search["name"] = { $regex: name, $options: "i" };
      }
      let response = await serviceSchema
        .find(search)
        .populate({ path: "createdBy", select: { name: 1, _id: 0 } });
      socket.emit("response", { message: "List of service", response });
    } catch (error) {
      socket.emit("response", { message: error.message });
    }
  },
  // update service details by id for particular admin
  updateServiceById: async (data, socket) => {
    try {
      const { serviceId, serviceName } = data;
      if (serviceId && serviceName) {
        // verify admin and get admin details by id
        let adminid = await verifyAdmin(socket);
        if (adminid) {
          // check service is exist or not by unique  id
          let checkServiceExist = await serviceSchema.findById(serviceId);
          if (checkServiceExist) {
            // check service createby  admin if true then those admin can update that service details
            if ((checkServiceExist.createdBy == adminid.id)) {
              // update service details by id
              await serviceSchema.findByIdAndUpdate(checkServiceExist.id, {
                name: serviceName,
              });
              socket.emit("response", {
                message: "This service is updated succsefully",
              });
            } else {
              socket.emit("response", {
                message: "Not have a rights to update this service",
              });
            }
          } else {
            socket.emit("response", {
              message: "This service is not exist ",
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
  // delete  service details by id for particular admin
  deleteServiceById: async (data, socket) => {
    try {
      const { serviceId } = data;
      if (serviceId) {
        // verify admin and get admin details by id
        let adminid = await verifyAdmin(socket);
        if (adminid) {
          // check service is exist or not by unique  id
          let checkServiceExist = await serviceSchema.findById(serviceId);
          if (checkServiceExist) {
            // check service createby  admin if true then those admin can update that service details
            if ((checkServiceExist.createdBy = adminid.id)) {
              // delete  service details by id
              await serviceSchema.findByIdAndDelete(checkServiceExist.id);
              socket.emit("response", {
                message: "This service is deleted succsefully",
              });
            } else {
              socket.emit("response", {
                message: "Not have a rights to delete this service",
              });
            }
          } else {
            socket.emit("response", {
              message: "This service is not exist ",
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
  verifyAdmin,
  // get  assign teacher details  using service id
  getServiceByid: async (data, socket) => {
    try {
      const { id } = data;
      //  get teacher details by service id
      let response = await teacherSchema.find(
        { serviceId: id },
        { name: 1, email: 1, gender: 1, subject: 1, serviceId: 1, times: 1 }
      );
      if (response.length > 0) {
        socket.emit("response", { message: "This service details", response });
      } else {
        socket.emit("response", {
          message: "In this service not have any worker",
        });
      }
    } catch (error) {
      socket.emit("response", { message: error.message });
    }
  },
  getAllUsers: async (data, socket) => {
    try {
      let adminid = await verifyAdmin(socket);
      if (adminid) {
        let response = await userSchema.find();
        socket.emit("response", {
          message: "List of users",
          response,
        });
      }
    } catch (error) {
      socket.emit("response", { message: error.message });
    }
  },
  getAllTeachers: async (data, socket) => {
    try {
      let adminid = await verifyAdmin(socket);
      if (adminid) {
        let response = await teacherSchema.find();
        socket.emit("response", {
          message: "List of techers",
          response,
        });
      }
    } catch (error) {
      socket.emit("response", { message: error.message });
    }
  },
};
