const express = require('express');
const router = express.Router();
const pool = require('../db');

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


const isValidId = (id) => {
  return id && /^\d+$/.test(id) && id.length <= 20;
};


const ALLOWED_SORT_FIELDS = {
  price: 'L_SystemPrice',
  date: 'ListingContractDate',
  sqft: 'LM_Int2_3',
  beds: 'L_Keyword2',
  id: 'L_ListingID',
};

const ALLOWED_SORT_ORDERS = ['ASC', 'DESC'];

// Week 4: /Openhouses
router.get('/:id/openhouses', async (req, res) => {
  try {
    const listingId = req.params.id;

    if (!isValidId(listingId)) {
      return res.status(400).json({ error: "Malformed or oversized ID. Must be a numeric string under 20 characters." });
    }

    const propertyCheckQuery = `SELECT L_ListingID FROM rets_property WHERE L_ListingID = ?`;
    const [propertyCheck] = await pool.query(propertyCheckQuery, [listingId]);

    if (propertyCheck.length === 0) {
      return res.status(404).json({ error: "Property not found." });
    }

    const openHouseQuery = `
      SELECT * FROM rets_openhouse 
      WHERE L_ListingID = ? 
      ORDER BY OpenHouseDate ASC, OH_StartTime ASC;
    `;
    const [openHouses] = await pool.query(openHouseQuery, [listingId]);

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

    if (!isValidId(listingId)) {
      return res.status(400).json({ error: "Malformed or oversized ID. Must be a numeric string under 20 characters." });
    }

    const query = `SELECT * FROM rets_property WHERE L_ListingID = ?;`;
    const [rows] = await pool.query(query, [listingId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Property not found with that specific ID." });
    }

    return res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Property Detail Endpoint Error:", error.message);
    return res.status(500).json({ error: "Internal Server Error retrieving property details." });
  }
});

// Main Properties List with Filters, Pagination, and Sorting
router.get('/', async (req, res) => {
  try {
    let {
      city,
      zipcode,
      minPrice,
      maxPrice,
      beds,
      baths,
      limit,
      offset,
      sortBy = 'date',
      sortOrder = 'DESC',
    } = req.query;

    // 1. Validate and Parse Pagination
    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    const parsedOffset = offset ? parseInt(offset, 10) : 0;

    if (isNaN(parsedLimit) || parsedLimit <= 0 || parsedLimit > 100) {
      return res.status(400).json({ error: "Invalid limit. Must be a positive integer up to 100." });
    }
    if (isNaN(parsedOffset) || parsedOffset < 0) {
      return res.status(400).json({ error: "Invalid offset. Must be a non-negative integer." });
    }

    // 2. Validate Sorting Parameters (Week 9 Requirement)
    const lowerSortBy = sortBy.toLowerCase();
    const upperSortOrder = sortOrder.toUpperCase();

    if (!ALLOWED_SORT_FIELDS[lowerSortBy]) {
      return res.status(400).json({
        error: `Invalid sortBy parameter '${sortBy}'. Allowed values: ${Object.keys(ALLOWED_SORT_FIELDS).join(', ')}`,
      });
    }

    if (!ALLOWED_SORT_ORDERS.includes(upperSortOrder)) {
      return res.status(400).json({
        error: `Invalid sortOrder parameter '${sortOrder}'. Allowed values: ASC, DESC`,
      });
    }

    const sortColumn = ALLOWED_SORT_FIELDS[lowerSortBy];

    // 3. Validate Search Filters
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

    // 4. Dynamically Assemble SQL WHERE Clause
    let whereClauses = [];
    let baseValues = [];

    if (city) {
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
      whereClauses.push("CAST(L_Keyword2 AS UNSIGNED) >= ?");
      baseValues.push(parseInt(beds, 10));
    }
    if (baths) {
      whereClauses.push("CAST(LM_Dec_3 AS DECIMAL(4,1)) >= ?");
      baseValues.push(parseFloat(baths));
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    // otal Count Query
    const countQuery = `SELECT COUNT(*) AS total FROM rets_property ${whereSql};`;
    const [countRows] = await pool.query(countQuery, [...baseValues]);
    const total = countRows[0].total;

    // Data Query with Dynamic Whitelisted ORDER BY
    const dataQuery = `
      SELECT * FROM rets_property 
      ${whereSql} 
      ORDER BY ${sortColumn} ${upperSortOrder} 
      LIMIT ? OFFSET ?;
    `;
    const dataValues = [...baseValues, parsedLimit, parsedOffset];
    const [results] = await pool.query(dataQuery, dataValues);

    // Send Response
    return res.status(200).json({
      total,
      limit: parsedLimit,
      offset: parsedOffset,
      sortBy: lowerSortBy,
      sortOrder: upperSortOrder,
      results
    });

  } catch (error) {
    console.error("Property Search Endpoint Error:", error.message);
    return res.status(500).json({ error: "Internal Server Error occurred during search." });
  }
});

module.exports = router;