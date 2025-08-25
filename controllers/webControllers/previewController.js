const Salary = require("../../models/salary-slip-model")
const getPreview = async(req, res) => {
    const  {id} = req.params
    console.log(id);
    
    const salary =   await Salary.findByPk(id)
    return res.render("salarySlipPreview",{
        data:{
            salary
        }
    })
}

module.exports = getPreview