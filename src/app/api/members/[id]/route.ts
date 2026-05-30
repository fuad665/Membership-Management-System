import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Fetch member details and perform an inner join on the organizations table
    const { data, error } = await supabaseAdmin
      .from("members")
      .select("*, organizations(name)")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    // Format fields to match frontend schema
    const formattedMember = {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      organizationId: data.organization_id,
      organizationName: data.organizations?.name || "Unknown",
      status: data.status,
      avatar: data.avatar,
      createdAt: data.created_at,
    };

    return NextResponse.json(formattedMember);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const data = await request.json();

    // Perform update in the members table and query the updated record with organization metadata
    const { data: updatedData, error } = await supabaseAdmin
      .from("members")
      .update({
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        organization_id: data.organizationId,
        status: data.status,
        avatar: data.avatar,
      })
      .eq("id", id)
      .select("*, organizations(name)")
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

    const formattedMember = {
      id: updatedData.id,
      name: updatedData.name,
      email: updatedData.email,
      phone: updatedData.phone,
      role: updatedData.role,
      organizationId: updatedData.organization_id,
      organizationName: updatedData.organizations?.name || "Unknown",
      status: updatedData.status,
      avatar: updatedData.avatar,
      createdAt: updatedData.created_at,
    };

    return NextResponse.json(formattedMember);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const { error } = await supabaseAdmin
      .from("members")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Member deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
