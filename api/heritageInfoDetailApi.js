const axios = require("axios");
const xml2js = require("xml2js");

const API_URL = "http://www.cha.go.kr/cha/SearchKindOpenapiDt.do";

async function fetchHeritageDetails(pageIndex = 1) {
  const url = `${API_URL}?pageUnit=15&pageIndex=${pageIndex}`;
  const response = await axios.get(url, {
    headers: { Accept: "application/xml" },
  });
  const jsonData = await xml2js.parseStringPromise(response.data);
  return jsonData.response.body.items.item.map((item) => ({
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
}

module.exports = { fetchHeritageDetails };
