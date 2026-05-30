import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    // Select all organizations and perform a count aggregation on their related members table
    const { data, error } = await supabaseAdmin
      .from("organizations")
      .select("*, members:members(count)")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase GET /organizations error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Format PostgREST payload to match our page state interface
    const formattedOrgs = (data || []).map((org: any) => ({
      id: org.id,
      name: org.name,
      code: org.code,
      address: org.address,
      memberCount: org.members?.[0]?.count || 0,
      createdAt: org.created_at,
    }));

    return NextResponse.json(formattedOrgs);
  } catch (error: any) {
    console.error("Internal GET /organizations error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, code, address } = await request.json();

    if (!name || !code) {
      return NextResponse.json(
        { error: "Name and code are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("organizations")
      .insert([
        {
          name,
          code: code.toUpperCase(),
          address: address || "",
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase POST /organizations error:", error);
      // 23505 is PostgreSQL's unique key constraint violation code
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Organization code already exists" },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("Internal POST /organizations error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
