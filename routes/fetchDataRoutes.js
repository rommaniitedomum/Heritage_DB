const axios = require("axios");
const { parseStringPromise } = require("xml2js");

const CURRENT_HERITAGE_INFO_URL =
  "https://www.cha.go.kr/cha/SearchKindOpenapiList.do";
const CURRENT_HERITAGE_INFO_DETAIL_URL =
  "https://www.cha.go.kr/cha/SearchKindOpenapiDt.do";

/**
 * Builds the detail URL for heritage info.
 * @param {string} ccbaKdcd - Type code of the heritage.
 * @param {string} ccbaAsno - Serial number of the heritage.
 * @param {string} ccbaCtcd - Regional code of the heritage.
 * @returns {string} - Constructed URL.
 */
const heritageInfo_Url = (ccbaKdcd, ccbaAsno, ccbaCtcd) => {
  return `${CURRENT_HERITAGE_INFO_DETAIL_URL}?ccbaKdcd=${ccbaKdcd}&ccbaAsno=${ccbaAsno}&ccbaCtcd=${ccbaCtcd}`;
};

/**
 * Cleans text by removing newlines, tabs, and extra whitespace.
 * @param {string} text - The raw text to clean.
 * @returns {string} - Cleaned text.
 */
const cleanText = (text) => {
  return text?.replace(/\r\n|\n|\r|\t/g, "").trim() || "-";
};

/**
 * Fetches the detail of a heritage item using its identifiers.
 * @param {string} ccbaKdcd - Type code of the heritage.
 * @param {string} ccbaAsno - Serial number of the heritage.
 * @param {string} ccbaCtcd - Regional code of the heritage.
 * @returns {object} - Parsed detail data.
 */
const fetchHeritageDetail = async (ccbaKdcd, ccbaAsno, ccbaCtcd) => {
  try {
    const detailResponse = await axios.get(
      heritageInfo_Url(ccbaKdcd, ccbaAsno, ccbaCtcd),
      {
        headers: { Accept: "application/xml" },
      }
    );

    const detailXmlText = detailResponse.data;
    const detailJsonData = await parseStringPromise(detailXmlText);
    const detailItem = detailJsonData.result?.item?.[0] || {};

    return {
      gcodeName: detailItem.gcodeName?.[0] || "-",
      bcodeName: detailItem.bcodeName?.[0] || "-",
      ccbaLcad: cleanText(detailItem.ccbaLcad?.[0] || "-"),
      ccceName: cleanText(detailItem.ccceName?.[0] || "-"),
      imageUrl: detailItem.imageUrl?.[0] || "-",
      content: detailItem.content?.[0] || "-",
    };
  } catch (error) {
    console.error("Error fetching heritage detail:", error.message);
    return {};
  }
};

/**
 * Fetches the heritage list and processes it.
 * @param {number} limit - Maximum number of heritage items to fetch.
 * @returns {Array<object>} - List of heritage data.
 */
const callCurrentHeritageListByXML = async (limit = 2) => {
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
          sn: item.sn?.[0] || "-",
          no: item.no?.[0] || "-",
          ccmaName: item.ccmaName?.[0] || "-",
          crltsnoNm: item.crltsnoNm?.[0] || "-",
          ccbaMnm1: item.ccbaMnm1?.[0] || "-",
          ccbaMnm2: item.ccbaMnm2?.[0] || "-",
          ccbaCtcdNm: item.ccbaCtcdNm?.[0] || "-",
          ccsiName: item.ccsiName?.[0] || "-",
          ccbaAdmin: item.ccbaAdmin?.[0] || "-",
          longitude: item.longitude?.[0] || "-",
          latitude: item.latitude?.[0] || "-",
          ccbaKdcd: item.ccbaKdcd?.[0] || "-",
          ccbaAsno: item.ccbaAsno?.[0] || "-",
          ccbaCtcd: item.ccbaCtcd?.[0] || "-",
        };

        // Fetch and merge heritage details
        const detail = await fetchHeritageDetail(
          heritage.ccbaKdcd,
          heritage.ccbaAsno,
          heritage.ccbaCtcd
        );
        const fullHeritage = { ...heritage, ...detail };

        heritageList.push(fullHeritage);
        totalFetched++;

        if (totalFetched >= limit) return heritageList; // Stop once limit is reached
      }
    } catch (error) {
      console.error(`Error on page ${pageIndex}:`, error.message);
    }
  }

  return heritageList;
};

callCurrentHeritageListByXML()
  .then((result) => console.log("Fetched Heritage Data:", result))
  .catch((error) => console.error("Error:", error.message));

module.exports = { callCurrentHeritageListByXML };
