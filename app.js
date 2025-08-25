const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require("http");
var path = require("path");
const ejs = require("ejs");
const salaryRouter = require("./routers/salary-slip-router")
const indexRouter = require("./routers/webRoutes/indexRouter")
const previewRouter = require("./routers/webRoutes/previewRouter")
const editSalarySlipRouter = require("./routers/webRoutes/editSalarySlipRouter")

const env = require("dotenv");
const Sequelize = require("./config/db");

const cookieParser = require("cookie-parser");

//Server Terms
const app = express();
const Server = http.createServer(app);
const port = 8081;

app.use(cors());

//Env config
env.config();
app.use(cookieParser("hello"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Template engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static("public"));

app.use("/",indexRouter)
app.use("/preview",previewRouter)
app.use("/edit",editSalarySlipRouter)
app.use("/salary-slip",salaryRouter)


//Dynamic Files Setup
app.use("/files", express.static(path.join(__dirname, "files")));

const uploadsPath = path.join(__dirname, "images");
app.use("/images", express.static(uploadsPath));

Server.listen(port, () => {
  console.log(`http://localhost:${port}`);
});


