const path = require("path");
const fs = require("fs");

// --------------- In-Memory Storage ---------------
const reports = [];

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "..", "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// --------------- Model Methods ---------------

const getAll = () => reports;

const findById = (id) => reports.find((r) => r.id === id);

const create = (data) => {
  const report = {
    id: Date.now().toString(),
    name: data.name,
    description: data.description,
    location: data.location,
    date: data.date,
    contact: data.contact,
    imagePath: data.imagePath,
    status: "Lost",
  };
  reports.push(report);
  return report;
};

const updateStatus = (id, newStatus) => {
  const item = findById(id);
  if (!item) return null;
  if (["Lost", "Found", "Closed"].includes(newStatus)) {
    item.status = newStatus;
  }
  return item;
};

const deleteById = (id) => {
  const index = reports.findIndex((r) => r.id === id);
  if (index === -1) return null;
  const removed = reports.splice(index, 1)[0];
  // Remove associated image file
  const imagePath = path.join(__dirname, "..", "public", removed.imagePath);
  fs.unlink(imagePath, () => {});
  return removed;
};

const getUploadsDir = () => uploadsDir;

module.exports = {
  getAll,
  findById,
  create,
  updateStatus,
  deleteById,
  getUploadsDir,
};
