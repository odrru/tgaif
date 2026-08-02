import { createClient } from "@supabase/supabase-js";

const noStoreHeaders = { "Cache-Control": "no-store" };

function json(body: object, status = 200) {
  return Response.json(body, { status, headers: noStoreHeaders });
}

export async function DELETE(request: Request) {
  const authorization = request.headers.get("authorization");
  const accessToken = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : null;

  if (!accessToken || accessToken.length > 8192) {
    return json({ error: "Authentication is required." }, 401);
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    return json({ error: "Account deletion is not configured." }, 503);
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(accessToken);

  if (userError || !user) {
    return json({ error: "Your session is not valid." }, 401);
  }

  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);

  if (deleteError) {
    return json({ error: "The account was not deleted." }, 500);
  }

  return json({ deleted: true });
}
