import { QdrantClient } from "@qdrant/js-client-rest";

const COLLECTION_NAME = "rag-chatbot";

export const client = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
  checkCompatibility: false,
});

let initialized = false;

export async function ensureCollection() {
  if (initialized) return;

  try {
    const collections = await client.getCollections();

    const exists = collections.collections.some(
      (collection) => collection.name === COLLECTION_NAME
    );

    if (!exists) {
      console.log("Creating collection:", COLLECTION_NAME);

      await client.createCollection(COLLECTION_NAME, {
        vectors: {
          size: parseInt(process.env.QDRANT_VECTOR_SIZE),
          distance: process.env.QDRANT_DISTANCE,
        },
      });

      console.log("Collection created successfully");
    } else {
      console.log("Collection already exists");
    }

    initialized = true;
  } catch (error) {
    console.error("Collection initialization failed:", error);
    throw error;
  }
}

export async function storeEmbedding({
  id,
  embedding,
  text,
  metadata = {},
}) {
  await ensureCollection();

  return await client.upsert(COLLECTION_NAME, {
    wait: true,
    points: [
      {
        id,
        vector: embedding,
        payload: {
          text,
          ...metadata,
        },
      },
    ],
  });
}