const { Ollama } = require("langchain/llms/ollama");

const ollama = new Ollama({
  baseUrl: "http://localhost:11434",
  model: "llama3"
});

module.exports = ollama;