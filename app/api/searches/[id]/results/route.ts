import { NextRequest, NextResponse } from "next/server";
import { getSearch, getSearchResults } from "@/lib/storage";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const search = await getSearch(id);

    if (!search) {
      return NextResponse.json(
        { message: "Search not found" },
        { status: 404 }
      );
    }

    const results = await getSearchResults(id);
    return NextResponse.json(results);
  } catch (err) {
    console.error("Error getting results:", err);
    return NextResponse.json(
      { message: "Failed to get results" },
      { status: 500 }
    );
  }
}
