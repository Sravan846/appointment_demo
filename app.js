const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mainRouter = require("./routes");
const { mainSocket } = require("./socket/main");
const cors = require('cors');
require("dotenv").config();
require("./config/db");
const Queue = require('bull');
const app = express();
// const myQueue = new Queue('myQueue', {
//   redis: {
//     host: 'localhost',
//     port: 6379,
//   },
// });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cors())
// all backend rest apis
app.use("/api", mainRouter);
require("./swaggerdemo")(app)
const server = http.createServer(app);
const io = new Server(server);
// const bullDemo = async () => {
//   const data={
//     name:"example data",
//   }
//   myQueue.add(data);
// };
// myQueue.process((job) => {
//   // Perform the necessary operations for the job
//   // You can access the job data using job.data
//   console.log('Processing job:', job.data);
//   job.data.name1="example data1"
  
//   // Return a result or a promise for async jobs
//   console.log('Job completed successfully');
//   return Promise.reject('Job completed successfully');
//   // done()
// });
// myQueue.on('completed', (job, result) => {
//   console.log(`Job ${job.id} completed with result:`, result);
// });
// myQueue.on('failed', (job, result) => {
//   console.log('Processing job:', job.data);
//   console.log(`Job ${job.id} failed with result:`, result);
// });
io.on("connection", (socket) => {
  console.log(socket.id);
  console.log("a user connected");
  mainSocket(io, socket);
});
server.listen(process.env.Port || 4000, () => {
  // bullDemo()
  console.log(`server is started on this ${process.env.Port}`);
});
