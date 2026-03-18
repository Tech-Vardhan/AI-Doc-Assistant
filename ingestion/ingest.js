const fs = require("fs");
const path = require("path");
const mammoth = require("mammoth");

const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");
const { OllamaEmbeddings } = require("@langchain/ollama");
const { Chroma } = require("@langchain/community/vectorstores/chroma");

async function run() {

    const docsPath = path.join(__dirname, "../docs");
    const files = fs.readdirSync(docsPath);

    let documents = [];

    for (const file of files) {

        const filePath = path.join(docsPath, file);
        let content = "";

        if (file.endsWith(".docx")) {
            const result = await mammoth.extractRawText({ path: filePath });
            content = result.value;
        } else {
            content = fs.readFileSync(filePath, "utf8");
        }

        console.log("Loaded file:", file);

        documents.push({
            pageContent: content,
            metadata: { source: file }
        });
    }

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 50
    });

    const splitDocs = await splitter.splitDocuments(documents);

    const embeddings = new OllamaEmbeddings({
        model: "nomic-embed-text",
        baseUrl: "http://localhost:11434"
    });

    await Chroma.fromDocuments(
        splitDocs,
        embeddings,
        {
            collectionName: "docs",
            persistDirectory: path.join(__dirname, "../vector-db")
        }
    );

    console.log("Documents embedded successfully!");
}

run();