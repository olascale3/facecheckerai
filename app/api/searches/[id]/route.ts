import { NextRequest, NextResponse } from "next/server";
import {
  getSearch,
  claimSearch,
  createSearchResult,
  updateSearchStatus,
} from "@/lib/storage";
import { generateMockResults } from "@/lib/mock-results";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let search = await getSearch(id);

    if (!search) {
      return NextResponse.json(
        { message: "Search not found" },
        { status: 404 }
      );
    }

    // Lazy generation: if processing for > 6 seconds, generate results
    if (search.status === "processing" && search.created_at) {
      const elapsed =
        Date.now() - new Date(search.created_at).getTime();
      if (elapsed >= 6000) {
        const claimed = await claimSearch(search.id);
        if (claimed) {
          try {
            const mockResults = generateMockResults(search.id);
            for (const result of mockResults) {
              await createSearchResult(result);
            }
            await updateSearchStatus(search.id, "completed");
          } catch (err) {
            console.error("Error generating results:", err);
            await updateSearchStatus(search.id, "failed");
          }
        }
        search = (await getSearch(id))!;
      }
    }

    return NextResponse.json(search);
  } catch (err) {
    console.error("Error getting search:", err);
    return NextResponse.json(
      { message: "Failed to get search" },
      { status: 500 }
    );
  }
}
