import { NextRequest, NextResponse } from "next/server";
import { validateAdminRequest } from "@/lib/admin-auth";
import {
  getAllSearches,
  getSearchResults,
  getPaymentBySearchId,
} from "@/lib/storage";

export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (!validateAdminRequest(auth)) {
    return NextResponse.json(
      { message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const allSearches = await getAllSearches();
    const searchesWithResults = await Promise.all(
      allSearches.map(async (search) => {
        const results = await getSearchResults(search.id);
        const payment = await getPaymentBySearchId(search.id);
        return {
          ...search,
          image_data:
            search.image_data.substring(0, 100) + "...",
          resultCount: results.length,
          isPaid: !!payment,
          payment: payment || null,
        };
      })
    );
    return NextResponse.json(searchesWithResults);
  } catch (err) {
    console.error("Error fetching admin searches:", err);
    return NextResponse.json(
      { message: "Failed to fetch searches" },
      { status: 500 }
    );
  }
}
