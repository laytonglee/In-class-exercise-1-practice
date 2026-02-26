const express = require("express");
const path = require("path");
const hbs = require("hbs");

const app = express();
const PORT = 3000;

// --------------- Security ---------------
app.disable("x-powered-by");

// --------------- View Engine Setup ---------------
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
hbs.registerPartials(path.join(__dirname, "views", "partials"));

// --------------- Handlebars Helpers ---------------
hbs.registerHelper("eq", (a, b) => a === b);
hbs.registerHelper("inc", (val) => parseInt(val) + 1);

// Section helper — lets views inject content into named layout blocks
// Usage in view:  {{#section "scripts"}} <script>…</script> {{/section}}
// Usage in layout: {{{_sections.scripts}}}
hbs.registerHelper("section", function (name, options) {
  if (!this._sections) this._sections = {};
  this._sections[name] = options.fn(this);
  return null;
});

// --------------- Middleware ---------------
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// --------------- Routes (MVC) ---------------
const registerRoutes = require("./routes");
registerRoutes(app);

// --------------- Start Server ---------------
app.listen(PORT, () => {
  console.log(`Lost & Found server running at http://localhost:${PORT}`);
});
