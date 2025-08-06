import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt"; 

const SECRET = process.env.NEXTAUTH_SECRET;

function logRequest(req: NextRequest) {
  console.log("Request received:", req.nextUrl.pathname);
}

export default async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith("/api/protected")) {
    // ✅ Use getToken to verify the session

    const decodedToken = await getToken({ req, secret: SECRET });
    if (!decodedToken) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // console.log("Authenticated User:", decodedToken);
    // logRequest(req);
    return NextResponse.next();
  }

  return NextResponse.json({ message: "Hello from middleware" });
}

export const config = {
  matcher: "/api/protected/:path*",
};
