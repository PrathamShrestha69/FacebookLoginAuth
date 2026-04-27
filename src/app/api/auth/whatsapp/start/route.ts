import { NextResponse } from "next/server";

export async function GET() {
  const url = new URL("https://www.facebook.com/dialog/oauth");
  url.searchParams.set("client_id", process.env.META_APP_ID!);          // Main Meta App ID (top of dashboard)
  url.searchParams.set("redirect_uri", process.env.WHATSAPP_REDIRECT_URI!);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", [
    "whatsapp_business_management",
    "whatsapp_business_messaging",
  ].join(","));

  return NextResponse.redirect(url);
}