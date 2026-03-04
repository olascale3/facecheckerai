import { NextRequest, NextResponse } from "next/server";
import { createSearch } from "@/lib/storage";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageData } = body;

    if (!imageData || typeof imageData !== "string") {
      return NextResponse.json(
        { message: "Image data is required" },
        { status: 400 }
      );
    }

    const sessionId =
      request.headers.get("x-session-id") || randomUUID();

    const search = await createSearch({
      imageData,
      sessionId,
      status: "processing",
    });

    return NextResponse.json(search);
  } catch (err) {
    console.error("Error creating search:", err);
    return NextResponse.json(
      { message: "Failed to create search" },
      { status: 500 }
    );
  }
}
