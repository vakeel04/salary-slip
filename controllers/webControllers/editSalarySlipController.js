const Salary = require("../../models/salary-slip-model")
const getEditSalarySlipPage =async (req, res) => {
    const  {id} = req.params
    const salary =  await Salary.findByPk(id)
    res.render("editSalarySlip",{
        data:{
            salary
        }
    })
}

module.exports = {getEditSalarySlipPage}