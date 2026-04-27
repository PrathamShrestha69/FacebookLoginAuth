"use client"
import { Button } from "../ui/button"
import { useState, useEffect } from "react"

export default function LoginButton() {
  const [status, setStatus] = useState<"idle" | "waiting" | "success" | "error">("idle");
  const [loggedIn, setLoggedIn] = useState(false);

  // Check login state on mount
  useEffect(() => {
    fetch("/api/auth/status")
      .then(r => r.json())
      .then(data => {
        if (data.loggedIn) setLoggedIn(true);
      });
  }, []);

  const handleLogin = () => {
    const url =
      `https://www.facebook.com/v19.0/dialog/oauth` +
      `?client_id=${process.env.NEXT_PUBLIC_FACEBOOK_APP_ID}` +
      `&redirect_uri=${process.env.NEXT_PUBLIC_FACEBOOK_REDIRECT_URI}` +
      `&scope=instagram_content_publish,pages_show_list` +
      `&response_type=code`;

    const width = 500, height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    window.open(url, "instagram-oauth", `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`);
    setStatus("waiting");

    const handler = (event: MessageEvent) => {
      if (event.data?.type !== "instagram-auth") return;
      window.removeEventListener("message", handler);

      if (event.data.success) {
        setStatus("success");
        setLoggedIn(true);
      } else {
        setStatus("error");
      }
    };

    window.addEventListener("message", handler);
  };

  const handleLogout = async () => {
    const res = await fetch("/api/auth/logout", { method: "POST" });
    if (res.ok) {
      setLoggedIn(false);
      setStatus("idle");
    }
  };

  if (loggedIn) {
    return (
      <div className="p-5">
        <Button variant="outline" onClick={handleLogout}>Logout</Button>
      </div>
    );
  }

  return (
    <div className="p-5">
      <Button variant="outline" onClick={handleLogin} disabled={status === "waiting"}>
        {status === "waiting" ? "Waiting for login..." : "Login using FaceBook"}
      </Button>
      {status === "error" && <p className="mt-2 text-sm text-red-600">Login failed. Try again.</p>}
    </div>
  );
}