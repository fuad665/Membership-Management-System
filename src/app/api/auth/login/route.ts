import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Authenticate with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Supabase signIn error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    // Access JWT session token
    const token = data.session?.access_token;
    const user = data.user;

    return NextResponse.json({
      token,
      user: {
        id: user?.id,
        email: user?.email,
        name: user?.user_metadata?.name || "Admin User",
      },
    });
  } catch (error: any) {
    console.error("Internal login error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
