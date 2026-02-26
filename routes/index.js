const homeRoutes = require("./homeRoutes");
const reportRoutes = require("./reportRoutes");
const itemRoutes = require("./itemRoutes");

module.exports = (app) => {
  app.use(homeRoutes);
  app.use(reportRoutes);
  app.use(itemRoutes);
};
