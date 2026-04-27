import { NextResponse } from "next/server";
import { loginWithDummyJson } from "@/lib/dummyjson-interceptor";

export async function GET() {
  try {
    const result = await loginWithDummyJson();

    return NextResponse.json({
      success: true,
      trace: result.trace,
      output: {
        ...result.data,
        accessToken: `${result.data.accessToken.slice(0, 20)}...`,
        refreshToken: `${result.data.refreshToken.slice(0, 20)}...`,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
