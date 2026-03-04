import { NextRequest, NextResponse } from "next/server";
import { validateAdminRequest } from "@/lib/admin-auth";
import { getAllSearches, getAllPayments } from "@/lib/storage";

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
    const allPayments = await getAllPayments();
    const totalRevenue = allPayments.reduce(
      (sum, p) => sum + (p.amount || 0),
      0
    );

    return NextResponse.json({
      totalSearches: allSearches.length,
      completedSearches: allSearches.filter(
        (s) => s.status === "completed"
      ).length,
      totalPayments: allPayments.length,
      totalRevenue,
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    return NextResponse.json(
      { message: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
