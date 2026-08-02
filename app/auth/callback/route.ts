import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function safeRelativePath(value: string) {
  try {
    const base = new URL("https://app.invalid");
    const parsed = new URL(value, base);
    if (parsed.origin !== base.origin || !value.startsWith("/") || value.startsWith("//")) {
      return "/";
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return "/";
  }
}

function redirect(location: string) {
  return new NextResponse(null, {
    status: 303,
    headers: {
      "Cache-Control": "no-store",
      Location: location,
    },
  });
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeRelativePath(requestUrl.searchParams.get("next") ?? "/");

  if (!code) {
    return redirect("/?auth_error=missing_code");
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) return redirect(next);

    return redirect("/?auth_error=exchange_failed");
  } catch {
    return redirect("/?auth_error=not_configured");
  }
}
