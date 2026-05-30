import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 }
      );
    }

    // Sign up using Supabase Auth, saving the name inside metadata
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });

    if (error) {
      console.error("Supabase signUp error:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    // If auto-confirm is on, we'll get a session directly.
    // If not, they will need to verify email, but we'll return user details.
    const token = data.session?.access_token || `registration-pending-confirm-${data.user?.id}`;
    const user = data.user;

    return NextResponse.json({
      token,
      user: {
        id: user?.id,
        email: user?.email,
        name: name,
      },
    });
  } catch (error: any) {
    console.error("Internal register error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
