import { NextRequest, NextResponse } from "next/server";
import {
  getSearch,
  createPayment,
  unlockSearchResults,
} from "@/lib/storage";

const WALLET_ADDRESS = "6D9hPAdCYbH2tXRra6gVQn5P1AToLseyirvpQtbziFk9";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { txHash } = body;

    if (!txHash || typeof txHash !== "string") {
      return NextResponse.json(
        { message: "Transaction hash is required" },
        { status: 400 }
      );
    }

    const search = await getSearch(id);
    if (!search) {
      return NextResponse.json(
        { message: "Search not found" },
        { status: 404 }
      );
    }

    const payment = await createPayment({
      searchId: search.id,
      amount: 9.99,
      currency: "SOL",
      walletAddress: WALLET_ADDRESS,
      txHash,
      status: "confirmed",
    });

    await unlockSearchResults(search.id);

    return NextResponse.json({ success: true, payment });
  } catch (err) {
    console.error("Error unlocking results:", err);
    return NextResponse.json(
      { message: "Failed to unlock results" },
      { status: 500 }
    );
  }
}
