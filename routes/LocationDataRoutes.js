const axios = require("axios");
const { parseStringPromise } = require("xml2js");

const CURRENT_HERITAGE_INFO_URL =
  "https://www.cha.go.kr/cha/SearchKindOpenapiList.do";
const CURRENT_HERITAGE_INFO_DETAIL_URL =
  "https://www.cha.go.kr/cha/SearchKindOpenapiDt.do";

// Build detail URL
const heritageInfo_Url = (ccbaKdcd, ccbaAsno, ccbaCtcd) => {
  return `${CURRENT_HERITAGE_INFO_DETAIL_URL}?ccbaKdcd=${ccbaKdcd}&ccbaAsno=${ccbaAsno}&ccbaCtcd=${ccbaCtcd}`;
};

const callCurrentHeritageListByXML2 = async () => {
  const list = [];
  let totalFetched = 0; // Counter to track total number of items fetched

  for (let j = 1; j < 100; j++) {
    try {
      const url = `${CURRENT_HERITAGE_INFO_URL}?pageUnit=100&pageIndex=${j}`;
      console.log(`Fetching page ${j}: ${url}`);

      // Fetch data with Axios
      const response = await axios.get(url, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/xml",
        },
      });

      const xmlText = response.data; // Axios automatically decodes response

      // Parse XML to JSON
      const jsonData = await parseStringPromise(xmlText);
      const items = jsonData.result?.item || []; // Extract items safely

      console.log(`Found ${items.length} items on page ${j}`);
      for (const item of items) {
        // Build the heritage object
        const heritage = {
          ccbaKdcd: item.ccbaKdcd?.[0],
          ccbaAsno: item.ccbaAsno?.[0],
          ccbaCtcd: item.ccbaCtcd?.[0],
          ccbaMnm1: item.ccbaMnm1?.[0],
        };

        // Fetch heritage detail data
        const detailResponse = await axios.get(
          heritageInfo_Url(
            heritage.ccbaKdcd,
            heritage.ccbaAsno,
            heritage.ccbaCtcd
          ),
          { headers: { Accept: "application/xml" } }
        );

        const detailXmlText = detailResponse.data;
        const detailJsonData = await parseStringPromise(detailXmlText);
        const detailItem = detailJsonData.result?.item?.[0] || {};
        const cleanText = (text) => {
          return text
            .replace(/\r\n|\n|\r|\t/g, "") // Remove newlines and tabs
            .trim(); // Remove leading/trailing whitespace
        };

        heritage.ccbaLcad = cleanText(detailItem.ccbaLcad?.[0] || "-");
        heritage.ccceName = cleanText(detailItem.ccceName?.[0] || "-");
        heritage.content = detailItem.content?.[0] || "-";
        heritage.imageUrl = detailItem.imageUrl?.[0] || "-";

        list.push(heritage);
        totalFetched++; // Increment the counter

        // ***************아이템 가저오는 숫자***************************
        if (totalFetched >= 1) {
          console.log("Fetched N items. Exiting...");
          return list;
        }
      }
    } catch (error) {
      console.error(`Error on page ${j}:`, error.message);
    }
  }

  return list;
};

callCurrentHeritageListByXML2()
  .then((result) => console.log("Fetched Heritage Data:", result))
  .catch((error) => console.error("Error:", error.message));

module.exports = { callCurrentHeritageListByXML2 };
