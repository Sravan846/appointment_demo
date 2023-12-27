const serviceCTRl = require("../controllers/service");
const teacherCTRl = require("../controllers/teacher");
const aptCTRl = require("../controllers/appointement");
const userCTRl = require("../controllers/user");
module.exports.mainSocket = (io, socket) => {
  socket.on("request", async (data) => {
    const { event, body } = data;
    try {
      switch (event) {
        // service module
        case "newService":
          serviceCTRl.newService(body, socket);
          break;
        case "getAllService":
          serviceCTRl.getAllService(body, socket);
          break;
        case "updateServiceById":
          serviceCTRl.updateServiceById(body, socket);
          break;
        case "deleteServiceById":
          serviceCTRl.deleteServiceById(body, socket);
          break;
        case "getServiceByid":
          serviceCTRl.getServiceByid(body, socket);
          break;
        //   teacher module
        case "todayShedule":
          teacherCTRl.todayShedule(body, socket);
          break;
        case "serviceAssign":
          teacherCTRl.serviceAssign(body, socket);
          break;
        case "getAllTeachers":
          serviceCTRl.serviceAssign(body, socket);
          break;
        case "getAllUsers":
          serviceCTRl.getAllUsers(body, socket);
          break;

        // appointemnt module
        case "newAppointement":
          aptCTRl.newAppointement(body, socket);
          break;
        case "appointmentList":
          aptCTRl.appointmentList(body, socket);
          break;
        case "cancelAppoitmentById":
          aptCTRl.cancelAppoitmentById(body, socket);
          break;
        case "deleteAppoitemntById":
          aptCTRl.deleteAppoitemntById(body, socket);
          break;
        // google calender
        case "filterGoogleCal":
          aptCTRl.filterGoogleCal(body, socket);
          break;
        case "deleteGoogleCaltask":
          aptCTRl.deleteGoogleCaltask(body, socket);
          break;

        default:
          io.emit("response", { message: "This is wrong event" });
          break;
      }
    } catch (error) {
      socket.emit("response", { message: error.message });
    }
  });
};
