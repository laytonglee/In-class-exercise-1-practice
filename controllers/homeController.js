// GET / — redirect to dashboard
exports.index = (req, res) => {
  res.redirect("/dashboard");
};
