import { QdrantClient } from "@qdrant/qdrant-js";
import { randomUUID } from "crypto";

const COLLECTION_NAME =
  process.env.QDRANT_COLLECTION || "rag_vectors";

const DISTANCE =
  process.env.QDRANT_DISTANCE || "Cosine";

const client = new QdrantClient({
  url: process.env.QDRANT_URL || "http://localhost:6333",
});

let collectionReadyPromise = null;

function isCollectionAlreadyExistsError(err) {
  if (!err) return false;

  const message =
    `${err?.message || ""} ${err?.data?.status?.error || ""}`.toLowerCase();

  return (
    err?.status === 409 ||
    message.includes("already exists")
  );
}

async function ensureCollectionExists(vectorSize) {
  // Prevent parallel initialization
  if (collectionReadyPromise) {
    return collectionReadyPromise;
  }

  collectionReadyPromise = (async () => {
    try {
      const existing =
        await client.getCollection(COLLECTION_NAME);

      const currentSize =
        existing.config.params.vectors.size;

      if (currentSize !== vectorSize) {
        console.log(
          "⚠️ Vector size mismatch. Recreating collection..."
        );

        await client.deleteCollection(COLLECTION_NAME);

        await client.createCollection(COLLECTION_NAME, {
          vectors: {
            size: vectorSize,
            distance: DISTANCE,
          },
        });

        console.log("✅ Collection recreated");
      } else {
        console.log("✅ Collection already exists");
      }
    } catch (err) {
      // Only create if collection truly does not exist
      const isNotFound =
        err?.status === 404 ||
        `${err?.message || ""}`.includes("Not found");

      if (!isNotFound) {
        throw err;
      }

      try {
        await client.createCollection(COLLECTION_NAME, {
          vectors: {
            size: vectorSize,
            distance: DISTANCE,
          },
        });

        console.log("✅ Collection created");
      } catch (createErr) {
        // Ignore race-condition conflicts
        if (!isCollectionAlreadyExistsError(createErr)) {
          throw createErr;
        }

        console.log(
          "⚠️ Collection already created by another process"
        );
      }
    }
  })();

  return collectionReadyPromise;
}

export async function initializeVectorStore(vectorSize) {
  await ensureCollectionExists(vectorSize);
}

export async function storeEmbedding(
  sessionId,
  vector,
  metadata
) {
  await client.upsert(COLLECTION_NAME, {
    points: [
      {
        id: randomUUID(),
        vector,
        payload: {
          sessionId,
          ...metadata,
        },
      },
    ],
  });
}

export async function searchEmbedding(
  sessionId,
  vector
) {
  const result = await client.search(COLLECTION_NAME, {
    vector,
    filter: sessionId
      ? {
          must: [
            {
              key: "sessionId",
              match: {
                value: sessionId,
              },
            },
          ],
        }
      : undefined,
    limit: 5,
    with_payload: true,
  });

  return result
    .map((r) => r.payload?.text)
    .filter(Boolean);
}