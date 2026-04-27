import fs from "fs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  const fail = (msg = "") => new Response(
    `<script>window.opener?.postMessage({type:'instagram-auth',success:false,error:'${msg}'},'*');window.close();</script>`,
    { headers: { "Content-Type": "text/html" } }
  );

  if (!code) return fail("no_code");

  // Step 1: short-lived token from api.instagram.com (flat response)
  const shortTokenBody = new URLSearchParams({
    client_id: process.env.INSTAGRAM_APP_ID!,
    client_secret: process.env.INSTAGRAM_APP_SECRET!,
    grant_type: "authorization_code",
    redirect_uri: process.env.INSTAGRAM_REDIRECT_URI!,
    code,
  });

  const shortRes = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    body: shortTokenBody,
  });

  const shortData = await shortRes.json();
  console.log("Short token response:", shortData); // keep this while debugging

  if (shortData.error_type || shortData.error_message) return fail(shortData.error_message);

  // ✅ flat object, not data[0]
  const shortAccessToken = shortData?.access_token;
  const shortUserId = shortData?.user_id;
  if (!shortAccessToken || !shortUserId) return fail("invalid_short_token_response");

  // Step 2: long-lived token from graph.instagram.com
  const longUrl = new URL("https://graph.instagram.com/access_token");
  longUrl.searchParams.set("grant_type", "ig_exchange_token");
  longUrl.searchParams.set("client_secret", process.env.INSTAGRAM_APP_SECRET!);
  longUrl.searchParams.set("access_token", shortAccessToken);

  const longRes = await fetch(longUrl);
  const longData = await longRes.json();
  console.log("Long token response:", longData); // keep this while debugging

  if (longData.error) return fail(longData.error.message);

  fs.writeFileSync("token.txt", JSON.stringify({
    access_token: longData.access_token,
    token_type: longData.token_type,
    expires_in: longData.expires_in,
    expires_at: Date.now() + longData.expires_in * 1000,
    user_id: shortUserId,
  }, null, 2));

  return new Response(
    `<script>window.opener?.postMessage({type:'instagram-auth',success:true},'*');window.close();</script>`,
    { headers: { "Content-Type": "text/html" } }
  );
}