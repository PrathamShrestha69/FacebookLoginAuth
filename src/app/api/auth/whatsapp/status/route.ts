import { NextResponse } from "next/server";
import fs from "fs";

export async function GET() {
  const loggedIn = fs.existsSync("whatsapp_token.txt");
  return NextResponse.json({ loggedIn });
}