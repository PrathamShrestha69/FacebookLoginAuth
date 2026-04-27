import { NextResponse } from "next/server";
import fs from "fs";

export async function POST() {
  try {
    if (fs.existsSync("whatsapp_token.txt")) fs.unlinkSync("whatsapp_token.txt");
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}