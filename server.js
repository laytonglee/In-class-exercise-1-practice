const express = require("express");
const path = require("path");
const hbs = require("hbs");
const multiparty = require("multiparty");
const fs = require("fs");

const app = express();
const PORT = 3001;

// --------------- Security ---------------
app.disable("x-powered-by");

// --------------- In-Memory Storage ---------------
const reports = [];

// --------------- View Engine Setup ---------------
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
hbs.registerPartials(path.join(__dirname, "views", "partials"));

// Handlebars helpers
hbs.registerHelper("eq", (a, b) => a === b);
hbs.registerHelper("inc", (val) => parseInt(val) + 1);

// --------------- Middleware ---------------
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// --------------- Routes ---------------

// Home — redirect to dashboard
app.get("/", (req, res) => {
  res.redirect("/dashboard");
});

// -------- Report Form --------
app.get("/report", (req, res) => {
  res.render("report", { layout: "layouts/main", title: "Report Lost Item" });
});

app.post("/report", (req, res) => {
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
    if (!name || !description || !location || !date || !contact || !image || image.size === 0) {
      // Clean up temp file if it exists
      if (image && image.path) {
        fs.unlink(image.path, () => {});
      }
      return res.redirect("/report");
    }

    // Move uploaded file to public/uploads
    const ext = path.extname(image.originalFilename) || ".jpg";
    const filename = Date.now() + ext;
    const destPath = path.join(uploadsDir, filename);

    fs.copyFile(image.path, destPath, (copyErr) => {
      // Clean up temp file
      fs.unlink(image.path, () => {});

      if (copyErr) {
        console.error("File copy error:", copyErr);
        return res.redirect("/report");
      }

      // Create report object
      const report = {
        id: Date.now().toString(),
        name,
        description,
        location,
        date,
        contact,
        imagePath: "/uploads/" + filename,
        status: "Lost",
      };

      reports.push(report);
      res.redirect("/dashboard");
    });
  });
});

// -------- Dashboard --------
app.get("/dashboard", (req, res) => {
  res.render("dashboard", {
    layout: "layouts/main",
    title: "Dashboard",
    reports,
    hasReports: reports.length > 0,
  });
});

// -------- Item Detail --------
app.get("/items/:id", (req, res) => {
  const item = reports.find((r) => r.id === req.params.id);
  if (!item) {
    return res.redirect("/dashboard");
  }
  res.render("item", { layout: "layouts/main", title: item.name, item });
});

// -------- Status Update --------
app.post("/items/:id/status", (req, res) => {
  const item = reports.find((r) => r.id === req.params.id);
  if (!item) {
    return res.redirect("/dashboard");
  }

  const form = new multiparty.Form();
  form.parse(req, (err, fields) => {
    if (err) {
      return res.redirect("/items/" + req.params.id);
    }
    const newStatus = fields.status ? fields.status[0] : "";
    if (["Lost", "Found", "Closed"].includes(newStatus)) {
      item.status = newStatus;
    }
    res.redirect("/items/" + req.params.id);
  });
});

// -------- Delete Report --------
app.post("/items/:id/delete", (req, res) => {
  const index = reports.findIndex((r) => r.id === req.params.id);
  if (index !== -1) {
    // Remove associated image file
    const imagePath = path.join(__dirname, "public", reports[index].imagePath);
    fs.unlink(imagePath, () => {});
    reports.splice(index, 1);
  }
  res.redirect("/dashboard");
});

// --------------- Start Server ---------------
app.listen(PORT, () => {
  console.log(`Lost & Found server running at http://localhost:${PORT}`);
});
