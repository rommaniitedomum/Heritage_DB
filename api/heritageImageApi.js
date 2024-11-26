const axios = require("axios");
const xml2js = require("xml2js");

const API_URL = "http://www.cha.go.kr/cha/SearchImageOpenapi.do";

async function fetchHeritageImages(pageIndex = 1) {
  const url = `${API_URL}?pageUnit=15&pageIndex=${pageIndex}`;
  const response = await axios.get(url, {
    headers: { Accept: "application/xml" },
  });
  const jsonData = await xml2js.parseStringPromise(response.data);
  return jsonData.response.body.items.item.map((item) => ({
    imageNo: item.imageNo[0],
    imageUrl: item.imageUrl[0],
    ccimDesc: item.ccimDesc[0],
    sn: item.sn[0],
    no: item.no[0],
    ccbaKdcd: item.ccbaKdcd[0],
    ccbaCtcd: item.ccbaCtcd[0],
    ccbaAsno: item.ccbaAsno[0],
  }));
}

module.exports = { fetchHeritageImages };
