const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

router.get("/report", reportController.showForm);
router.post("/report", reportController.submitReport);
router.get("/dashboard", reportController.dashboard);

module.exports = router;
