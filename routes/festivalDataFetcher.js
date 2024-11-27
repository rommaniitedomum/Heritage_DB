const axios = require("axios");
const { parseStringPromise } = require("xml2js");

const FESTIVAL_API_URL =
  "http://www.cha.go.kr/cha/openapi/selectEventListOpenapi.do";

// Constructs the festival API URL
const festivalInfo_Url = (searchYear, searchMonth) =>
  `${FESTIVAL_API_URL}?searchYear=${searchYear}&searchMonth=${searchMonth}`;

// Fetch and parse festival data
const fetchFestivalData = async (searchYear, searchMonth) => {
  try {
    // Fetch raw data from API
    const response = await axios.get(festivalInfo_Url(searchYear, searchMonth));
    console.log("Raw API Response Received");

    // Parse XML response to JSON
    const parsedData = await parseStringPromise(response.data, {
      explicitArray: false, // Simplifies nested elements
      trim: true, // Removes unnecessary whitespace
    });

    // Extract `item` elements from the parsed response
    const items = parsedData.result?.item;
    const itemArray = Array.isArray(items) ? items : items ? [items] : [];
    if (itemArray.length === 0) {
      console.log("No festival data found.");
      return [];
    }

    // Map and limit the data to 3 entries with seqNo and subDate
    const limitedData = itemArray.slice(0, 3).map((item) => ({
      seqNo: item.seqNo || "N/A",
      subDate: item.subDate || "N/A",
    }));

    console.log(
      "Extracted Festival Data (seqNo and subDate only):",
      limitedData
    );
    return limitedData; // Returns the limited data
  } catch (error) {
    console.error("Error fetching or parsing festival data:", error);
    return [];
  }
};

// Example usage
(async () => {
  const festivalData = await fetchFestivalData(2024, 11);
  console.log("Final Output:", festivalData);
})();

module.exports = { fetchFestivalData };
