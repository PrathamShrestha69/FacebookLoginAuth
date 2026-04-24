import { NextResponse } from "next/server";
import fs from "fs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return new Response(`<script>window.opener?.postMessage({type:'instagram-auth',success:false},'*');window.close();</script>`, {
      headers: { "Content-Type": "text/html" },
    });
  }

  const response = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${process.env.INSTAGRAM_APP_ID}&client_secret=${process.env.INSTAGRAM_APP_SECRET}&redirect_uri=${process.env.INSTAGRAM_REDIRECT_URI}&code=${code}`
  );

  const data = await response.json();

  if (data.error) {
    return new Response(`<script>window.opener?.postMessage({type:'instagram-auth',success:false,error:${JSON.stringify(data.error)}},'*');window.close();</script>`, {
      headers: { "Content-Type": "text/html" },
    });
  }

  fs.writeFileSync("token.txt", JSON.stringify(data, null, 2));

  return new Response(`<script>window.opener?.postMessage({type:'instagram-auth',success:true},'*');window.close();</script>`, {
    headers: { "Content-Type": "text/html" },
  });
}