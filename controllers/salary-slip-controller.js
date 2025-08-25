const xlsx = require("xlsx");
const Salary = require("../models/salary-slip-model");
const sendMail = require("../service/mailSender");
const { Op } = require("sequelize");
 

const uploadSalaryData = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ status: false, message: "No file uploaded" });
    }
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    let sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    if (!sheetData.length) {
      return res
        .status(400)
        .json({ status: false, message: "Uploaded file is empty" });
    }
let companyLogos = {
  A2G: "/companyLogo/A2G.png",
  AHEC: "/companyLogo/AHEC.png",
  AHIT: "/companyLogo/AHIT.png",
  AHUF: "/companyLogo/AHUF.png",
  BBSMIT: "/companyLogo/BBSMIT.png",
  "BHARAT SCHOOLS": "/companyLogo/Bharat Schools.png",
  "DIWAM HANDICRAFTS": "/companyLogo/Diwam Handicrafts.png",
  "DIWAM JEWELS": "/companyLogo/Diwam Jewels.png",
  "DIWAM VASTRA": "/companyLogo/Diwam Vastra.png",
  "MARIKA TEXTILES": "/companyLogo/Marika Textiles.png",
  MICS: "/companyLogo/MICS.png",
  "UNI HUB": "/companyLogo/Uni Hub.png",
};
    sheetData = sheetData.map((row) => {
      const company = row.CompanyName?.trim().toUpperCase();
      console.log("company-->",company);
      
      return {
        ...row,
        CompanyLogo: companyLogos[company] || "/companyLogo/default.png", 
      };
    });
    await Salary.bulkCreate(sheetData, { validate: true });
    res.json({
      status: true,
      message: "File uploaded, data saved & mails sent successfully!",
    });
  } catch (err) {
    console.error("error", err);
    res.status(500).json({
      status: false,
      message: "Error while processing file",
      error: err.message,
    });
  }
};

const mailSender = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ status: false, message: "No employee IDs provided" });
    }

    const employees = await Salary.findAll({
      where: { id: { [Op.in]: ids } },
    });

    if (!employees || employees.length === 0) {
      return res
        .status(404)
        .json({ status: false, message: "No employees found" });
    }

    // ✅ Pehle hi response bhej do
    res.json({
      status: true,
      message: "Mails are being processed in background",
    });

    // ✅ Background me kaam chalega
    setImmediate(async () => {
      for (const emp of employees) {
        if (!emp.Email && !emp.email) continue;

        let monthYear = "Unknown";
        if (emp.PayDate) {
          try {
            const [dd, mm, yyyy] = emp.PayDate.split("/").map(Number);
            const dateObj = new Date(yyyy, mm - 1, dd);
            monthYear = dateObj.toLocaleString("default", {
              month: "long",
              year: "numeric",
            });
          } catch (e) {
            console.warn("PayDate parsing failed for:", emp.PayDate);
          }
        }

      const mailBody = `
            Dear <b>${emp.EmployeeName || "Employee"}</b>,
            <br/><br/>
            I hope this email finds you well.<br/>
            Please find attached your salary slip for the month of <b>${monthYear}</b>. 
            Kindly review the details, and if you have any questions or concerns, 
            feel free to reach out to the HR department.<br/><br/>
            We appreciate your continued hard work and dedication. 
            Thank you for your valuable contribution to the team.<br/><br/>
            Best regards,<br/>
            <b>${emp.CompanyName}</b>
          `;
      // HTML content for PDF (salary slip layout)
      const salarySlipHtml = `
<html>
  <head>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: "DM Sans", sans-serif;
      }
.salary-slip {
  page-break-inside: avoid;
  width: 100%;
  max-width: 210mm;
  margin: 0 auto;
  background: #fff;
  border: 1px solid #000;
  padding: 6mm;               /* aur kam padding */
  box-sizing: border-box;
  font-size: 12px;             /* thoda compact */
  line-height: 1.3;
}

@page {
  size: A4;
  margin: 6mm;   /* upar neeche margin aur kam */
}

.header {
  position: relative;
  text-align: center;   /* text ko center align */
  margin-bottom: 10px;
}

.company-text {
  flex: 1;
  text-align: center;   /* name + address center me */
}
.company-text h2 {
  font-size: 22px;
  margin: 0;
}
.company-text p {
  font-size: 12px;
  margin: 0;
  color: #333;
}

/* Logo fix top-right */
.company-logo {
  position: absolute;
  top: -15px;   /* pehle 0 tha, ab thoda upar */
  right: 0;
}
.company-logo img {
  width: 65px;   /* thoda compact look */
  height: auto;
}
.header h2 {
  font-size: 22px;
  margin: 0;
}

.header p {
  font-size: 12px;
  margin: 0;
  color: #333;
}

.header img {
  width: 70px;   /* logo chhota */
  height: auto;
  margin-left: 10px; /* thoda gap text se */
}
.salary-slip table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 6px; /* kam spacing between tables */
}
.salary-slip th,
.salary-slip td {
  border: 1px solid #000;
  padding: 3px 6px;   /* cells ke andar ka spacing kam */
  text-align: left;
  font-size: 12px;
}

.employee-summary, .salary-table, .netpay-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 8px;
  font-size: 12px;
}
.employee-summary td, .salary-table td, .salary-table th, .netpay-table td, .netpay-table th {
  border: 1px solid #000;
  padding: 4px 6px;   /* aur compact */
}
.salary-table th, .netpay-table th {
  background: #f5f5f5;
  text-align: left;
}
.netpay td {
  font-weight: bold;
}
.footer {
  margin-top: 5px;
  font-size: 11px;
  text-align: center;
}

/* Watermark */
.watermark {
  position: absolute;
  top: 15%;
  left: 15%;
  transform: translate(-50%, -50%);
  opacity: 0.1;   /* aur light watermark */
  z-index: 0;
}
.watermark img {
  width: 400px;   /* bada watermark */
  height: auto;
}

      
    </style>
  </head>
  <body>
    <div class="salary-slip">
      <!-- Company Header -->
<div class="header">
  <div class="company-text">
    <h2>${emp?.CompanyName || "Company Name"}</h2>
    <p>${emp?.Address || "Company Address"}</p>
  </div>
  <div class="company-logo">
    <img src="https://salaryslip.testwebs.in${emp?.CompanyLogo}" alt="logo">
  </div>
</div>



      <!-- Watermark -->
      <div class="watermark">
        <img src="https://salaryslip.testwebs.in${emp?.CompanyLogo}" alt="logo">
      </div>

      <!-- Employee Summary -->
      <table class="employee-summary">
        <tr>
          <td><b>Employee Pay Summary</b></td>
          <td rowspan="4" colspan="2" style="text-align:center; font-size:16px;">
            <b>${numberToWords(emp?.TotalNetPayout)}</b>
          </td>
        </tr>
        <tr><td><b>Employee Name:</b> ${emp?.EmployeeName}</td></tr>
        <tr><td><b>Employee ID:</b> ${emp?.EmployeeId}</td></tr>
        <tr><td><b>Designation:</b> ${emp?.Designation}</td></tr>
        <tr>
          <td><b>Process Name:</b> ${emp?.ProcessName}</td>
          <td><b>Total Earnings:</b> ${emp?.TotalEarnings}</td>
          <td><b>LOP Days:</b> ${emp?.LOPDays}</td>
        </tr>
        <tr>
          <td><b>Date of Joining:</b> ${emp?.DateOfJoining}</td>
          <td><b>Paid Days:</b> ${emp?.PaidDays}</td>
          <td><b>Pay Date:</b> ${emp?.PayDate}</td>
        </tr>
        <tr>
          <td><b>Pay Period:</b> ${emp?.PayPeriod}</td>
          <td><b>Pay Days:</b> ${emp?.PaidDays}</td>
          <td><b>Paid Leave (PL):</b> ${emp?.PaidLeave}</td>
        </tr>
        <tr>
          <td><b>UAN Number:</b> ${emp?.UANNumber}</td>
          <td colspan="2"><b>ESIC Number:</b> ${emp?.ESICNumber}</td>
        </tr>
      </table>

      <!-- Salary Details -->
      <table class="salary-table">
        <tr>
          <th>SALARY PAYSCALE</th>
          <th>EARNING</th>
          <th>DEDUCTIONS</th>
          <th>AMOUNT</th>
        </tr>
        <tr>
          <td>BASIC</td>
          <td>${emp?.BASIC}</td>
          <td>PF</td>
          <td>${emp?.PF}</td>
        </tr>
        <tr>
          <td>HRA</td>
          <td>${emp?.HRA}</td>
          <td>ESIC</td>
          <td>${emp?.ESIC}</td>
        </tr>
        <tr>
          <td>Incentive</td>
          <td>${emp?.Incentive}</td>
          <td>Total Deductions</td>
          <td>${emp?.TotalDeductions}</td>
        </tr>
        <tr>
          <td><b>Total Earnings</b></td>
          <td><b>${emp?.TotalEarnings}</b></td>
          <td colspan="2"></td>
        </tr>
      </table>

      <!-- Net Pay -->
      <table class="netpay-table">
        <tr><th>NET PAY</th><th>AMOUNT</th></tr>
        <tr><td>Gross Earnings</td><td>${emp?.GrossEarnings}</td></tr>
        <tr><td>Total Deductions</td><td>${emp?.TotalDeductions}</td></tr>
        <tr><td>Total Net Payable</td><td><b>${
          emp?.TotalNetPayout
        }</b></td></tr>
        <tr>
          <td colspan="2" style="text-align:center;">*Total Net Payable = Gross Earnings - Total Deductions + Total Reimbursements</td>
        </tr>
      </table>

      <!-- Footer -->
      <p class="footer"><b><i>This is a Computer-Generated Slip and does not require signature.</i></b></p>
    </div>
  </body>
</html>
`;

        try {
          const pdfPath = await generatePdf(
            salarySlipHtml,
            `salary-slip-${emp.id}.pdf`
          );

          await sendMail(
            emp.Email || emp.email,
            `Your Salary Slip for ${monthYear}`,
            mailBody,
            pdfPath
          );

          console.log(`✅ Mail sent to ${emp.EmployeeName}`);
        } catch (err) {
          console.error(`❌ Mail failed for ${emp.EmployeeName}:`, err.message);
        }
      }
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};




const mailSenderById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("id--->", id);

    // Sirf ek employee fetch karo
    const emp = await Salary.findOne({ where: { id } });
    if (!emp) return res.send("employee is not defined");
    if (!emp.Email && !emp.email) return;

    let monthYear = "Unknown";
    if (emp.PayDate) {
      try {
        const [dd, mm, yyyy] = emp.PayDate.split("/").map(Number);
        const dateObj = new Date(yyyy, mm - 1, dd);
        monthYear = dateObj.toLocaleString("default", {
          month: "long",
          year: "numeric",
        });
      } catch (e) {
        console.warn("PayDate parsing failed for:", emp.PayDate);
      }
    }

    // numberToWords fallback
    const salaryInWords =
      typeof numberToWords === "function"
        ? numberToWords(emp?.TotalNetPayout)
        : emp?.TotalNetPayout;

    // HTML content for PDF (salary slip layout)
    const salarySlipHtml = `
<html>
  <head>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap');
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
        font-family: "DM Sans", sans-serif;
      }
.salary-slip {
  page-break-inside: avoid;
  width: 100%;
  max-width: 210mm;
  margin: 0 auto;
  background: #fff;
  border: 1px solid #000;
  padding: 6mm;               /* aur kam padding */
  box-sizing: border-box;
  font-size: 12px;             /* thoda compact */
  line-height: 1.3;
}

@page {
  size: A4;
  margin: 6mm;   /* upar neeche margin aur kam */
}

.header {
  position: relative;
  text-align: center;   /* text ko center align */
  margin-bottom: 10px;
}

.company-text {
  flex: 1;
  text-align: center;   /* name + address center me */
}
.company-text h2 {
  font-size: 22px;
  margin: 0;
}
.company-text p {
  font-size: 12px;
  margin: 0;
  color: #333;
}

/* Logo fix top-right */
.company-logo {
  position: absolute;
  top: -15px;   /* pehle 0 tha, ab thoda upar */
  right: 0;
}
.company-logo img {
  width: 65px;   /* thoda compact look */
  height: auto;
}
.header h2 {
  font-size: 22px;
  margin: 0;
}

.header p {
  font-size: 12px;
  margin: 0;
  color: #333;
}

.header img {
  width: 70px;   /* logo chhota */
  height: auto;
  margin-left: 10px; /* thoda gap text se */
}
.salary-slip table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 6px; /* kam spacing between tables */
}
.salary-slip th,
.salary-slip td {
  border: 1px solid #000;
  padding: 3px 6px;   /* cells ke andar ka spacing kam */
  text-align: left;
  font-size: 12px;
}

.employee-summary, .salary-table, .netpay-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 8px;
  font-size: 12px;
}
.employee-summary td, .salary-table td, .salary-table th, .netpay-table td, .netpay-table th {
  border: 1px solid #000;
  padding: 4px 6px;   /* aur compact */
}
.salary-table th, .netpay-table th {
  background: #f5f5f5;
  text-align: left;
}
.netpay td {
  font-weight: bold;
}
.footer {
  margin-top: 5px;
  font-size: 11px;
  text-align: center;
}

/* Watermark */
.watermark {
  position: absolute;
  top: 15%;
  left: 15%;
  transform: translate(-50%, -50%);
  opacity: 0.1;   /* aur light watermark */
  z-index: 0;
}
.watermark img {
  width: 400px;   /* bada watermark */
  height: auto;
}

      
    </style>
  </head>
  <body>
    <div class="salary-slip">
      <!-- Company Header -->
<div class="header">
  <div class="company-text">
    <h2>${emp?.CompanyName || "Company Name"}</h2>
    <p>${emp?.Address || "Company Address"}</p>
  </div>
  <div class="company-logo">
    <img src="https://salaryslip.testwebs.in${emp?.CompanyLogo}" alt="logo">
  </div>
</div>



      <!-- Watermark -->
      <div class="watermark">
        <img src="https://salaryslip.testwebs.in${emp?.CompanyLogo}" alt="logo">
      </div>

      <!-- Employee Summary -->
      <table class="employee-summary">
        <tr>
          <td><b>Employee Pay Summary</b></td>
          <td rowspan="4" colspan="2" style="text-align:center; font-size:16px;">
            <b>${numberToWords(emp?.TotalNetPayout)}</b>
          </td>
        </tr>
        <tr><td><b>Employee Name:</b> ${emp?.EmployeeName}</td></tr>
        <tr><td><b>Employee ID:</b> ${emp?.EmployeeId}</td></tr>
        <tr><td><b>Designation:</b> ${emp?.Designation}</td></tr>
        <tr>
          <td><b>Process Name:</b> ${emp?.ProcessName}</td>
          <td><b>Total Earnings:</b> ${emp?.TotalEarnings}</td>
          <td><b>LOP Days:</b> ${emp?.LOPDays}</td>
        </tr>
        <tr>
          <td><b>Date of Joining:</b> ${emp?.DateOfJoining}</td>
          <td><b>Paid Days:</b> ${emp?.PaidDays}</td>
          <td><b>Pay Date:</b> ${emp?.PayDate}</td>
        </tr>
        <tr>
          <td><b>Pay Period:</b> ${emp?.PayPeriod}</td>
          <td><b>Pay Days:</b> ${emp?.PaidDays}</td>
          <td><b>Paid Leave (PL):</b> ${emp?.PaidLeave}</td>
        </tr>
        <tr>
          <td><b>UAN Number:</b> ${emp?.UANNumber}</td>
          <td colspan="2"><b>ESIC Number:</b> ${emp?.ESICNumber}</td>
        </tr>
      </table>

      <!-- Salary Details -->
      <table class="salary-table">
        <tr>
          <th>SALARY PAYSCALE</th>
          <th>EARNING</th>
          <th>DEDUCTIONS</th>
          <th>AMOUNT</th>
        </tr>
        <tr>
          <td>BASIC</td>
          <td>${emp?.BASIC}</td>
          <td>PF</td>
          <td>${emp?.PF}</td>
        </tr>
        <tr>
          <td>HRA</td>
          <td>${emp?.HRA}</td>
          <td>ESIC</td>
          <td>${emp?.ESIC}</td>
        </tr>
        <tr>
          <td>Incentive</td>
          <td>${emp?.Incentive}</td>
          <td>Total Deductions</td>
          <td>${emp?.TotalDeductions}</td>
        </tr>
        <tr>
          <td><b>Total Earnings</b></td>
          <td><b>${emp?.TotalEarnings}</b></td>
          <td colspan="2"></td>
        </tr>
      </table>

      <!-- Net Pay -->
      <table class="netpay-table">
        <tr><th>NET PAY</th><th>AMOUNT</th></tr>
        <tr><td>Gross Earnings</td><td>${emp?.GrossEarnings}</td></tr>
        <tr><td>Total Deductions</td><td>${emp?.TotalDeductions}</td></tr>
        <tr><td>Total Net Payable</td><td><b>${
          emp?.TotalNetPayout
        }</b></td></tr>
        <tr>
          <td colspan="2" style="text-align:center;">*Total Net Payable = Gross Earnings - Total Deductions + Total Reimbursements</td>
        </tr>
      </table>

      <!-- Footer -->
      <p class="footer"><b><i>This is a Computer-Generated Slip and does not require signature.</i></b></p>
    </div>
  </body>
</html>
`;

    // Generate PDF
    const pdfPath = await generatePdf(
      salarySlipHtml,
      `salary-slip-${emp.id}.pdf`
    );

    // Email body
    const mailBody = `
      Dear <b>${emp.EmployeeName || "Employee"}</b>,<br/><br/>
      Please find attached your salary slip for <b>${monthYear}</b>.<br/><br/>
      Best regards,<br/>
      <b>${emp.CompanyName}</b>
    `;

    try {
      await sendMail(
        emp.Email || emp.email,
        `Your Salary Slip - ${monthYear}`,
        mailBody,
        pdfPath
      );
      //  await sendMail(
      //   emp.officeEmail || emp.officeEmail,
      //   `Your Salary Slip - ${monthYear}`,
      //   mailBody,
      //   pdfPath
      // );
    } catch (err) {
      console.error(`Mail failed for ${emp.EmployeeName}:`, err.message);
    }

    res.send({ status: true, message: "Mail sent successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

async function generatePdf(htmlContent, fileName) {
  const fs = require("fs");
  const path = require("path");
  const pdf = require("html-pdf");
  const pdfDir = path.join(__dirname, "pdfs");
  if (!fs.existsSync(pdfDir)) {
    fs.mkdirSync(pdfDir, { recursive: true });
  }
  const pdfPath = path.join(pdfDir, fileName);
  return new Promise((resolve, reject) => {
    pdf
      .create(htmlContent, {
        format: "A4",
        border: {
          top: "10mm",
          right: "10mm",
          bottom: "10mm",
          left: "10mm",
        },
      })
      .toFile(pdfPath, (err, res) => {
        if (err) {
          console.error("PDF generation failed:", err);
          return reject(err);
        }
        resolve(pdfPath);
      });
  });
}

function numberToWords(num) {
  const a = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const b = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function inWords(num) {
    if ((num = num.toString()).length > 9) return "Overflow";
    let n = ("000000000" + num)
      .substr(-9)
      .match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return;
    let str = "";
    str +=
      n[1] != 0
        ? (a[Number(n[1])] || b[n[1][0]] + " " + a[n[1][1]]) + " Crore "
        : "";
    str +=
      n[2] != 0
        ? (a[Number(n[2])] || b[n[2][0]] + " " + a[n[2][1]]) + " Lakh "
        : "";
    str +=
      n[3] != 0
        ? (a[Number(n[3])] || b[n[3][0]] + " " + a[n[3][1]]) + " Thousand "
        : "";
    str +=
      n[4] != 0
        ? (a[Number(n[4])] || b[n[4][0]] + " " + a[n[4][1]]) + " Hundred "
        : "";
    str +=
      n[5] != 0
        ? (str != "" ? "and " : "") +
          (a[Number(n[5])] || b[n[5][0]] + " " + a[n[5][1]]) +
          " "
        : "";
    return str.trim();
  }

  return inWords(num) + " Rupees Only";
}

const getAllSalary = async (req, res) => {
  try {
    const salaries = await Salary.findAll({});
    res.send({ status: true, data: salaries });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Error fetching records",
      error: err.message,
    });
  }
};

const getSalaryById = async (req, res) => {
  try {
    const salary = await Salary.findByPk(req.params.id);
    if (!salary) {
      return res
        .status(404)
        .json({ status: false, message: "Record not found" });
    }
    res.json({ status: true, data: salary });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Error fetching record",
      error: err.message,
    });
  }
};

const updateSalary = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updated = await Salary.update(updateData, {
      where: { id: Number(id) },
    });
    console.log(updated);

    if (updated[0] === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    res.json({ message: "Salary slip updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteSalary = async (req, res) => {
  try {
    const salary = await Salary.findByPk(req.params.id);
    if (!salary) {
      return res
        .status(404)
        .json({ status: false, message: "Record not found" });
    }

    await salary.destroy();
    res.json({ status: true, message: "Record deleted successfully" });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Error deleting record",
      error: err.message,
    });
  }
};

const searchSalary = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res
        .status(400)
        .json({ status: false, message: "Keyword is required for search" });
    }

    const salaries = await Salary.findAll({
      where: {
        [require("sequelize").Op.or]: [
          { EmployeeName: { [require("sequelize").Op.like]: `%${keyword}%` } },
          { EmployeeId: { [require("sequelize").Op.like]: `%${keyword}%` } },
          { CompanyName: { [require("sequelize").Op.like]: `%${keyword}%` } },
          { Designation: { [require("sequelize").Op.like]: `%${keyword}%` } },
        ],
      },
    });

    res.json({ status: true, data: salaries });
  } catch (err) {
    res.status(500).json({
      status: false,
      message: "Error searching records",
      error: err.message,
    });
  }
};

module.exports = {
  uploadSalaryData,
  getAllSalary,
  mailSender,
  getSalaryById,
  updateSalary,
  deleteSalary,
  searchSalary,
  mailSenderById,
};
