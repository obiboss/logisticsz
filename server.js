const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path"); // import the path module
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const db = new sqlite3.Database("shipment.db"); // Create or open the SQLite database file

db.serialize(() => {
  // Create a shipments table if it doesn't exist
  db.run(`CREATE TABLE IF NOT EXISTS shipments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    unique_id TEXT NOT NULL,
    data TEXT NOT NULL
  )`);
});

app.use(cors({ origin: "http://127.0.0.1:5501" }));

app.post("/storeData", (req, res) => {
  console.log("Received request to store data:", req.body);
  const formData = req.body;
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
  // console.log("Received GET request for uniqueId:", uniqueId);

  db.get(
    "SELECT * FROM shipments WHERE unique_id = ?",
    [uniqueId],
    (err, row) => {
      // console.log("Query executed."); // Log when the query starts
      if (err) {
        console.error("Error fetching data:", err);
        res.status(500).json({ message: "Error fetching data" });
      } else if (row) {
        const parsedData = JSON.parse(row.data);
        // console.log("Data fetched from database:", parsedData);
        res.status(200).json(parsedData);
      } else {
        // console.log("Data not found in the database.");
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

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// User Registration
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  db.run(
    "INSERT INTO users (username, password) VALUES (?, ?)",
    [username, hashedPassword],
    (err) => {
      if (err) {
        console.error("Failed to register user:", err);
        return res.status(500).json({ error: "Failed to register user" });
      }
      console.log("User registered successfully:", username);
      res.json({ message: "User registered successfully" });
    }
  );
});

// User Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, user) => {
      if (err) {
        return res.status(500).json({ error: "Error while querying database" });
      }

      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid password" });
      }

      res.json({ message: "Login successful" });
    }
  );
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
