const express = require('express');
const router = express.Router();
const pool = require('../db'); // Your database connection pool from Week 2

// GET /api/properties
router.get('/', async (req, res) => {
  try {
    // 1. Extract Query Parameters from the URL string
    let { city, zipcode, minPrice, maxPrice, beds, baths, limit, offset } = req.query;

    // 2. Data Validation & Sanitization (Requirement 14)
    // Parse pagination strings into integers, defaulting to limit=20 and offset=0 (Requirement 12)
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

    // 3. Dynamically Assemble SQL WHERE Clause using Real Schema Mappings (Requirement 13)
    let whereClauses = [];
    let baseValues = []; // Stores our raw data values to insert safely later

    if (city) {
      // Use LOWER(TRIM()) on both sides to handle inconsistent casing safely (Hint 2)
      whereClauses.push("LOWER(TRIM(L_City)) = LOWER(TRIM(?))");
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

    // 4. Query 1: Calculate Total Rows matching this specific criteria
    // Necessary so the frontend knows how many total pages exist
    const countQuery = `SELECT COUNT(*) AS total FROM rets_property ${whereSql};`;
    // We pass a shallow clone [...baseValues] so pagination variables don't pollute the count
    const [countRows] = await pool.query(countQuery, [...baseValues]);
    const total = countRows[0].total;

    // 5. Query 2: Fetch the actual Paginated Data records
    const dataQuery = `SELECT * FROM rets_property ${whereSql} LIMIT ? OFFSET ?;`;
    // Add pagination integers securely to the very end of our parameterized array
    const dataValues = [...baseValues, parsedLimit, parsedOffset];
    const [results] = await pool.query(dataQuery, dataValues);

    // 6. Send the payload back matching the API Contract shape exactly
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