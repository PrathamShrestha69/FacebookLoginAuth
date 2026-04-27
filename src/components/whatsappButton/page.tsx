"use client"
import { Button } from "../ui/button"
import { useState, useEffect } from "react"

export default function WhatsAppLogin() {
  const [status, setStatus] = useState<"idle" | "waiting" | "success" | "error">("idle");
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    fetch("/api/auth/whatsapp/status")
      .then(r => r.json())
      .then(data => { if (data.loggedIn) setLoggedIn(true); });
  }, []);

  const handleLogin = () => {
    const width = 600, height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      "/api/auth/whatsapp/start",
      "whatsapp-oauth",
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`
    );
    if (!popup) { alert("Please allow popups for this site."); return; }

    setStatus("waiting");
    const handler = (event: MessageEvent) => {
      if (event.data?.type !== "whatsapp-auth") return;
      window.removeEventListener("message", handler);
      event.data.success ? (setStatus("success"), setLoggedIn(true)) : setStatus("error");
    };
    window.addEventListener("message", handler);
  };

  const handleLogout = async () => {
    const res = await fetch("/api/auth/whatsapp/logout", { method: "POST" });
    if (res.ok) { setLoggedIn(false); setStatus("idle"); }
  };

  if (loggedIn) {
    return <div className="p-5"><Button variant="outline" onClick={handleLogout}>Disconnect WhatsApp</Button></div>;
  }

  return (
    <div className="p-5">
      <Button variant="outline" onClick={handleLogin} disabled={status === "waiting"}>
        {status === "waiting" ? "Waiting for login..." : "Connect WhatsApp Business"}
      </Button>
      {status === "error" && <p className="mt-2 text-sm text-red-600">Connection failed. Try again.</p>}
    </div>
  );
}