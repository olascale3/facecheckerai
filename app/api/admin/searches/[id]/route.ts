import { NextRequest, NextResponse } from "next/server";
import { validateAdminRequest } from "@/lib/admin-auth";
import {
  getSearch,
  getSearchResults,
  getPaymentBySearchId,
} from "@/lib/storage";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = request.headers.get("authorization");
  if (!validateAdminRequest(auth)) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const search = await getSearch(id);
    if (!search) {
      return NextResponse.json(
        { message: "Search not found" },
        { status: 404 }
      );
    }
    const results = await getSearchResults(search.id);
    const payment = await getPaymentBySearchId(search.id);
    return NextResponse.json({
      search,
      results,
      payment: payment || null,
    });
  } catch (err) {
    console.error("Error fetching search details:", err);
    return NextResponse.json(
      { message: "Failed to fetch search details" },
      { status: 500 }
    );
  }
}
