const express = require('express');
const router = express.Router();
const pool = require('../db'); 

// GET /api/properties

// Logs all endpoints
router.use((req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - ${duration}ms`);
  });

  next();
});

// Helper validation checker for Listing ID Parameter (Requirement 19)
const isValidId = (id) => {
  return id && /^\d+$/.test(id) && id.length <= 20;
};


// Week 4
// /Openhouses
router.get('/:id/openhouses', async (req, res) => {
  try {
    const listingId = req.params.id;

    // Validate parameter
    if (!isValidId(listingId)) {
      return res.status(400).json({ error: "Malformed or oversized ID. Must be a numeric string under 20 characters." });
    }

    // Verify the property exists first
    const propertyCheckQuery = `SELECT L_ListingID FROM rets_property WHERE L_ListingID = ?`;
    const [propertyCheck] = await pool.query(propertyCheckQuery, [listingId]);
    
    if (propertyCheck.length === 0) {
      return res.status(404).json({ error: "Property not found." });
    }

    // Query open houses, ordered by Date and Start Time (Criteria 3 & 4)
    const openHouseQuery = `
      SELECT * FROM rets_openhouse 
      WHERE L_ListingID = ? 
      ORDER BY OpenHouseDate ASC, OH_StartTime ASC;
    `;
    const [openHouses] = await pool.query(openHouseQuery, [listingId]);

    // Clean array hand-off 
    return res.status(200).json(openHouses);

  } catch (error) {
    console.error("Open House Endpoint Error:", error.message);
    return res.status(500).json({ error: "Internal Server Error retrieving open houses." });
  }
});

// Get single property by ID
router.get('/:id', async (req, res) => {
  try {
    const listingId = req.params.id;

    // Validate parameter
    if (!isValidId(listingId)) {
      return res.status(400).json({ error: "Malformed or oversized ID. Must be a numeric string under 20 characters." });
    }

    const query = `SELECT * FROM rets_property WHERE L_ListingID = ?;`;
    const [rows] = await pool.query(query, [listingId]);

    // Unknown ID
    if (rows.length === 0) {
      return res.status(404).json({ error: "Property not found with that specific ID." });
    }

    // Return the property by ID
    return res.status(200).json(rows[0]);

  } catch (error) {
    console.error("Property Detail Endpoint Error:", error.message);
    return res.status(500).json({ error: "Internal Server Error retrieving property details." });
  }
});

router.get('/', async (req, res) => {
  try {
    // Extract Query Parameters from the URL string
    let { city, zipcode, minPrice, maxPrice, beds, baths, limit, offset } = req.query;

    // Parse pagination strings into integers, defaulting to limit=20 and offset=0
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    const parsedOffset = offset ? parseInt(offset, 10) : 0;

    // Reject bad pagination boundaries
    if (isNaN(parsedLimit) || parsedLimit <= 0 || parsedLimit > 100) {
      return res.status(400).json({ error: "Invalid limit. Must be a positive integer up to 100." });
    }
    if (isNaN(parsedOffset) || parsedOffset < 0) {
      return res.status(400).json({ error: "Invalid offset. Must be a non-negative integer." });
    }

    // Validate numerical search filters
    if (minPrice && (isNaN(Number(minPrice)) || Number(minPrice) < 0)) {
      return res.status(400).json({ error: "minPrice must be a valid positive number." });
    }
    if (maxPrice && (isNaN(Number(maxPrice)) || Number(maxPrice) < 0)) {
      return res.status(400).json({ error: "maxPrice must be a valid positive number." });
    }
    if (beds && (isNaN(parseInt(beds, 10)) || parseInt(beds, 10) < 0)) {
      return res.status(400).json({ error: "beds must be a valid non-negative integer." });
    }
    if (baths && (isNaN(parseFloat(baths)) || parseFloat(baths) < 0)) {
      return res.status(400).json({ error: "baths must be a valid non-negative number." });
    }

    // Dynamically Assemble SQL WHERE Clause
    let whereClauses = [];
    let baseValues = []; // Stores our raw data values to insert safely later

    if (city) {
      // Use LOWER(TRIM()) on both sides to handle inconsistent casing safely
      whereClauses.push("LOWER(TRIM(L_City)) = LOWER(TRIM(?))"); // parameterized query for safety
      baseValues.push(city);
    }
    if (zipcode) {
      whereClauses.push("L_Zip = ?");
      baseValues.push(zipcode);
    }
    if (minPrice) {
      whereClauses.push("L_SystemPrice >= ?");
      baseValues.push(Number(minPrice));
    }
    if (maxPrice) {
      whereClauses.push("L_SystemPrice <= ?");
      baseValues.push(Number(maxPrice));
    }
    if (beds) {
      whereClauses.push("L_Keyword2 = ?");
      baseValues.push(parseInt(beds, 10));
    }
    if (baths) {
      whereClauses.push("LM_Dec_3 = ?");
      baseValues.push(parseFloat(baths));
    }

    // Join all pushed strings with ' AND ' if any filters were added
    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // Calculate Total Rows matching this specific criteria
    const countQuery = `SELECT COUNT(*) AS total FROM rets_property ${whereSql};`;
    // We pass a shallow clone [...baseValues] so pagination variables don't pollute the count
    const [countRows] = await pool.query(countQuery, [...baseValues]);
    const total = countRows[0].total;

    // Fetch the actual data records
    const dataQuery = `SELECT * FROM rets_property ${whereSql} LIMIT ? OFFSET ?;`;
    // Add pagination integers securely to the very end of our parameterized array
    const dataValues = [...baseValues, parsedLimit, parsedOffset];
    const [results] = await pool.query(dataQuery, dataValues);

    // Send the payload back matching the API Contract shape exactly
    return res.status(200).json({
      total,
      limit: parsedLimit,
      offset: parsedOffset,
      results
    });

  } catch (error) {
    console.error("Property Search Endpoint Error:", error.message);
    return res.status(500).json({ error: "Internal Server Error occurred during search." });
  }
});

module.exports = router;

