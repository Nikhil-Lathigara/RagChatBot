import { QdrantClient } from "@qdrant/qdrant-js";
import { randomUUID } from "crypto";

const COLLECTION_NAME =
  process.env.QDRANT_COLLECTION;

const DISTANCE =
  process.env.QDRANT_DISTANCE;

  console.log("QDRANT_URL =", process.env.QDRANT_URL);
const client = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
  checkCompatibility: false,
});

let collectionReadyPromise = null;

/**
 * Check if collection already exists error
 */
function isCollectionAlreadyExistsError(err) {
  if (!err) return false;

  const message =
    `${err?.message || ""} ${
      err?.data?.status?.error || ""
    }`.toLowerCase();

  return (
    err?.status === 409 ||
    message.includes("already exists")
  );
}

/**
 * Ensure collection + payload index exist
 */
async function ensureCollectionExists(vectorSize) {
  // Prevent parallel initialization
  if (collectionReadyPromise) {
    return collectionReadyPromise;
  }

  collectionReadyPromise = (async () => {
    try {
      let recreateCollection = false;

      try {
        const existing =
          await client.getCollection(COLLECTION_NAME);

        const currentSize =
          existing.config.params.vectors.size;

        if (currentSize !== vectorSize) {
          console.log(
            "⚠️ Vector size mismatch. Recreating collection..."
          );

          recreateCollection = true;
        } else {
          console.log(
            "✅ Collection already exists"
          );
        }
      } catch (err) {
        const isNotFound =
          err?.status === 404 ||
          `${err?.message || ""}`.includes(
            "Not found"
          );

        if (isNotFound) {
          recreateCollection = true;
        } else {
          throw err;
        }
      }

      // Recreate collection if needed
      if (recreateCollection) {
        try {
          // Delete old collection if exists
          try {
            await client.deleteCollection(
              COLLECTION_NAME
            );
          } catch (_) {}

          // Create collection
          await client.createCollection(
            COLLECTION_NAME,
            {
              vectors: {
                size: vectorSize,
                distance: DISTANCE,
              },
            }
          );

          console.log("✅ Collection created");
        } catch (createErr) {
          if (
            !isCollectionAlreadyExistsError(
              createErr
            )
          ) {
            throw createErr;
          }

          console.log(
            "⚠️ Collection already exists"
          );
        }
      }

      /**
       * ALWAYS ensure payload index exists
       */
      try {
        await client.createPayloadIndex(
          COLLECTION_NAME,
          {
            field_name: "sessionId",
            field_schema: "keyword",
          }
        );

        console.log(
          "✅ sessionId payload index created"
        );
      } catch (indexErr) {
        console.log(
          "⚠️ sessionId index already exists"
        );
      }
    } catch (err) {
      console.error(
        "❌ Qdrant initialization failed:",
        err
      );

      collectionReadyPromise = null;

      throw err;
    }
  })();

  return collectionReadyPromise;
}

/**
 * Initialize vector store
 */
export async function initializeVectorStore(
  vectorSize
) {
  await ensureCollectionExists(vectorSize);
}

/**
 * Store embedding
 */
export async function storeEmbedding(
  sessionId,
  vector,
  metadata = {}
) {
  await ensureCollectionExists(vector.length);

  await client.upsert(COLLECTION_NAME, {
    wait: true,
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

/**
 * Search embeddings
 */
export async function searchEmbedding(
  sessionId,
  vector
) {
  await ensureCollectionExists(vector.length);

  const result = await client.search(
    COLLECTION_NAME,
    {
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
    }
  );

  return result
    .map((r) => r.payload?.text)
    .filter(Boolean);
}