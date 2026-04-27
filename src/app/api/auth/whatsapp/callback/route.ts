import fs from "fs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  const fail = (msg = "") => new Response(
    `<script>window.opener?.postMessage({type:'whatsapp-auth',success:false,error:'${msg}'},'*');window.close();</script>`,
    { headers: { "Content-Type": "text/html" } }
  );

  if (!code) return fail("no_code");

  // Exchange code for short-lived token
  const tokenRes = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token` +
    `?client_id=${process.env.META_APP_ID}` +
    `&client_secret=${process.env.META_APP_SECRET}` +
    `&redirect_uri=${process.env.WHATSAPP_REDIRECT_URI}` +
    `&code=${code}`
  );

  const tokenData = await tokenRes.json();
  console.log("Token response:", tokenData);

  if (tokenData.error) return fail(tokenData.error.message);

  // Exchange short-lived for long-lived token (60 days)
  const longRes = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token` +
    `?grant_type=fb_exchange_token` +
    `&client_id=${process.env.META_APP_ID}` +
    `&client_secret=${process.env.META_APP_SECRET}` +
    `&fb_exchange_token=${tokenData.access_token}`
  );

  const longData = await longRes.json();
  console.log("Long-lived token response:", longData);

  if (longData.error) return fail(longData.error.message);

  fs.writeFileSync("whatsapp_token.txt", JSON.stringify({
    access_token: longData.access_token,
    expires_at: Date.now() + (longData.expires_in ?? 5184000) * 1000,
  }, null, 2));

  return new Response(
    `<script>window.opener?.postMessage({type:'whatsapp-auth',success:true},'*');window.close();</script>`,
    { headers: { "Content-Type": "text/html" } }
  );
}