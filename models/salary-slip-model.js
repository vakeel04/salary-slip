const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Salary = sequelize.define(
  "salary-detail",
  {
    CompanyName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    CompanyLogo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    EmployeeName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    EmployeeId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Designation: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    ProcessName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    DateOfJoining: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    PayPeriod: {
      type: DataTypes.STRING,
    },
    PaidDays: {
      type: DataTypes.STRING,
    }, 
    LOPDays: {
      type: DataTypes.STRING,
    },
    PaidLeave: {
      type: DataTypes.STRING,
    },

    
 PayDate: {
  type: DataTypes.STRING,
},
    ESICNumber: {
      type: DataTypes.STRING,
    },
    UANNumber: {
      type: DataTypes.STRING,
    },
    BASIC: {
      type: DataTypes.STRING,
    },
    HRA: {
      type: DataTypes.STRING,
    },
    PF: {
      type: DataTypes.STRING,
    },
    Incentive: {
      type: DataTypes.STRING,
    },
    ESIC: {
      type: DataTypes.STRING,
    },
    TotalEarnings: {
      type: DataTypes.STRING,
    },
    TotalDeductions: {
      type: DataTypes.STRING,
    },
    GrossEarnings: {
      type: DataTypes.STRING,
    },
    TotalNetPayout: {
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: true,
    tableName: "salary-detail",
  }
);

module.exports = Salary;
