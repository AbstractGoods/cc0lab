import { defineSchema, defineTable } from "convex/server";
import { v, type PropertyValidators } from "convex/values";

function createAssetSchema<T extends PropertyValidators>(
  type: string,
  fields?: T
) {
  return v.object({
    releaseId: v.optional(v.id("releases")),
    storageId: v.optional(v.id("_storage")),
    type: v.literal(type),
    urls: v.optional(v.array(v.string())),
    ...fields,
  });
}

const imageAssetSchema = createAssetSchema("image", {
  props: v.object({
    alt: v.string(),
    width: v.number(),
    height: v.number(),
  }),
});

const audioAssetSchema = createAssetSchema("audio", {
  props: v.object({
    duration: v.optional(v.number()),
  }),
});

const videoAssetSchema = createAssetSchema("video", {
  props: v.object({
    duration: v.optional(v.number()),
    width: v.number(),
    height: v.number(),
  }),
});

const jsonAssetSchema = createAssetSchema("json");

const assetSchema = v.union(
  imageAssetSchema,
  audioAssetSchema,
  videoAssetSchema,
  jsonAssetSchema
);

export const releasesSchema = {
  title: v.string(), // Release title (e.g. CC0lab Mixtape Vol. 1")
  description: v.string(), // Full description/liner notes
  releaseDate: v.string(), // YYYY-MM-DD
  draft: v.boolean(),
  preview: v.optional(
    v.object({
      imageId: v.optional(v.id("assets")),
      mediaId: v.optional(v.id("assets")),
    })
  ),
  links: v.optional(
    v.array(
      v.object({
        icon: v.optional(v.string()),
        label: v.string(),
        url: v.string(),
      })
    )
  ),
};

// Convex schema for CC0lab releases (mixtapes, albums, etc.)
// Supports both self-hosted and NFT-based releases
export default defineSchema({
  // Evolving, flexible release schema
  releases: defineTable(releasesSchema).index("by_release_date", [
    "releaseDate",
  ]),

  // Assets
  assets: defineTable(assetSchema).index("by_release_id", ["releaseId"]),
});
