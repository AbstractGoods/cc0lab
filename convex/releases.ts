import { Doc, Id } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { releasesSchema } from "./schema";
import { v } from "convex/values";

export const list = query({
  args: {
    includeDrafts: v.optional(v.boolean()),
    includeAssets: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // TODO filter drafts and order by release date, include image and media assets
    const releases = await ctx.db
      .query("releases")
      .withIndex("by_release_date")
      .order("desc")
      .filter((q) => {
        // Include all releases (drafts or not)
        if (args.includeDrafts) return true;
        // Exclude drafts
        return q.eq(q.field("draft"), false);
      })
      .collect();

    if (args.includeAssets) {
      const assetsMap: Map<Id<"assets">, Doc<"assets">> = new Map();
      // Get all assets for all releases
      await Promise.all(
        releases.map(async (release) => {
          // if release.preview is not defined, return
          if (!release.preview) return;
          // If imageId is not in the map, get asset from db and add to map
          const assetIds = [
            release.preview?.imageId,
            release.preview?.mediaId,
          ].filter((id): id is Id<"assets"> => id !== undefined);

          for (const assetId of assetIds) {
            if (!assetsMap.has(assetId)) {
              const asset = await ctx.db.get(assetId);
              if (!asset) continue;
              // Use convex storage for images, but not for audio/video/json
              if (asset.type === "image") {
                const assetUrl = asset.storageId
                  ? await ctx.storage.getUrl(asset.storageId)
                  : undefined;
                assetsMap.set(assetId, {
                  ...asset,
                  urls: assetUrl ? [assetUrl] : asset.urls,
                });
              } else {
                assetsMap.set(assetId, asset);
              }
            }
          }
        })
      );

      return releases.map((release) => ({
        ...release,
        preview: {
          ...release.preview,
          image: release?.preview?.imageId
            ? assetsMap.get(release.preview.imageId)
            : undefined,
          media: release?.preview?.mediaId
            ? assetsMap.get(release.preview.mediaId)
            : undefined,
        },
      }));
    }

    return releases.map((release) => ({
      ...release,
      preview: {
        ...release.preview,
        image: undefined,
        media: undefined,
      },
    }));
  },
});
