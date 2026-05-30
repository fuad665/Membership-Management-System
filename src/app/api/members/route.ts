import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("organizationId");

    let query = supabaseAdmin
      .from("members")
      .select("*, organizations(name)")
      .order("created_at", { ascending: false });

    if (orgId) {
      query = query.eq("organization_id", orgId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Format PostgREST payload to match our page state interface
    const formattedMembers = (data || []).map((m: any) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      phone: m.phone,
      role: m.role,
      organizationId: m.organization_id,
      organizationName: m.organizations?.name || "Unknown",
      status: m.status,
      avatar: m.avatar,
      createdAt: m.created_at,
    }));

    return NextResponse.json(formattedMembers);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, email, phone, role, organizationId, status, avatar } = await request.json();

    if (!name || !email || !organizationId || !role) {
      return NextResponse.json(
        { error: "Name, email, role, and organization are required" },
        { status: 400 }
      );
    }

    // Default avatars if none provided
    const defaultAvatars = [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    ];
    const chosenAvatar = avatar || defaultAvatars[Math.floor(Math.random() * defaultAvatars.length)];

    const { data, error } = await supabaseAdmin
      .from("members")
      .insert([
        {
          name,
          email,
          phone: phone || "",
          role,
          organization_id: organizationId,
          status: status || "active",
          avatar: chosenAvatar,
        },
      ])
      .select()
      .single();

    if (error) {
      // 23505 is PostgreSQL's unique key constraint violation code
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "A member with this email already exists" },
          { status: 400 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
