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
      get() {
        const rawValue = this.getDataValue("PayDate");
        if (!rawValue) return null;

        const n = parseFloat(rawValue);
        if (isNaN(n)) return rawValue;

        // Excel serial → JS Date
        const utc_days = Math.floor(n - 25569);
        const utc_value = utc_days * 86400; // seconds
        const date_info = new Date(utc_value * 1000);

        const dd = String(date_info.getUTCDate()).padStart(2, "0");
        const mm = String(date_info.getUTCMonth() + 1).padStart(2, "0");
        const yyyy = date_info.getUTCFullYear();

        return `${dd}/${mm}/${yyyy}`; // <-- Final formatted date
      },
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
