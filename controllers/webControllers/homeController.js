const Salary = require("../../models/salary-slip-model");
const { Op, fn, col, where } = require("sequelize");

const getHomePage = async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const page = parseInt(req.query.page) || 1;
  const search = req.query.search || "";
  const month = req.query.month || ""; // month filter
  const year = req.query.year || "";   // year filter
  const offset = (page - 1) * limit;

  let whereCondition = {};

  // SEARCH
  if (search) {
    whereCondition[Op.or] = [
      { EmployeeName: { [Op.like]: `%${search}%` } },
      { CompanyName: { [Op.like]: `%${search}%` } },
    ];
  }

  // MONTH + YEAR filter
  if (month || year) {
    let andConditions = [];

    if (month) {
      andConditions.push(where(fn("MONTH", col("PayDate")), parseInt(month)));
    }
    if (year) {
      andConditions.push(where(fn("YEAR", col("PayDate")), parseInt(year)));
    }

    whereCondition = {
      ...whereCondition,
      [Op.and]: andConditions
    };
  }

  const { count: totalDocs, rows: salary } = await Salary.findAndCountAll({
    where: whereCondition,
    order: [["createdAt", req.query.sort === "asc" ? "ASC" : "DESC"]],
    offset,
    limit,
  });

  const totalPages = Math.ceil(totalDocs / limit);

  res.render("index", {
    data: {
      salary,
      sort: req.query.sort || "desc",
      page,
      totalPages,
      limit,
      search,
      month: req.query.month || "",
      year: req.query.year || ""
  
    },
  });
};

module.exports = { getHomePage };
