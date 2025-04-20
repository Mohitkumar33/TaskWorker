const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

// @route   GET /api/locations
// @desc    Get list of Australian states, cities and suburbs
// @access  Public
router.get("/", (req, res) => {
  try {
    const filePath = path.join(__dirname, "../data/locations.json");
    const data = fs.readFileSync(filePath, "utf-8");
    const locations = JSON.parse(data);
    res.json(locations);
  } catch (error) {
    console.error("Error reading location file:", error.message);
    res.status(500).json({ msg: "Error loading location data" });
  }
});

module.exports = router;
