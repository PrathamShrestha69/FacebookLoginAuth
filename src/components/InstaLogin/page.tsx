"use client"
import { Button } from "../ui/button"
import { useState, useEffect } from "react"

export default function InstaLogin() {
  const [status, setStatus] = useState<"idle" | "waiting" | "success" | "error">("idle");
  const [loggedIn, setLoggedIn] = useState(false);

  // Check login state on mount
  useEffect(() => {
    fetch("/api/auth/insta/status")
      .then(r => r.json())
      .then(data => {
        if (data.loggedIn) setLoggedIn(true);
      });
  }, []);

const handleLogin = () => {
  const url = "/api/auth/insta/start";

  const width = 500, height = 700;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  const popup = window.open(url, "instagram-oauth", `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`);
  if (!popup) { alert("Please allow popups for this site to log in."); return; }

  setStatus("waiting");
  const handler = (event: MessageEvent) => {
    if (event.data?.type !== "instagram-auth") return;
    window.removeEventListener("message", handler);
    event.data.success ? (setStatus("success"), setLoggedIn(true)) : setStatus("error");
  };
  window.addEventListener("message", handler);
};

  const handleLogout = async () => {
    const res = await fetch("/api/auth/insta/logout", { method: "POST" });
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
        {status === "waiting" ? "Waiting for login..." : "Login using Instagram"}
      </Button>
      {status === "error" && <p className="mt-2 text-sm text-red-600">Login failed. Try again.</p>}
    </div>
  );
}