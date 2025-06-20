// app/cms/_actions/contentActions.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { supabaseFetch } from "@/lib/supabaseFetch";

// Define types for Offer and structured data (adjust if needed)
export type OfferFeature = string;
export interface Offer {
  img: string;
  title: string;
  description: string;
  features: string[];
  price: string;
  offerLink?: string; // <-- DODAJ TĘ LINIĘ
}

// --- Helper function to update or create content ---
async function upsertContent(tagName: string, tagContent: string) {
  try {
    // 1. Check if content exists
    const existing = await supabaseFetch<any>("content", {
      method: "GET",
      admin: true,
      query: `tagName=eq.${tagName}`,
    });
    let updated = null;
    if (Array.isArray(existing) && existing.length > 0) {
      // 2. If exists, PATCH (update)
      updated = await supabaseFetch("content", {
        method: "PATCH",
        admin: true,
        query: `tagName=eq.${tagName}`,
        body: { tagContent },
        headers: { Prefer: "return=representation" },
      });
      // If PATCH did not update any row, try POST
      if (!Array.isArray(updated) || updated.length === 0) {
        updated = await supabaseFetch("content", {
          method: "POST",
          admin: true,
          body: { tagName, tagContent },
          headers: { Prefer: "return=representation" },
        });
      }
    } else {
      // 3. If not exists, POST (insert)
      updated = await supabaseFetch("content", {
        method: "POST",
        admin: true,
        body: { tagName, tagContent },
        headers: { Prefer: "return=representation" },
      });
    }
    if (!updated || (Array.isArray(updated) && updated.length === 0)) {
      throw new Error("Supabase: No row updated or inserted.");
    }
    return { success: true };
  } catch (error) {
    console.error(
      `[Server Action] Error in upsertContent for ${tagName}:`,
      error
    );
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Database error updating content.";
    return { success: false, error: errorMessage };
  }
  // Fallback (should never hit)
  return { success: false, error: "Unknown error in upsertContent." };
}

// --- Action to update a single content value ---
export async function updateSingleContentAction(
  tagName: string,
  tagContent: string | null | undefined
) {
  try {
    console.log(
      `Action: updateSingleContentAction - Tag: ${tagName}, Content: ${tagContent}`
    );
    if (typeof tagContent !== "string") {
      console.warn(
        `Received non-string content for ${tagName}, skipping update.`
      );
      tagContent = "";
    }
    return await upsertContent(tagName, tagContent);
  } catch (error) {
    console.error("updateSingleContentAction error:", error);
    return { success: false, error: "Unknown error in updateSingleContentAction." };
  }
}

// --- Action to update multiple content values from a form ---
const UpdateMultipleContentSchema = z.object({
  // Add all fields that can be updated in a single form section
  HeaderIMG: z.string().optional(),
  AboutP: z.string().optional(),
  AboutIMG: z.string().optional(),
  Map: z.string().optional(),
  FooterLocation: z.string().optional(),
  FooterPhone: z.string().optional(),
  FooterEmail: z.string().optional(),
  // Add pricing fields if needed (tylko pojedyncze, bo w bazie masz string z przecinkami)
  // Jeśli chcesz obsługiwać wiele cen, zrób to jako tablica/CSV w jednym polu
  // Usuwam CenaBezPaliwa2+, CenaZPaliwem2+ itd.
  CenaBezPaliwa1: z.string().optional(),
  CenaBezPaliwem1: z.string().optional(),
  Skuter10min: z.string().optional(),
  Skuter30min: z.string().optional(),
  Skuter60min: z.string().optional(),
  PrzejazdPontonem: z.string().optional(),
});

export async function updateMultipleContentAction(formData: FormData) {
  try {
    console.log("Action: updateMultipleContentAction");
    const data = Object.fromEntries(formData.entries());
    const validation = UpdateMultipleContentSchema.safeParse(data);
    if (!validation.success) {
      console.error("Validation failed:", validation.error.errors);
      return { success: false, error: "Invalid form data." };
    }
    const updates: Promise<{ success: boolean; error?: string }>[] = [];
    const validatedData = validation.data;
    for (const [key, value] of Object.entries(validatedData)) {
      if (value !== undefined && value !== null) {
        console.log(`  -> Scheduling update for ${key}: ${value}`);
        updates.push(upsertContent(key, value as string));
      } else {
        console.log(
          `  -> Skipping update for ${key} (value is null or undefined)`
        );
      }
    }
    try {
      const results = await Promise.all(updates);
      const failures = results.filter((r) => !r.success);
      if (failures.length > 0) {
        console.error("Some updates failed:", failures);
        return {
          success: false,
          error: `Failed to update ${failures.length} item(s).`,
        };
      }
      console.log("All scheduled updates successful.");
      return { success: true };
    } catch (error) {
      console.error("Error during Promise.all:", error);
      return {
        success: false,
        error: "An unexpected error occurred during update.",
      };
    }
  } catch (error) {
    console.error("updateMultipleContentAction error:", error);
    return { success: false, error: "Unknown error in updateMultipleContentAction." };
  }
}

// --- Action to add Media (Image/Video) ---
const AddMediaSchema = z.object({
  mediaPath: z.string().min(1, "Media path cannot be empty."),
  mediaType: z.enum(["IMG", "VID"]),
});

export async function addMediaAction(formData: FormData) {
  try {
    console.log("Action: addMediaAction");
    const data = Object.fromEntries(formData.entries());
    const validation = AddMediaSchema.safeParse(data);
    if (!validation.success) {
      console.error("Validation failed:", validation.error.errors);
      return { success: false, error: "Invalid media data." };
    }
    const { mediaPath, mediaType } = validation.data;
    const tagName = mediaType === "IMG" ? "GalleryImages" : "GalleryVideos";
    try {
      const existingContentArr = await supabaseFetch<any[]>("content", {
        method: "GET",
        admin: true,
        query: `tagName=eq.${tagName}`,
      });
      const currentPaths = existingContentArr?.[0]?.tagContent
        ? existingContentArr[0].tagContent.split(",")
        : [];
      if (currentPaths.includes(mediaPath)) {
        console.warn(`Media path already exists: ${mediaPath}`);
        return { success: false, error: "Media item already exists." };
      }
      const newPaths = [...currentPaths, mediaPath].filter(Boolean);
      const newTagContent = newPaths.join(",");
      console.log(`  -> Updating ${tagName} with: ${newTagContent}`);
      return await upsertContent(tagName, newTagContent);
    } catch (error) {
      console.error(`Error adding media to ${tagName}:", error);
      return { success: false, error: "Database error adding media." };
    }
  } catch (error) {
    console.error("addMediaAction error:", error);
    return { success: false, error: "Unknown error in addMediaAction." };
  }
}

// --- Action to delete Media (Image/Video) ---
export async function deleteMediaAction(
  mediaType: "IMG" | "VID",
  mediaPathToDelete: string
) {
  try {
    console.log(
      `Action: deleteMediaAction - Type: ${mediaType}, Path: ${mediaPathToDelete}`
    );
    if (!mediaPathToDelete) {
      return { success: false, error: "No media path provided for deletion." };
    }
    const tagName = mediaType === "IMG" ? "GalleryImages" : "GalleryVideos";
    try {
      const existingContentArr = await supabaseFetch<any[]>("content", {
        method: "GET",
        admin: true,
        query: `tagName=eq.${tagName}`,
      });
      if (!existingContentArr?.[0]?.tagContent) {
        console.warn(`No content found for ${tagName} to delete from.`);
        return { success: true }; // Nothing to delete
      }
      const currentPaths = existingContentArr[0].tagContent.split(",");
      const newPaths = currentPaths.filter(
        (path: string) => path !== mediaPathToDelete && path !== ""
      );
      if (newPaths.length === currentPaths.filter(Boolean).length) {
        console.warn(`Media path not found for deletion: ${mediaPathToDelete}`);
      }
      const newTagContent = newPaths.join(",");
      console.log(`  -> Updating ${tagName} after deletion: ${newTagContent}`);
      return await upsertContent(tagName, newTagContent);
    } catch (error) {
      console.error(`Error deleting media from ${tagName}:", error);
      return { success: false, error: "Database error deleting media." };
    }
  } catch (error) {
    console.error("deleteMediaAction error:", error);
    return { success: false, error: "Unknown error in deleteMediaAction." };
  }
}

// --- Action to add an Offer ---
const AddOfferSchema = z.object({
  img: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  features: z.string(), // Comma-separated features
  price: z.string().min(1),
});

export async function addOfferAction(formData: FormData) {
  try {
    console.log("Action: addOfferAction");
    const data = Object.fromEntries(formData.entries());
    const validation = AddOfferSchema.safeParse(data);
    if (!validation.success) {
      console.error("Validation failed:", validation.error.errors);
      return { success: false, error: "Invalid offer data." };
    }
    const {
      img,
      title,
      description,
      features: featuresString,
      price,
    } = validation.data;
    const features = featuresString
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);
    const newOffer: Offer = { img, title, description, features, price };
    try {
      const existingContentArr = await supabaseFetch<any[]>("content", {
        method: "GET",
        admin: true,
        query: `tagName=eq.Offers`,
      });
      let currentOffers: Offer[] = [];
      if (existingContentArr?.[0]?.tagContent) {
        try {
          currentOffers = JSON.parse(existingContentArr[0].tagContent);
          if (!Array.isArray(currentOffers)) currentOffers = [];
        } catch (e) {
          console.warn("Failed to parse existing Offers JSON, starting fresh.");
          currentOffers = [];
        }
      }
      const updatedOffers = [...currentOffers, newOffer];
      const newTagContent = JSON.stringify(updatedOffers);
      console.log(`  -> Updating Offers with: ${newTagContent}`);
      return await upsertContent("Offers", newTagContent);
    } catch (error) {
      console.error("Error adding offer:", error);
      return { success: false, error: "Database error adding offer." };
    }
  } catch (error) {
    console.error("addOfferAction error:", error);
    return { success: false, error: "Unknown error in addOfferAction." };
  }
}

// --- Action to delete an Offer ---
// We need a unique identifier, using title for now, but index or a unique ID would be better.
export async function deleteOfferAction(offerTitleToDelete: string) {
  try {
    console.log(`Action: deleteOfferAction - Title: ${offerTitleToDelete}`);
    if (!offerTitleToDelete) {
      return { success: false, error: "No offer title provided for deletion." };
    }
    try {
      const existingContentArr = await supabaseFetch<any[]>("content", {
        method: "GET",
        admin: true,
        query: `tagName=eq.Offers`,
      });
      if (!existingContentArr?.[0]?.tagContent) {
        console.warn(`No Offers content found to delete from.`);
        return { success: true };
      }
      let currentOffers: Offer[] = [];
      try {
        currentOffers = JSON.parse(existingContentArr[0].tagContent);
        if (!Array.isArray(currentOffers)) {
          console.warn("Offers content is not a valid JSON array.");
          return { success: false, error: "Invalid existing offer data format." };
        }
      } catch (e) {
        console.warn("Failed to parse existing Offers JSON for deletion.");
        return { success: false, error: "Failed to parse existing offer data." };
      }
      const updatedOffers = currentOffers.filter(
        (offer) => offer.title !== offerTitleToDelete
      );
      if (updatedOffers.length === currentOffers.length) {
        console.warn(`Offer not found for deletion: ${offerTitleToDelete}`);
      }
      const newTagContent = JSON.stringify(updatedOffers);
      console.log(`  -> Updating Offers after deletion: ${newTagContent}`);
      return await upsertContent("Offers", newTagContent);
    } catch (error) {
      console.error("Error deleting offer:", error);
      return { success: false, error: "Database error deleting offer." };
    }
  } catch (error) {
    console.error("deleteOfferAction error:", error);
    return { success: false, error: "Unknown error in deleteOfferAction." };
  }
}
