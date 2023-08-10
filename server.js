"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose(); // Import SQLite
const path = require("path"); // Import the path module

const app = express();
const port = 3001;

app.use(bodyParser.json());

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

const db = new sqlite3.Database("shipment.db"); // Create or open the SQLite database file

db.serialize(() => {
  // Create a shipments table if it doesn't exist
  db.run(`CREATE TABLE IF NOT EXISTS shipments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unique_id TEXT NOT NULL,
    data TEXT NOT NULL
  )`);
});

app.post("/storeData", (req, res) => {
  console.log("Received request to store data:", req.body);
  const { ...formData } = req.body;
  console.log("Form Data:", req.body);

  db.run(
    "INSERT INTO shipments (unique_id, data) VALUES (?, ?)",
    [formData.uniqueId, JSON.stringify(formData)],
    (err) => {
      if (err) {
        console.error("Error storing data:", err);
        res.status(500).json({ message: "Error storing data" });
      } else {
        res.status(200).json({
          message: "Data stored successfully",
          uniqueId: formData.uniqueId,
        });
      }
    }
  );
});

app.get("/getData", (req, res) => {
  const uniqueId = req.query.uniqueId;

  db.get(
    "SELECT * FROM shipments WHERE unique_id = ?",
    [uniqueId],
    (err, row) => {
      if (err) {
        console.error("Error fetching data:", err);
        res.status(500).json({ message: "Error fetching data" });
      } else if (row) {
        const parsedData = JSON.parse(row.data);
        res.status(200).json(parsedData);
      } else {
        res.status(404).json({ message: "Data not found" });
      }
    }
  );
});

// Update shipment status
app.put("/updateStatus", (req, res) => {
  const { uniqueId, newStatus } = req.body;

  db.run(
    "UPDATE shipments SET data = json_patch(data, ?) WHERE unique_id = ?",
    [`{"status": "${newStatus}"}`, uniqueId],
    (err) => {
      if (err) {
        console.error("Error updating status:", err);
        res.status(500).json({ message: "Error updating status" });
      } else {
        res.status(200).json({ message: "Status updated successfully" });
      }
    }
  );
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
