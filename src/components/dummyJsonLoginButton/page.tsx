"use client";

import { useState } from "react";
import { Button } from "../ui/button";

type DemoResponse = {
  success: boolean;
  trace?: {
    request: {
      url: string;
      method: string;
      headers: Record<string, string>;
    };
    response?: {
      status: number;
      ok: boolean;
    };
  };
  output?: {
    accessToken: string;
    refreshToken: string;
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    gender: string;
    image: string;
  };
  error?: string;
};

export default function DummyJsonLoginButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DemoResponse | null>(null);

  const handleDummyLogin = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/auth/dummyjson/demo", {
        method: "GET",
        cache: "no-store",
      });
      const data = (await response.json()) as DemoResponse;
      setResult(data);
    } catch {
      setResult({ success: false, error: "Request failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5">
      <Button variant="outline" onClick={handleDummyLogin} disabled={loading}>
        {loading ? "Logging in with DummyJSON..." : "Login using DummyJSON"}
      </Button>

      {result?.error && (
        <p className="mt-2 text-sm text-red-600">{result.error}</p>
      )}

      {result?.success && (
        <pre className="mt-3 max-h-80 overflow-auto rounded-md border p-3 text-xs">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}