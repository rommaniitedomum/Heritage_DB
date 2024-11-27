const PORT = 8000;
const express = require("express");
const pool = require("./pgClient");
const cors = require("cors");
const { callCurrentHeritageListByXML } = require("./routes/fetchDataRoutes");
const {
  callCurrentHeritageListByXML2,
} = require("./routes/LocationDataRoutes");
const { fetchFestivalData } = require("./routes/festivalDataFetcher");

const app = express();
app.use(cors());
app.use(express.json());

// Connect to PostgreSQL 테스트용
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Heritage;");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// 전체 출력 테스트
app.get("/fetcher", async (req, res) => {
  try {
    const data = await callCurrentHeritageListByXML();
    console.log(JSON.stringify(data, null, 2)); // Log the JSON representation
    res.status(200).json(data);
  } catch (err) {
    console.error("Error in /fetcher route:", error.message);
    res.status(500).send("Server Error: Unable to fetch data");
  }
});
// 설정 리스트 출력 테스트
app.get("/fetcher2", async (req, res) => {
  try {
    const data = await callCurrentHeritageListByXML2();
    console.log(JSON.stringify(data, null, 2)); // Log the JSON representation
    res.status(200).json(data);
  } catch (err) {
    console.error("Error in /fetcher route:", error.message);
    res.status(500).send("Server Error: Unable to fetch data");
  }
});
// 카드 출력
app.get("/heritage", async (req, res) => {
  try {
    const heritageList = await callCurrentHeritageListByXML2();
    const html = `
      <html>
      <head>
        <title>Heritage Images</title>
      </head>
      <body>
        <h1>테스트 출력</h1>
        ${heritageList
          .map(
            (heritage) => `
          <div>
          <h2>${heritage.ccbaMnm1}</h2>
          <img src="${heritage.imageUrl}" alt="${heritage.ccbaMnm1}" style="width:300px;"/>
            <p>${heritage.content}</p>
          </div>
        `
          )
          .join("")}
      </body>
      </html>
    `;
    res.send(html);
  } catch (error) {
    res.status(500).send("Error fetching heritage data.");
  }
});
// 제목 출력
app.get("/heritageTitle", async (req, res) => {
  try {
    const heritageList = await callCurrentHeritageListByXML2();
    const html = `
      <html>
      <head>
        <title>Heritage Names</title>
      </head>
      <body>
        <h1>Heritage List</h1>
        <ul>
          ${heritageList
            .map((heritage) => `<li>${heritage.ccbaMnm1}</li>`)
            .join("")}
        </ul>
      </body>
      </html>
    `;
    res.send(html);
  } catch (error) {
    res.status(500).send("Error fetching heritage data.");
  }
});

app.get("/fetcher3", async (req, res) => {
  try {
    const data = await fetchFestivalData();
    console.log(JSON.stringify(data, null, 2)); // Log the JSON representation
    res.status(200).json(data);
  } catch (err) {
    console.error("Error in /fetcher route:", error.message);
    res.status(500).send("Server Error: Unable to fetch data");
  }
});

app.get("/festival", async (req, res) => {
  try {
    const searchYear = req.query.year || new Date().getFullYear();
    const searchMonth = req.query.month || new Date().getMonth() + 1;

    // Already limited in fetchFestivalData
    const festivalList = await fetchFestivalData(searchYear, searchMonth);

    const html = `
      <html>
      <head>
        <title>Festival List</title>
      </head>
      <body>
        <h1>Festival List</h1>
        <ul>
          ${festivalList
            .map(
              (festival) =>
                `<li>
                  <h2>${festival.programName}</h2>
                  <p><strong>Program Content:</strong> ${
                    festival.programContent
                  }</p>
                  <p><strong>Start Date:</strong> ${festival.startDate}</p>
                  <p><strong>End Date:</strong> ${festival.endDate}</p>
                  <p><strong>Location:</strong> ${festival.location}</p>
                  <p><strong>Contact:</strong> ${festival.contact}</p>
                  ${
                    festival.image !== "N/A"
                      ? `<p><strong>Image:</strong> <img src="${festival.image}" alt="${festival.programName}" width="200"></p>`
                      : ""
                  }
                  <p><strong>Target Audience:</strong> ${
                    festival.targetAudience
                  }</p>
                  <p><strong>Additional Info:</strong> ${
                    festival.additionalInfo
                  }</p>
                </li>`
            )
            .join("")}
        </ul>
      </body>
      </html>
    `;
    res.send(html);
  } catch (error) {
    console.error("Error in /festival route:", error);
    res.status(500).send("Error fetching festival data.");
  }
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
