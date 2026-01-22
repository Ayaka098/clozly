import { NextResponse } from "next/server";

export const runtime = "edge";

const allowedProtocols = new Set(["http:", "https:"]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");
  if (!imageUrl) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(imageUrl);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  if (!allowedProtocols.has(target.protocol)) {
    return NextResponse.json({ error: "Invalid protocol" }, { status: 400 });
  }

  const response = await fetch(target.toString(), { cache: "no-store" });
  if (!response.ok) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 502 });
  }

  const contentType = response.headers.get("content-type") ?? "application/octet-stream";
  const buffer = await response.arrayBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "content-type": contentType,
      "cache-control": "private, max-age=300"
    }
  });
}
