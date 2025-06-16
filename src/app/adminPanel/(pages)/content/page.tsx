// app/cms/page.tsx
import { PrismaClient } from '@prisma/client';
import CmsClient from '../../_components/CmsClient'; // We will create this next
import { Offer } from '../../_actions/contentActions'; // Importuj typ Offer

// Initialize Prisma Client (consider putting this in a lib/prisma.ts file)
const prisma = new PrismaClient();

// Define the expected structure of fetched data
export interface CmsContentData {
    HeaderIMG?: string;
    AboutP?: string;
    AboutIMG?: string;
    Offers?: Offer[]; // Parsed offers
    Map?: string;
    GalleryImages?: string[]; // Parsed image paths
    GalleryVideos?: string[]; // Parsed video paths
    FooterLocation?: string;
    FooterPhone?: string;
    FooterEmail?: string;
    // Pricing Lists (parsed)
    NaDobyBezPaliwa?: string[];
    NaDobyZPaliwem?: string[];
    PrzejazdSkuterem?: string[];
    PrzejazdPontonem?: string; // Single value
    [key: string]: unknown; // Allow other potential tags
}


// Helper to safely parse comma-separated strings
const parseCommaSeparated = (content: string | null | undefined): string[] => {
    if (!content) return [];
    return content.split(',').map(s => s.trim()).filter(Boolean);
};

// Helper to safely parse JSON array
const parseJsonArray = <T,>(content: string | null | undefined, defaultValue: T[] = []): T[] => {
    if (!content) return defaultValue;
    try {
        const parsed = JSON.parse(content);
        return Array.isArray(parsed) ? parsed : defaultValue;
    } catch (e) {
        console.warn("Failed to parse JSON content:", e);
        return defaultValue;
    }
};


export default async function CmsPage() {
  const fetchedContent: CmsContentData = {};

  try {
    const allContent = await prisma.content.findMany();

    // Map fetched data into a structured object
    allContent.forEach(item => {
      fetchedContent[item.tagName] = item.tagContent;
    });

    // Parse complex fields
    fetchedContent.Offers = parseJsonArray<Offer>(fetchedContent.Offers as string | undefined);
    fetchedContent.GalleryImages = parseCommaSeparated(fetchedContent.GalleryImages as string | undefined);
    fetchedContent.GalleryVideos = parseCommaSeparated(fetchedContent.GalleryVideos as string | undefined);
    fetchedContent.NaDobyBezPaliwa = parseCommaSeparated(fetchedContent.NaDobyBezPaliwa as string | undefined);
    fetchedContent.NaDobyZPaliwem = parseCommaSeparated(fetchedContent.NaDobyZPaliwem as string | undefined);
    fetchedContent.PrzejazdSkuterem = parseCommaSeparated(fetchedContent.PrzejazdSkuterem as string | undefined);
    // PrzejazdPontonem is likely a single value, keep as string fetchedContent.PrzejazdPontonem


  } catch (error) {
    console.error("Error fetching CMS content:", error);
    // Handle error display if necessary
  }

  // Pass the processed data to the Client Component
  return <CmsClient initialContent={fetchedContent} />;
}

// Optional: Add metadata
export const metadata = {
  title: 'CMS - Zarządzanie Treścią',
};