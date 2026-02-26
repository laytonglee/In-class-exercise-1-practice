const path = require("path");
const fs = require("fs");
const multiparty = require("multiparty");
const Report = require("../models/Report");

// GET /report — show report form
exports.showForm = (req, res) => {
  res.render("report", { layout: "layouts/main", title: "Report Lost Item" });
};

// POST /report — handle form submission
exports.submitReport = (req, res) => {
  const form = new multiparty.Form();

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error("Form parse error:", err);
      return res.redirect("/report");
    }

    // Extract field values
    const name = fields.name ? fields.name[0].trim() : "";
    const description = fields.description ? fields.description[0].trim() : "";
    const location = fields.location ? fields.location[0].trim() : "";
    const date = fields.date ? fields.date[0].trim() : "";
    const contact = fields.contact ? fields.contact[0].trim() : "";
    const image = files.image ? files.image[0] : null;

    // Backend Validation: all fields required
    if (
      !name ||
      !description ||
      !location ||
      !date ||
      !contact ||
      !image ||
      image.size === 0
    ) {
      if (image && image.path) {
        fs.unlink(image.path, () => {});
      }
      return res.redirect("/report");
    }

    // Move uploaded file to public/uploads
    const ext = path.extname(image.originalFilename) || ".jpg";
    const filename = Date.now() + ext;
    const destPath = path.join(Report.getUploadsDir(), filename);

    fs.copyFile(image.path, destPath, (copyErr) => {
      fs.unlink(image.path, () => {});

      if (copyErr) {
        console.error("File copy error:", copyErr);
        return res.redirect("/report");
      }

      Report.create({
        name,
        description,
        location,
        date,
        contact,
        imagePath: "/uploads/" + filename,
      });

      res.redirect("/dashboard");
    });
  });
};

// GET /dashboard — list all reports
exports.dashboard = (req, res) => {
  const reports = Report.getAll();
  res.render("dashboard", {
    layout: "layouts/main",
    title: "Dashboard",
    reports,
    hasReports: reports.length > 0,
  });
};
