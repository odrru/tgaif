import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedNext = requestUrl.searchParams.get("next") ?? "/";
  const next = requestedNext.startsWith("/") ? requestedNext : "/";
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProtocol = request.headers.get("x-forwarded-proto") ?? "https";
  const origin =
    process.env.NODE_ENV === "development" || !forwardedHost
      ? requestUrl.origin
      : `${forwardedProtocol}://${forwardedHost}`;

  if (!code) {
    return NextResponse.redirect(
      `${origin}/?auth_error=${encodeURIComponent("Google did not return a sign-in code.")}`
    );
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) return NextResponse.redirect(`${origin}${next}`);

    return NextResponse.redirect(
      `${origin}/?auth_error=${encodeURIComponent(error.message)}`
    );
  } catch {
    return NextResponse.redirect(
      `${origin}/?auth_error=${encodeURIComponent("The sign-in service is not configured yet.")}`
    );
  }
}
