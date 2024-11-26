const express = require("express");
const axios = require("axios");
const xml2js = require("xml2js");
const db = require("../pgClient");

const router = express.Router();

// External API URLs
const HERITAGE_IMAGES_API_URL =
  "http://www.cha.go.kr/cha/SearchImageOpenapi.do";
const HERITAGE_DETAILS_API_URL =
  "http://www.cha.go.kr/cha/SearchKindOpenapiDt.do";

// Fetch and store heritage images
router.get("/heritage-images", async (req, res) => {
  try {
    const pageIndex = parseInt(req.query.page) || 1;
    console.log(`Fetching heritage images for page: ${pageIndex}`);

    // Fetch data from the external API
    const response = await axios.get(
      `${HERITAGE_IMAGES_API_URL}?pageUnit=15&pageIndex=${pageIndex}`,
      {
        headers: { Accept: "application/xml" },
      }
    );
    console.log("Raw API response for heritage images fetched successfully.");

    // Parse the XML response to JSON
    const jsonData = await xml2js.parseStringPromise(response.data);
    console.log("Heritage images XML parsed to JSON successfully.");

    // Validate the structure of the response
    const items = jsonData?.response?.body?.items?.item;
    if (!items || !Array.isArray(items)) {
      throw new Error("Invalid API response format");
    }

    // Map the fetched data into the desired format
    const images = items.map((item) => ({
      imageNo: item.imageNo[0],
      imageUrl: item.imageUrl[0],
      ccimDesc: item.ccimDesc[0],
      sn: item.sn[0],
      no: item.no[0],
      ccbaKdcd: item.ccbaKdcd[11],
      ccbaCtcd: item.ccbaCtcd[11],
      ccbaAsno: item.ccbaAsno[11],
    }));
    console.log(`Mapped ${images.length} heritage images for storage.`);

    // Store in PostgreSQL
    for (const image of images) {
      console.log(`Storing heritage image with imageNo: ${image.imageNo}`);
      await db.query(
        `INSERT INTO heritage_image (image_no, image_url, ccim_desc, sn, no, ccba_kdcd, ccba_ctcd, ccba_asno) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          image.imageNo,
          image.imageUrl,
          image.ccimDesc,
          image.sn,
          image.no,
          image.ccbaKdcd,
          image.ccbaCtcd,
          image.ccbaAsno,
        ]
      );
    }

    console.log("Heritage images stored successfully in the database.");
    res.json(images);
  } catch (error) {
    console.error("Error fetching heritage images:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Fetch and store heritage details
router.get("/heritage-details", async (req, res) => {
  try {
    const pageIndex = parseInt(req.query.page) || 1;
    console.log(`Fetching heritage details for page: ${pageIndex}`);

    // Fetch data from the external API
    const response = await axios.get(
      `${HERITAGE_DETAILS_API_URL}?pageUnit=15&pageIndex=${pageIndex}`,
      {
        headers: { Accept: "application/xml" },
      }
    );
    console.log("Raw API response for heritage details fetched successfully.");

    // Parse the XML response to JSON
    const jsonData = await xml2js.parseStringPromise(response.data);
    console.log("Heritage details XML parsed to JSON successfully.");

    // Validate the structure of the response
    const items = jsonData?.response?.body?.items?.item;
    if (!items || !Array.isArray(items)) {
      throw new Error("Invalid API response format");
    }

    // Map the fetched data into the desired format
    const details = items.map((item) => ({
      sn: item.sn[0],
      no: item.no[0],
      ccmaName: item.ccmaName[0],
      ccbaMnm1: item.ccbaMnm1[0],
      ccbaMnm2: item.ccbaMnm2[0],
      longitude: item.longitude[0],
      latitude: item.latitude[0],
      gcodeName: item.gcodeName[0],
      imageUrl: item.imageUrl[0],
      content: item.content[0],
    }));
    console.log(`Mapped ${details.length} heritage details for storage.`);

    // Store in PostgreSQL
    for (const detail of details) {
      console.log(`Storing heritage detail with sn: ${detail.sn}`);
      await db.query(
        `INSERT INTO heritage_vo (sn, no, ccma_name, ccba_mnm1, ccba_mnm2, longitude, latitude, gcode_name, image_url, content) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          detail.sn,
          detail.no,
          detail.ccmaName,
          detail.ccbaMnm1,
          detail.ccbaMnm2,
          detail.longitude,
          detail.latitude,
          detail.gcodeName,
          detail.ccceName,
          detail.imageUrl,
          detail.content,
        ]
      );
    }

    console.log("Heritage details stored successfully in the database.");
    res.json(details);
  } catch (error) {
    console.error("Error fetching heritage details:", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
