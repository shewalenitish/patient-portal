const express = require("express");
const multer = require("multer");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const fs = require("fs");

const db = require("./db");

const app = express();
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Storage config for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

// Accept PDFs only
const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"));
    }
    cb(null, true);
  }
});

// Upload PDF
app.post("/upload", upload.single("file"), (req, res) => {
  const file = req.file;
  if (!file) return res.status(400).json({ message: "No file uploaded" });

  const stmt = db.prepare(
    "INSERT INTO files (original_name, stored_name, size, mime_type) VALUES (?, ?, ?, ?)"
  );
  stmt.run(file.originalname, file.filename, file.size, file.mimetype);

  res.json({ message: "Uploaded successfully", file });
});

// List all files
app.get("/files", (req, res) => {
  const files = db.prepare("SELECT * FROM files ORDER BY created_at DESC").all();
  res.json(files);
});

// Download file
app.get("/download/:stored_name", (req, res) => {
  const filePath = path.join(__dirname, "uploads", req.params.stored_name);
  if (!fs.existsSync(filePath)) return res.status(404).json({ message: "File not found" });
  res.download(filePath);
});

// Delete file
app.delete("/delete/:id", (req, res) => {
  const id = req.params.id;

  const doc = db.prepare("SELECT stored_name FROM files WHERE id = ?").get(id);
  if (!doc) return res.status(404).json({ message: "Document not found" });

  const filePath = path.join(__dirname, "uploads", doc.stored_name);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  db.prepare("DELETE FROM files WHERE id = ?").run(id);

  res.json({ message: "Deleted successfully" });
});

app.listen(4000, () => console.log("Backend running on http://localhost:4000"));
