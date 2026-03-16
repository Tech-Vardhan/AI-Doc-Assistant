const path = require("path");

const { Chroma } = require("@langchain/community/vectorstores/chroma");
const { OllamaEmbeddings, ChatOllama } = require("@langchain/ollama");

async function askQuestion(question) {

  const embeddings = new OllamaEmbeddings({
    model: "nomic-embed-text",
    baseUrl: "http://localhost:11434"
  });

  const vectorStore = await Chroma.fromExistingCollection(
    embeddings,
    {
      collectionName: "docs",
      persistDirectory: path.join(__dirname, "../../vector-db")
    }
  );

  const retriever = vectorStore.asRetriever(3);

  const docs = await retriever.invoke(question);

  const context = docs.map(d => d.pageContent).join("\n");

  const model = new ChatOllama({
    model: "llama3",
    baseUrl: "http://localhost:11434"
  });

  const prompt = `
You are a documentation assistant.

Use the following documentation to answer the question.

Context:
${context}

Question:
${question}
`;

  const response = await model.invoke(prompt);

  return {
    answer: response.content,
    sources: [...new Set(docs.map(d => d.metadata.source))]
  };
}

module.exports = { askQuestion };