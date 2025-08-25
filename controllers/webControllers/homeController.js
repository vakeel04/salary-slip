const { Op, fn, col, where, literal } = require("sequelize");
const Salary = require("../../models/salary-slip-model");

const getHomePage = async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const page = parseInt(req.query.page) || 1;
  const search = req.query.search || "";
  const offset = (page - 1) * limit;
  const month = req.query.month; // "05"
  const year = req.query.year; // "2025"

  let andConditions = [];
  if (search) {
    andConditions.push({
      [Op.or]: [
        { EmployeeName: { [Op.like]: `%${search}%` } },
        { CompanyName: { [Op.like]: `%${search}%` } },
      ],
    });
  }
  if (month) {
    andConditions.push(
      where(fn("substr", col("PayDate"), 4, 2), month.padStart(2, "0"))
    );
  }
  if (year) {
    andConditions.push(where(fn("substr", col("PayDate"), 7, 4), year));
  }
  const whereCondition =
    andConditions.length > 0 ? { [Op.and]: andConditions } : {};

  console.log("👉 Final whereCondition:", whereCondition);

  const { count: totalDocs, rows: salary } = await Salary.findAndCountAll({
    where: whereCondition,
    order: [["createdAt", req.query.sort === "asc" ? "ASC" : "DESC"]],
    offset,
    limit,
  });

  const totalPages = Math.ceil(totalDocs / limit);
  res.render("index", {
    data: {salary, sort: req.query.sort || "desc",page,totalPages,limit, search,},});
};

module.exports = { getHomePage };
