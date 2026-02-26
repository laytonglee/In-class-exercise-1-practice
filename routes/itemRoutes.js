const express = require("express");
const router = express.Router();
const itemController = require("../controllers/itemController");

router.get("/items/:id", itemController.showItem);
router.post("/items/:id/status", itemController.updateStatus);
router.post("/items/:id/delete", itemController.deleteItem);

module.exports = router;
