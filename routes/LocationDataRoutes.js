const axios = require("axios");
const { parseStringPromise } = require("xml2js");

const CURRENT_HERITAGE_INFO_URL =
  "https://www.cha.go.kr/cha/SearchKindOpenapiList.do";
const CURRENT_HERITAGE_INFO_DETAIL_URL =
  "https://www.cha.go.kr/cha/SearchKindOpenapiDt.do";

/**
 * Constructs the URL for heritage detail API.
 * @param {string} ccbaKdcd - Type code of the heritage.
 * @param {string} ccbaAsno - Serial number of the heritage.
 * @param {string} ccbaCtcd - Regional code of the heritage.
 * @returns {string} - Constructed URL for fetching heritage details.
 */
const heritageInfo_Url = (ccbaKdcd, ccbaAsno, ccbaCtcd) =>
  `${CURRENT_HERITAGE_INFO_DETAIL_URL}?ccbaKdcd=${ccbaKdcd}&ccbaAsno=${ccbaAsno}&ccbaCtcd=${ccbaCtcd}`;

/**
 * Cleans text by removing newlines, tabs, and extra whitespace.
 * @param {string} text - The text to clean.
 * @returns {string} - Cleaned text.
 */
const cleanText = (text) => text?.replace(/\r\n|\n|\r|\t/g, "").trim() || "-";

/**
 * Fetches heritage detail data.
 * @param {object} heritage - The heritage object containing identifiers.
 * @returns {object} - The fetched heritage detail data.
 */
const fetchHeritageDetails = async (heritage) => {
  try {
    const response = await axios.get(
      heritageInfo_Url(heritage.ccbaKdcd, heritage.ccbaAsno, heritage.ccbaCtcd),
      { headers: { Accept: "application/xml" } }
    );

    const detailXmlText = response.data;
    const detailJsonData = await parseStringPromise(detailXmlText);
    const detailItem = detailJsonData.result?.item?.[0] || {};

    return {
      ccbaLcad: cleanText(detailItem.ccbaLcad?.[0] || "-"),
      ccceName: cleanText(detailItem.ccceName?.[0] || "-"),
      content: detailItem.content?.[0] || "-",
      imageUrl: detailItem.imageUrl?.[0] || "-",
    };
  } catch (error) {
    console.error("Error fetching heritage details:", error.message);
    return {
      ccbaLcad: "-",
      ccceName: "-",
      content: "-",
      imageUrl: "-",
    };
  }
};

/**
 * Fetches the list of heritage items and enriches with details.
 * @param {number} limit - Maximum number of heritage items to fetch.
 * @returns {Array<object>} - List of enriched heritage data.
 */
const callCurrentHeritageListByXML2 = async (limit = 1) => {
  const heritageList = [];
  let totalFetched = 0;

  for (let pageIndex = 1; pageIndex < 100; pageIndex++) {
    try {
      const url = `${CURRENT_HERITAGE_INFO_URL}?pageUnit=100&pageIndex=${pageIndex}`;
      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/xml",
        },
      });

      const xmlText = response.data;
      const jsonData = await parseStringPromise(xmlText);
      const items = jsonData.result?.item || [];

      for (const item of items) {
        const heritage = {
          ccbaKdcd: item.ccbaKdcd?.[0],
          ccbaAsno: item.ccbaAsno?.[0],
          ccbaCtcd: item.ccbaCtcd?.[0],
          ccbaMnm1: item.ccbaMnm1?.[0],
        };

        // Fetch and merge heritage details
        const details = await fetchHeritageDetails(heritage);
        const fullHeritage = { ...heritage, ...details };

        heritageList.push(fullHeritage);
        totalFetched++;

        if (totalFetched >= limit) {
          return heritageList;
        }
      }
    } catch (error) {
      console.error(`Error on page ${pageIndex}:`, error.message);
    }
  }

  return heritageList;
};

callCurrentHeritageListByXML2()
  .then((result) => console.log("Fetched Heritage Data:", result))
  .catch((error) => console.error("Error:", error.message));

module.exports = { callCurrentHeritageListByXML2 };
