const Report = require("../models/Report");

// GET /items/:id — show item detail
exports.showItem = (req, res) => {
  const item = Report.findById(req.params.id);
  if (!item) {
    return res.redirect("/dashboard");
  }
  res.render("item", { layout: "layouts/main", title: item.name, item });
};

// POST /items/:id/status — update item status
exports.updateStatus = (req, res) => {
  const item = Report.findById(req.params.id);
  if (!item) {
    return res.redirect("/dashboard");
  }

  const newStatus = req.body.status || "";
  Report.updateStatus(req.params.id, newStatus);
  res.redirect("/items/" + req.params.id);
};

// POST /items/:id/delete — delete item
exports.deleteItem = (req, res) => {
  Report.deleteById(req.params.id);
  res.redirect("/dashboard");
};
