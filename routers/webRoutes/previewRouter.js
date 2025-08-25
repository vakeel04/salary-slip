const express = require("express");
const getPreview = require("../../controllers/webControllers/previewController");
const router = express.Router();

router.get("/:id", getPreview)

module.exports = router