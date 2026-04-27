import { NextResponse } from "next/server";

export async function GET() {
  const params = new URLSearchParams({
    client_id: process.env.INSTAGRAM_APP_ID!,
    redirect_uri: process.env.INSTAGRAM_REDIRECT_URI!,
    response_type: "code",
    scope: "instagram_business_basic,instagram_business_content_publish",
  });

  // ✅ api.instagram.com, not www.instagram.com
  return NextResponse.redirect(
    `https://api.instagram.com/oauth/authorize?${params}`
  );
}