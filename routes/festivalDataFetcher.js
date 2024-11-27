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

    // Map and limit the data to 3 entries
    const limitedData = itemArray.slice(0, 3).map((item) => ({
      programName: item.subTitle || "N/A", // 프로그램 이름
      programContent: item.subContent || "N/A", // 프로그램 내용
      startDate: item.sDate || "N/A", // 시작일자
      endDate: item.eDate || "N/A", // 종료일자
      location: item.subDesc || "N/A", // 장소
      contact: item.contact || "N/A", // 문의
      image: item.fileNm || "N/A", // 이미지
      targetAudience: item.subDesc1 || "N/A", // 참여대상
      additionalInfo: `${item.subDesc2 || "N/A"}, ${item.subDesc_3 || "N/A"}`, // 기타 (가격 등)
    }));

    console.log("Extracted Festival Data:", limitedData);
    return limitedData;
  } catch (error) {
    console.error("Error fetching or parsing festival data:", error);
    return [];
  }
};

module.exports = { fetchFestivalData };
