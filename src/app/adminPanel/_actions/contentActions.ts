// app/cms/_actions/contentActions.ts
"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Define types for Offer and structured data (adjust if needed)
export type OfferFeature = string;
export type Offer = {
  img: string;
  title: string;
  description: string;
  features: OfferFeature[];
  price: string;
};

const prisma = new PrismaClient();

// --- Helper function to update or create content ---
async function upsertContent(tagName: string, tagContent: string) {
  try {
    await prisma.content.upsert({
      where: { tagName },
      update: { tagContent },
      create: { tagName, tagContent },
    });

    // Definiujemy poprawną ścieżkę URL do unieważnienia
    const pathToRevalidate = "/cms/content"; // <--- Zmień na DOKŁADNĄ ścieżkę Twojej strony CMS

    console.log(
      `[Server Action] Content updated for ${tagName}. Attempting to revalidate: ${pathToRevalidate}`
    ); // <-- LOG PRZED
    revalidatePath(pathToRevalidate);

    // Opcjonalnie rewaliduj stronę główną, jeśli tam też wyświetlasz te treści
    // console.log('[Server Action] Revalidating path: /');
    // revalidatePath('/');

    console.log(
      `[Server Action] Revalidation call for ${pathToRevalidate} finished.`
    ); // <-- LOG PO (dla pewności)
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
}

// --- Action to update a single content value ---
export async function updateSingleContentAction(
  tagName: string,
  tagContent: string | null | undefined
) {
  console.log(
    `Action: updateSingleContentAction - Tag: ${tagName}, Content: ${tagContent}`
  );
  if (typeof tagContent !== "string") {
    console.warn(
      `Received non-string content for ${tagName}, skipping update.`
    );
    // Decide if you want to treat null/undefined as empty string or skip
    // If treating as empty string: tagContent = '';
    // If skipping: return { success: false, error: 'Invalid content type.' };
    tagContent = ""; // Defaulting to empty string for now
  }
  return upsertContent(tagName, tagContent);
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
  // Add pricing fields if needed
  CenaBezPaliwa1: z.string().optional(),
  CenaBezPaliwa2: z.string().optional(),
  CenaBezPaliwa3: z.string().optional(),
  CenaBezPaliwa4: z.string().optional(),
  CenaBezPaliwa5: z.string().optional(),
  CenaZPaliwem1: z.string().optional(),
  CenaZPaliwem2: z.string().optional(),
  CenaZPaliwem3: z.string().optional(),
  CenaZPaliwem4: z.string().optional(),
  CenaZPaliwem5: z.string().optional(),
  CenaZPaliwem6: z.string().optional(),
  Skuter10min: z.string().optional(),
  Skuter30min: z.string().optional(),
  Skuter60min: z.string().optional(),
  PrzejazdPontonem: z.string().optional(),
});

export async function updateMultipleContentAction(formData: FormData) {
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
      // If you want to explicitly clear fields when empty, uncomment below
      // updates.push(upsertContent(key, ''));
    }
  }

  // Handle pricing lists (combine/split comma-separated values)
  const updatePricingList = async (
    baseTagName: string,
    priceKeys: (keyof typeof validatedData)[]
  ) => {
    const currentContent = await prisma.content.findUnique({
      where: { tagName: baseTagName },
    });
    const currentPrices = currentContent?.tagContent?.split(",") || [];
    const updatedPrices = [...currentPrices]; // Start with existing prices

    let changed = false;
    priceKeys.forEach((key, index) => {
      const newValue = validatedData[key];
      // Update only if a new value is provided (not undefined)
      // Allow empty string to clear a price
      if (newValue !== undefined) {
        // Pad the array if the index is out of bounds
        while (updatedPrices.length <= index) {
          updatedPrices.push("");
        }
        if (updatedPrices[index] !== newValue) {
          updatedPrices[index] = newValue ?? ""; // Use empty string if null/undefined
          changed = true;
          console.log(
            `  -> Updating ${baseTagName} index ${index} with: ${updatedPrices[index]}`
          );
        }
      }
    });

    if (changed) {
      console.log(
        `  -> Scheduling update for ${baseTagName} with combined value: ${updatedPrices.join(
          ","
        )}`
      );
      updates.push(upsertContent(baseTagName, updatedPrices.join(",")));
    } else {
      console.log(
        `  -> No changes detected for ${baseTagName}, skipping update.`
      );
    }
  };

  // Call for each pricing group
  await updatePricingList("NaDobyBezPaliwa", [
    "CenaBezPaliwa1",
    "CenaBezPaliwa2",
    "CenaBezPaliwa3",
    "CenaBezPaliwa4",
    "CenaBezPaliwa5",
  ]);
  await updatePricingList("NaDobyZPaliwem", [
    "CenaZPaliwem1",
    "CenaZPaliwem2",
    "CenaZPaliwem3",
    "CenaZPaliwem4",
    "CenaZPaliwem5",
    "CenaZPaliwem6",
  ]);
  await updatePricingList("PrzejazdSkuterem", [
    "Skuter10min",
    "Skuter30min",
    "Skuter60min",
  ]);
  // Single value pricing - already handled by the loop above
  // await updatePricingList('PrzejazdPontonem', ['PrzejazdPontonem']);

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
}

// --- Action to add Media (Image/Video) ---
const AddMediaSchema = z.object({
  mediaPath: z.string().min(1, "Media path cannot be empty."),
  mediaType: z.enum(["IMG", "VID"]),
});

export async function addMediaAction(formData: FormData) {
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
    const existingContent = await prisma.content.findUnique({
      where: { tagName },
    });
    const currentPaths = existingContent?.tagContent
      ? existingContent.tagContent.split(",")
      : [];

    // Prevent adding duplicates
    if (currentPaths.includes(mediaPath)) {
      console.warn(`Media path already exists: ${mediaPath}`);
      return { success: false, error: "Media item already exists." };
    }

    const newPaths = [...currentPaths, mediaPath].filter(Boolean); // Add new path and remove potential empty strings
    const newTagContent = newPaths.join(",");

    console.log(`  -> Updating ${tagName} with: ${newTagContent}`);
    return upsertContent(tagName, newTagContent);
  } catch (error) {
    console.error(`Error adding media to ${tagName}:`, error);
    return { success: false, error: "Database error adding media." };
  }
}

// --- Action to delete Media (Image/Video) ---
export async function deleteMediaAction(
  mediaType: "IMG" | "VID",
  mediaPathToDelete: string
) {
  console.log(
    `Action: deleteMediaAction - Type: ${mediaType}, Path: ${mediaPathToDelete}`
  );
  if (!mediaPathToDelete) {
    return { success: false, error: "No media path provided for deletion." };
  }
  const tagName = mediaType === "IMG" ? "GalleryImages" : "GalleryVideos";

  try {
    const existingContent = await prisma.content.findUnique({
      where: { tagName },
    });
    if (!existingContent || !existingContent.tagContent) {
      console.warn(`No content found for ${tagName} to delete from.`);
      return { success: true }; // Nothing to delete
    }

    const currentPaths = existingContent.tagContent.split(",");
    const newPaths = currentPaths.filter(
      (path) => path !== mediaPathToDelete && path !== ""
    ); // Remove the path and empty strings

    if (newPaths.length === currentPaths.filter(Boolean).length) {
      console.warn(`Media path not found for deletion: ${mediaPathToDelete}`);
      // Optionally return error: return { success: false, error: 'Media item not found.' };
    }

    const newTagContent = newPaths.join(",");
    console.log(`  -> Updating ${tagName} after deletion: ${newTagContent}`);
    return upsertContent(tagName, newTagContent);
  } catch (error) {
    console.error(`Error deleting media from ${tagName}:`, error);
    return { success: false, error: "Database error deleting media." };
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
    const existingContent = await prisma.content.findUnique({
      where: { tagName: "Offers" },
    });
    let currentOffers: Offer[] = [];
    if (existingContent?.tagContent) {
      try {
        currentOffers = JSON.parse(existingContent.tagContent);
        if (!Array.isArray(currentOffers)) currentOffers = []; // Ensure it's an array
      } catch (e) {
        console.warn("Failed to parse existing Offers JSON, starting fresh.");
        currentOffers = [];
      }
    }

    // Optional: Check for duplicates based on title or img
    // if (currentOffers.some(o => o.title === newOffer.title)) {
    //     return { success: false, error: 'Offer with this title already exists.' };
    // }

    const updatedOffers = [...currentOffers, newOffer];
    const newTagContent = JSON.stringify(updatedOffers);
    console.log(`  -> Updating Offers with: ${newTagContent}`);
    return upsertContent("Offers", newTagContent);
  } catch (error) {
    console.error("Error adding offer:", error);
    return { success: false, error: "Database error adding offer." };
  }
}

// --- Action to delete an Offer ---
// We need a unique identifier, using title for now, but index or a unique ID would be better.
export async function deleteOfferAction(offerTitleToDelete: string) {
  console.log(`Action: deleteOfferAction - Title: ${offerTitleToDelete}`);
  if (!offerTitleToDelete) {
    return { success: false, error: "No offer title provided for deletion." };
  }

  try {
    const existingContent = await prisma.content.findUnique({
      where: { tagName: "Offers" },
    });
    if (!existingContent?.tagContent) {
      console.warn(`No Offers content found to delete from.`);
      return { success: true }; // Nothing to delete
    }

    let currentOffers: Offer[] = [];
    try {
      currentOffers = JSON.parse(existingContent.tagContent);
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
      // Optionally return error: return { success: false, error: 'Offer not found.' };
    }

    const newTagContent = JSON.stringify(updatedOffers);
    console.log(`  -> Updating Offers after deletion: ${newTagContent}`);
    return upsertContent("Offers", newTagContent);
  } catch (error) {
    console.error("Error deleting offer:", error);
    return { success: false, error: "Database error deleting offer." };
  }
}
