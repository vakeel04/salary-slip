const multer = require('multer');
const path = require('path');

// storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads"); // folder jisme excel/csv save hoga
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// file filter -> sirf Excel / CSV allow
const fileFilter = (req, file, cb) => {
  const filetypes = /xlsx|xls|csv/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (extname) {
    cb(null, true);
  } else {
    cb(new Error("Only Excel or CSV files are allowed!"));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB limit
  fileFilter: fileFilter
});

module.exports = upload;
