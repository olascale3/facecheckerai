import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  resetAttempts,
  verifyPassword,
  generateAdminToken,
} from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  if (!checkRateLimit()) {
    return NextResponse.json(
      { message: "Too many attempts. Try again later." },
      { status: 429 }
    );
  }

  const body = await request.json();
  const { password } = body;

  if (verifyPassword(password)) {
    resetAttempts();
    const token = generateAdminToken();
    return NextResponse.json({ success: true, token });
  }

  return NextResponse.json(
    { message: "Invalid password" },
    { status: 401 }
  );
}
