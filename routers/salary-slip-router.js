const express = require("express");
const upload = require("../service/multer");  
const salary = require("../controllers/salary-slip-controller");

const salaryRouter = express.Router();

salaryRouter.post("/upload", upload.single("file"), salary.uploadSalaryData);
salaryRouter.post("/sendmail",  salary.mailSender);
salaryRouter.post("/sendmail/:id",  salary.mailSenderById);
salaryRouter.get("/:id", salary.getSalaryById);
salaryRouter.put("/:id", salary.updateSalary);
salaryRouter.delete("/:id", salary.deleteSalary);
salaryRouter.get("/", salary.getAllSalary);
salaryRouter.get("/search/query", salary.searchSalary);

module.exports = salaryRouter;
