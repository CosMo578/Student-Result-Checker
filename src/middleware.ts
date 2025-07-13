import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "./app/utils/supabase/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: req });
  const supabase = await createClient();

  // Get the authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // Log for debugging
  console.log(
    `[Middleware] Path: ${req.nextUrl.pathname}, User: ${!!user}, UserError: ${userError?.message || "none"}`,
  );

  // Allow public access to /, /signup, /login, and /admin
  if (
    req.nextUrl.pathname === "/" ||
    req.nextUrl.pathname === "/signup" ||
    req.nextUrl.pathname === "/login" ||
    req.nextUrl.pathname === "/admin"
  ) {
    if (user) {
      console.log("[Middleware] Authenticated user, redirecting to /dashboard");
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    console.log("[Middleware] Allowing public access");
    return res;
  }

  // Protect all other routes with user authentication
  if (!user) {
    console.log("[Middleware] No authenticated user, redirecting to /login");
    return NextResponse.redirect(
      new URL("/login?error=unauthenticated", req.url),
    );
  }

  // Additional admin check for /admin/* routes (e.g., /admin/dashboard)
  if (req.nextUrl.pathname.startsWith("/admin/")) {
    const { data: adminData, error } = await supabase
      .from("admins")
      .select("*")
      .eq("email", user.email)
      .single();

    if (error || !adminData) {
      console.log("[Middleware] Not an admin, redirecting to /login");
      return NextResponse.redirect(new URL("/login?error=not_admin", req.url));
    }
    console.log("[Middleware] Admin access granted");
  }

  console.log("[Middleware] Access granted");
  return res;
}

export const config = {
  matcher: [
    // Match all paths except static assets and specific files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
