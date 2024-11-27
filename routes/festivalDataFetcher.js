const axios = require("axios");
const { parseStringPromise } = require("xml2js");

const FESTIVAL_API_URL =
  "http://www.cha.go.kr/cha/openapi/selectEventListOpenapi.do";

/**
 * Constructs the festival API URL.
 * @param {string} searchYear - The year to search for festivals.
 * @param {string} searchMonth - The month to search for festivals.
 * @returns {string} - The constructed API URL.
 */
const festivalInfo_Url = (searchYear, searchMonth) =>
  `${FESTIVAL_API_URL}?searchYear=${searchYear}&searchMonth=${searchMonth}`;

/**
 * Fetches raw festival data from the API.
 * @param {string} searchYear - The year to search for festivals.
 * @param {string} searchMonth - The month to search for festivals.
 * @returns {string} - The raw XML response from the API.
 */
const fetchRawFestivalData = async (searchYear, searchMonth) => {
  const response = await axios.get(festivalInfo_Url(searchYear, searchMonth));
  return response.data; // Raw XML string
};

/**
 * Parses raw XML data to JSON format.
 * @param {string} xmlData - The raw XML string to parse.
 * @returns {object} - The parsed JSON object.
 */
const parseFestivalXmlToJson = async (xmlData) => {
  return await parseStringPromise(xmlData, {
    explicitArray: false, // Simplifies nested elements
    trim: true, // Removes unnecessary whitespace
  });
};

/**
 * Extracts and cleans festival data from the JSON response.
 * @param {object} jsonData - The parsed JSON data.
 * @param {number} limit - The maximum number of festival items to return.
 * @returns {Array<object>} - The cleaned and formatted festival data.
 */
const extractFestivalData = (jsonData, limit = 2) => {
  const items = jsonData.result?.item;
  const itemArray = Array.isArray(items) ? items : items ? [items] : [];

  return itemArray.slice(0, limit).map((item) => ({
    programName: item.subTitle || "N/A", // Program Name
    programContent: item.subContent || "N/A", // Program Content
    startDate: item.sDate || "N/A", // Start Date
    endDate: item.eDate || "N/A", // End Date
    location: item.subDesc || "N/A", // Location
    contact: item.contact || "N/A", // Contact
    image: item.fileNm || "N/A", // Image URL
    targetAudience: item.subDesc1 || "N/A", // Target Audience
    additionalInfo: `${item.subDesc2 || "N/A"}, ${item.subDesc_3 || "N/A"}`, // Additional Info
  }));
};

/**
 * Main function to fetch, parse, and extract festival data.
 * @param {string} searchYear - The year to search for festivals.
 * @param {string} searchMonth - The month to search for festivals.
 * @returns {Array<object>} - The formatted festival data.
 */
const fetchFestivalData = async (searchYear, searchMonth) => {
  try {
    // Step 1: Fetch raw XML data
    const rawXmlData = await fetchRawFestivalData(searchYear, searchMonth);

    // Step 2: Parse XML data to JSON
    const jsonData = await parseFestivalXmlToJson(rawXmlData);

    // Step 3: Extract and clean festival data
    const festivalData = extractFestivalData(jsonData);

    return festivalData;
  } catch (error) {
    console.error("Error fetching or parsing festival data:", error.message);
    return [];
  }
};

module.exports = { fetchFestivalData };
