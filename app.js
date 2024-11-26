const PORT = 8000;
const express = require("express");
const pool = require("./pgClient");
const cors = require("cors");
const { callCurrentHeritageListByXML } = require("./fetchData");
const app = express();
app.use(cors());
app.use(express.json());

app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM Heritage;");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// Get a specific heritage entry by ID
app.get("/", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM heritage WHERE sn = $1;", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).send("Heritage not found");
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

app.get("/heritage1", async (req, res) => {
  try {
    const response = await axios.get(
      "https://www.cha.go.kr/cha/SearchKindOpenapiList.do"
    );
    const data = response.data;

    // Assuming the data is an array; adjust if the structure is different
    const limitedData = data.slice(0, 20);

    res.json(limitedData);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Server Error");
  }
});

app.get("/fetcher", async (req, res) => {
  try {
    const data = await callCurrentHeritageListByXML();
    // console.log(JSON.stringify(data, null, 2)); // Log the JSON representation
    res.status(200).json(data);
  } catch (error) {
    console.error("Error in /fetcher route:", error.message);
    res.status(500).send("Server Error: Unable to fetch data");
  }
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
