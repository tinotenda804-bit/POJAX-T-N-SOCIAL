
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Verify the logged-in user.
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Please log in first." },
        { status: 401 }
      );
    }

    // Get the user's accepted follower count.
    const { data: followerCount, error: countError } =
      await supabase.rpc("get_member_follower_count", {
        target_user_id: user.id,
      });

    if (countError) {
      console.error("Follower count error:", countError);
      return NextResponse.json(
        { error: "Could not retrieve follower count." },
        { status: 500 }
      );
    }

    // Retrieve the user's earned milestones.
    const { data: milestones, error: milestoneError } = await supabase
      .from("member_badge_milestones")
      .select("milestone, badge_type, earned_at")
      .eq("user_id", user.id)
      .order("milestone", { ascending: true });

    if (milestoneError) {
      console.error("Milestone error:", milestoneError);
      return NextResponse.json(
        { error: "Could not retrieve milestones." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      followerCount: Number(followerCount ?? 0),
      milestones: milestones ?? [],
    });
  } catch (error) {
    console.error("Milestones API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
