const express = require("express");
const router = express.Router();

const { askQuestion } = require("../services/ragService");

router.post("/", async (req, res) => {

  const { question } = req.body;

  const result = await askQuestion(question);

  res.json(result);

});

module.exports = router;