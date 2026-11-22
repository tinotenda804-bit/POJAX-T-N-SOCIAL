
"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

type PublicProfile = {
  user_id: string;
  display_name: string;
  bio: string | null;
  is_private: boolean;
  allow_follow_requests: boolean;
};

type MemberPost = {
  id: string;
  content: string;
  media_path: string | null;
  media_type: string | null;
  created_at: string;
};

type Reaction = {
  post_id: string;
  user_id: string;
  reaction_type: string;
};

type Comment = {
  post_id: string;
};

type ReactionPerson = {
  user_id: string;
  display_name: string;
  reaction_type: string;
};

type ReactionCounts = {
  like: number;
  love: number;
  haha: number;
  wow: number;
  sad: number;
  angry: number;
};

type FollowRecord = {
  id: string;
  follower_id: string;
  followed_id: string;
  status: "pending" | "accepted" | "rejected";
};

type MemberBadge = {
  milestone: number;
  badge_type: "star" | "diamond";
  earned_at: string;
};

const emptyReactionCounts: ReactionCounts = {
  like: 0,
  love: 0,
  haha: 0,
  wow: 0,
  sad: 0,
  angry: 0,
};

const reactionEmojis: Record<string, string> = {
  like: "👍",
  love: "❤️",
  haha: "😂",
  wow: "😮",
  sad: "😢",
  angry: "😡",
};

const badgeStyles: Record<number, string> = {
  1000: "border-yellow-400 bg-yellow-400/10 text-yellow-300",
  2000: "border-orange-400 bg-orange-400/10 text-orange-300",
  3000: "border-green-400 bg-green-400/10 text-green-300",
  4000: "border-blue-400 bg-blue-400/10 text-blue-300",
  5000: "border-purple-400 bg-purple-400/10 text-purple-300",
  6000: "border-pink-400 bg-pink-400/10 text-pink-300",
  7000: "border-red-400 bg-red-400/10 text-red-300",
  8000: "border-cyan-400 bg-cyan-400/10 text-cyan-300",
  9000: "border-indigo-400 bg-indigo-400/10 text-indigo-300",
  10000: "border-fuchsia-400 bg-fuchsia-400/10 text-fuchsia-300",
};

function MemberProfileContent() {
  const params = useParams();
  const id = params.id as string;

  const supabase = useMemo(() => createClient(), []);

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [badges, setBadges] = useState<MemberBadge[]>([]);

  const [posts, setPosts] = useState<MemberPost[]>([]);
  const [mediaUrls, setMediaUrls] = useState<Record<string, string>>({});
  const [reactionCounts, setReactionCounts] = useState<Record<string, ReactionCounts>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});
  const [reactionPeople, setReactionPeople] = useState<Record<string, ReactionPerson[]>>({});
  const [expandedPosts, setExpandedPosts] = useState<Record<string, boolean>>({});
  const [userId, setUserId] = useState("");

  const [followRecord, setFollowRecord] = useState<FollowRecord | null>(null);
  const [followLoading, setFollowLoading] = useState(false);
  const [followMessage, setFollowMessage] = useState("");

  const [isBlocked, setIsBlocked] = useState(false);
  const [blockLoading, setBlockLoading] = useState(false);
  const [blockMessage, setBlockMessage] = useState("");

  const [blockedByOther, setBlockedByOther] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFollowStatus = useCallback(
    async (currentUserId: string) => {
      if (!currentUserId || currentUserId === id) {
        setFollowRecord(null);
        return;
      }

      const { data, error } = await supabase
        .from("member_follows")
        .select("id, follower_id, followed_id, status")
        .eq("follower_id", currentUserId)
        .eq("followed_id", id)
        .maybeSingle();

      if (error) {
        console.error("Follow status loading error:", error);
        return;
      }

      setFollowRecord(data as FollowRecord | null);
    },
    [id, supabase]
  );

  const loadMemberProfile = useCallback(async () => {
    setLoading(true);
    setError("");
    setFollowerCount(0);
    setBadges([]);
    setMediaUrls({});
    setPosts([]);
    setReactionCounts({});
    setCommentCounts({});
    setReactionPeople({});
    setExpandedPosts({});

    const { data: authData } = await supabase.auth.getUser();
    const currentUserId = authData.user?.id || "";
    setUserId(currentUserId);

    if (!currentUserId) {
      setError("Please log in to view member profiles.");
      setLoading(false);
      return;
    }

    if (currentUserId === id) {
      setIsBlocked(false);
      setBlockedByOther(false);
    } else {
      const { data: theirBlock, error: theirBlockError } = await supabase
        .from("member_blocks")
        .select("id")
        .eq("blocker_id", id)
        .eq("blocked_id", currentUserId)
        .maybeSingle();

      if (theirBlockError) {
        console.error("Block status error:", theirBlockError);
      }

      if (theirBlock) {
        setBlockedByOther(true);
        setError("This member has blocked you. Their profile is unavailable.");
        setLoading(false);
        return;
      }

      setBlockedByOther(false);

      const { data: myBlock, error: myBlockError } = await supabase
        .from("member_blocks")
        .select("id")
        .eq("blocker_id", currentUserId)
        .eq("blocked_id", id)
        .maybeSingle();

      if (myBlockError) {
        console.error("Your block status error:", myBlockError);
      }

      if (myBlock) {
        setIsBlocked(true);
        setError("You have blocked this member.");
        setLoading(false);
        return;
      }

      setIsBlocked(false);
    }

    const { data: profileData, error: profileError } = await supabase
      .from("member_public_profiles")
      .select("user_id, display_name, bio, is_private, allow_follow_requests")
      .eq("user_id", id)
      .maybeSingle();

    if (profileError) {
      console.error("Public profile loading error:", profileError);
      setError(`Unable to load profile: ${profileError.message}`);
      setLoading(false);
      return;
    }

    if (!profileData) {
      setError("This member profile could not be found or is not available to you.");
      setLoading(false);
      return;
    }

    setProfile(profileData as PublicProfile);

    const { data: countData, error: countError } = await supabase.rpc(
      "get_member_follower_count",
      {
        target_user_id: id,
      }
    );

    if (countError) {
      console.error("Follower count loading error:", countError);
      setFollowerCount(0);
    } else {
      setFollowerCount(Number(countData ?? 0));
    }

    // Load badges visible under the member_badge_milestones RLS policy.
    const { data: badgeData, error: badgeError } = await supabase
      .from("member_badge_milestones")
      .select("milestone, badge_type, earned_at")
      .eq("user_id", id)
      .order("milestone", { ascending: true });

    if (badgeError) {
      console.error("Member badges loading error:", badgeError);
      setBadges([]);
    } else {
      setBadges((badgeData || []) as MemberBadge[]);
    }

    if (currentUserId !== id) {
      await loadFollowStatus(currentUserId);
    } else {
      setFollowRecord(null);
    }

    const { data: postsData, error: postsError } = await supabase
      .from("posts")
      .select("id, content, media_path, media_type, created_at")
      .eq("user_id", id)
      .order("created_at", { ascending: false });

    if (postsError) {
      console.error("Member posts loading error:", postsError);
      setError(`Profile loaded, but posts could not load: ${postsError.message}`);
      setLoading(false);
      return;
    }

    const memberPosts = (postsData || []) as MemberPost[];
    setPosts(memberPosts);

    if (memberPosts.length === 0) {
      setMediaUrls({});
      setLoading(false);
      return;
    }

    // Generate temporary signed URLs for private post media.
    const urlEntries = await Promise.all(
      memberPosts.map(async (post) => {
        if (!post.media_path) {
          return [post.id, ""] as const;
        }

        const { data: signedData, error: signedError } =
          await supabase.storage
            .from("post-media")
            .createSignedUrl(post.media_path, 3600);

        if (signedError || !signedData) {
          console.error("Member media URL error:", {
            postId: post.id,
            error: signedError,
          });

          return [post.id, ""] as const;
        }

        return [post.id, signedData.signedUrl] as const;
      })
    );

    setMediaUrls(Object.fromEntries(urlEntries));

    const postIds = memberPosts.map((post) => post.id);

    const [reactionsResult, commentsResult] = await Promise.all([
      supabase
        .from("post_reactions")
        .select("post_id, user_id, reaction_type")
        .in("post_id", postIds),

      supabase
        .from("post_comments")
        .select("post_id")
        .in("post_id", postIds),
    ]);

    if (reactionsResult.error) {
      console.error("Reaction loading error:", reactionsResult.error);
    }

    if (commentsResult.error) {
      console.error("Comment loading error:", commentsResult.error);
    }

    const reactions = (reactionsResult.data || []) as Reaction[];
    const comments = (commentsResult.data || []) as Comment[];

    const newReactionCounts: Record<string, ReactionCounts> = {};
    const newCommentCounts: Record<string, number> = {};

    postIds.forEach((postId) => {
      newReactionCounts[postId] = { ...emptyReactionCounts };
      newCommentCounts[postId] = 0;
    });

    reactions.forEach((reaction) => {
      const counts = newReactionCounts[reaction.post_id];

      if (
        counts &&
        Object.prototype.hasOwnProperty.call(counts, reaction.reaction_type)
      ) {
        counts[reaction.reaction_type as keyof ReactionCounts]++;
      }
    });

    comments.forEach((comment) => {
      if (newCommentCounts[comment.post_id] !== undefined) {
        newCommentCounts[comment.post_id]++;
      }
    });

    setReactionCounts(newReactionCounts);
    setCommentCounts(newCommentCounts);

    const userIds = [...new Set(reactions.map((item) => item.user_id))];
    const peopleByPost: Record<string, ReactionPerson[]> = {};

    postIds.forEach((postId) => {
      peopleByPost[postId] = [];
    });

    if (userIds.length > 0) {
      const { data: publicProfiles, error: peopleError } = await supabase
        .from("member_public_profiles")
        .select("user_id, display_name")
        .in("user_id", userIds);

      if (peopleError) {
        console.error("Reaction member names loading error:", peopleError);
        setError("Counts loaded, but some reaction names could not be loaded.");
      } else {
        const namesByUser: Record<string, string> = {};

        (publicProfiles || []).forEach((person) => {
          namesByUser[person.user_id] = person.display_name || "PojaX Member";
        });

        reactions.forEach((reaction) => {
          peopleByPost[reaction.post_id]?.push({
            user_id: reaction.user_id,
            display_name: namesByUser[reaction.user_id] || "PojaX Member",
            reaction_type: reaction.reaction_type,
          });
        });
      }
    }

    setReactionPeople(peopleByPost);

    if (reactionsResult.error || commentsResult.error) {
      setError("Some post engagement information could not be loaded.");
    }

    setLoading(false);
  }, [id, supabase, loadFollowStatus]);

  useEffect(() => {
    if (id) {
      loadMemberProfile();
    }
  }, [id, loadMemberProfile]);

  async function handleFollow() {
    if (!userId || !profile || followLoading || isBlocked) return;
    if (userId === id) return;

    if (!profile.allow_follow_requests) {
      setFollowMessage("This member is not accepting new followers.");
      return;
    }

    setFollowLoading(true);
    setFollowMessage("");

    if (followRecord?.status === "pending" || followRecord?.status === "accepted") {
      const { error } = await supabase
        .from("member_follows")
        .delete()
        .eq("id", followRecord.id);

      if (error) {
        setFollowMessage(error.message);
      } else {
        setFollowRecord(null);
        setFollowMessage(
          followRecord.status === "pending"
            ? "Your follow request has been cancelled."
            : "You have unfollowed this member."
        );
      }

      setFollowLoading(false);
      return;
    }

    if (followRecord?.status === "rejected") {
      const { error: deleteError } = await supabase
        .from("member_follows")
        .delete()
        .eq("id", followRecord.id);

      if (deleteError) {
        setFollowMessage(deleteError.message);
        setFollowLoading(false);
        return;
      }
    }

    const requestedStatus = profile.is_private ? "pending" : "accepted";

    const { data, error } = await supabase
      .from("member_follows")
      .insert({
        follower_id: userId,
        followed_id: id,
        status: requestedStatus,
      })
      .select("id, follower_id, followed_id, status")
      .single();

    if (error) {
      setFollowMessage(error.message);
    } else {
      setFollowRecord(data as FollowRecord);
      setFollowMessage(
        requestedStatus === "pending"
          ? "Follow request sent. Waiting for approval."
          : "You are now following this member!"
      );
    }

    setFollowLoading(false);
  }

  async function handleBlockToggle() {
    if (!userId || userId === id || blockLoading) return;

    setBlockLoading(true);
    setBlockMessage("");

    if (!isBlocked) {
      const confirmed = window.confirm(
        "Are you sure you want to block this member? You will no longer be able to interact normally."
      );

      if (!confirmed) {
        setBlockLoading(false);
        return;
      }

      const { error } = await supabase.from("member_blocks").insert({
        blocker_id: userId,
        blocked_id: id,
      });

      if (error) {
        setBlockMessage(error.message);
      } else {
        setIsBlocked(true);
        setFollowRecord(null);
        setFollowMessage("");
        setBlockMessage("Member blocked successfully.");
      }
    } else {
      const confirmed = window.confirm(
        "Are you sure you want to unblock this member?"
      );

      if (!confirmed) {
        setBlockLoading(false);
        return;
      }

      const { error } = await supabase
        .from("member_blocks")
        .delete()
        .eq("blocker_id", userId)
        .eq("blocked_id", id);

      if (error) {
        setBlockMessage(error.message);
      } else {
        setIsBlocked(false);
        setBlockMessage("Member unblocked successfully.");
        await loadMemberProfile();
      }
    }

    setBlockLoading(false);
  }

  function toggleReactionPeople(postId: string) {
    setExpandedPosts((previous) => ({
      ...previous,
      [postId]: !previous[postId],
    }));
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#050b18] text-white flex items-center justify-center">
        Loading member profile...
      </main>
    );
  }

  if (blockedByOther) {
    return (
      <main className="min-h-screen bg-[#050b18] text-white p-6">
        <div className="max-w-3xl mx-auto">
          <a href="/social" className="text-cyan-400">
            ← Back to POJAX SOCIAL
          </a>
          <p className="mt-6 text-red-400">{error}</p>
        </div>
      </main>
    );
  }

  if (isBlocked && !profile) {
    return (
      <main className="min-h-screen bg-[#050b18] text-white p-6">
        <div className="max-w-3xl mx-auto">
          <a href="/social" className="text-cyan-400">
            ← Back to POJAX SOCIAL
          </a>

          <section className="mt-6 rounded-2xl border border-red-900 bg-[#0b1528] p-6">
            <h1 className="text-xl font-bold text-red-400">
              Member blocked
            </h1>
            <p className="text-gray-300 mt-3">
              You have blocked this member. Their profile and posts are hidden.
            </p>

            <button
              type="button"
              onClick={handleBlockToggle}
              disabled={blockLoading}
              className="mt-5 rounded-lg bg-cyan-500 px-5 py-2 font-semibold text-black hover:bg-cyan-400 disabled:opacity-50"
            >
              {blockLoading ? "Please wait..." : "Unblock Member"}
            </button>

            {blockMessage && (
              <p className="mt-3 text-sm text-cyan-300">{blockMessage}</p>
            )}
          </section>
        </div>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-[#050b18] text-white p-6">
        <div className="max-w-3xl mx-auto">
          <a href="/social" className="text-cyan-400">
            ← Back to POJAX SOCIAL
          </a>
          <p className="mt-6 text-red-400">{error}</p>
        </div>
      </main>
    );
  }

  const isOwnProfile = userId === id;

  const followButtonLabel = followLoading
    ? "Please wait..."
    : followRecord?.status === "accepted"
    ? "Following"
    : followRecord?.status === "pending"
    ? "Requested · Cancel"
    : profile.is_private
    ? "Request to Follow"
    : "Follow";

  return (
    <main className="min-h-screen bg-[#050b18] text-white px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <a href="/social" className="text-cyan-400 hover:text-cyan-300">
          ← Back to POJAX SOCIAL
        </a>

        <section className="mt-6 rounded-2xl border border-cyan-900 bg-[#0b1528] p-6">
          <div className="w-20 h-20 rounded-full bg-cyan-900 flex items-center justify-center text-3xl font-bold text-cyan-300">
            {profile.display_name.charAt(0).toUpperCase()}
          </div>

          <h1 className="text-2xl font-bold mt-4">{profile.display_name}</h1>

          <p className="text-cyan-300 text-sm font-semibold mt-2">
            {followerCount.toLocaleString()} followers
          </p>

          {/* Member milestone badges */}
          {badges.length > 0 && (
            <div className="mt-4">
              <h2 className="text-sm font-semibold text-gray-300 mb-2">
                Achievement Badges
              </h2>

              <div className="flex flex-wrap gap-2">
                {badges.map((badge) => (
                  <div
                    key={badge.milestone}
                    title={`${badge.milestone.toLocaleString()} followers milestone`}
                    className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-bold ${
                      badge.badge_type === "diamond"
                        ? badgeStyles[10000]
                        : badgeStyles[badge.milestone] ||
                          "border-gray-500 bg-gray-500/10 text-gray-300"
                    }`}
                  >
                    <span className="text-lg">
                      {badge.badge_type === "diamond" ? "💎" : "⭐"}
                    </span>
                    <span>{badge.milestone / 1000}K</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-gray-300 mt-3 whitespace-pre-wrap">
            {profile.bio || "This member hasn't added a bio yet."}
          </p>

          <p className="text-gray-500 text-sm mt-4">
            POJAX SOCIAL MEMBER · {profile.is_private ? "PRIVATE ACCOUNT" : "PUBLIC ACCOUNT"}
          </p>

          {!isOwnProfile && userId && (
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={
                  followLoading ||
                  isBlocked ||
                  (!profile.allow_follow_requests && !followRecord)
                }
                onClick={handleFollow}
                className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-semibold px-6 py-2 rounded-lg"
              >
                {followButtonLabel}
              </button>

              <button
                type="button"
                onClick={handleBlockToggle}
                disabled={blockLoading}
                className="rounded-lg border border-red-700 px-5 py-2 text-red-400 hover:bg-red-950 disabled:opacity-50"
              >
                {blockLoading
                  ? "Please wait..."
                  : isBlocked
                  ? "Unblock Member"
                  : "Block Member"}
              </button>
            </div>
          )}

          {followMessage && (
            <p className="text-sm text-cyan-300 mt-3">{followMessage}</p>
          )}

          {blockMessage && (
            <p className="text-sm text-cyan-300 mt-3">{blockMessage}</p>
          )}

          {!profile.allow_follow_requests && !followRecord && (
            <p className="text-sm text-gray-400 mt-2">
              This member is not accepting follow requests.
            </p>
          )}
        </section>

        <section className="mt-8">
          <h2 className="text-xl font-bold text-cyan-300 mb-4">
            Member's Posts
          </h2>

          {error && <p className="text-yellow-400 mb-4">{error}</p>}

          {posts.length === 0 && (
            <p className="text-gray-400">
              This member hasn't published any posts yet.
            </p>
          )}

          <div className="space-y-5">
            {posts.map((post) => {
              const counts = reactionCounts[post.id] || emptyReactionCounts;
              const totalReactions = Object.values(counts).reduce(
                (total, count) => total + count,
                0
              );

              const totalComments = commentCounts[post.id] || 0;
              const people = reactionPeople[post.id] || [];
              const mediaUrl = mediaUrls[post.id];

              return (
                <article
                  key={post.id}
                  className="rounded-xl border border-gray-800 bg-[#0b1528] p-5"
                >
                  <p className="text-gray-200 whitespace-pre-wrap">
                    {post.content}
                  </p>

                  {post.media_path && (
                    <div className="mt-4">
                      {mediaUrl ? (
                        post.media_type?.startsWith("image/") ? (
                          <img
                            src={mediaUrl}
                            alt="Member's post"
                            className="w-full max-h-[450px] object-contain rounded-lg"
                          />
                        ) : post.media_type?.startsWith("video/") ? (
                          <video
                            src={mediaUrl}
                            controls
                            className="w-full max-h-[450px] rounded-lg"
                          />
                        ) : null
                      ) : (
                        <p className="text-sm text-gray-400">
                          Media is currently unavailable.
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-4 pt-3 border-t border-gray-800">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-[#101f35] px-3 py-2">
                        <p className="text-gray-400 text-xs">Total reactions</p>
                        <p className="text-lg font-bold text-cyan-300 mt-0.5">
                          {totalReactions}
                        </p>
                        <button
                          type="button"
                          onClick={() => toggleReactionPeople(post.id)}
                          className="text-cyan-400 text-xs mt-1 hover:text-cyan-200"
                        >
                          {expandedPosts[post.id]
                            ? "Hide people ↑"
                            : "People reacted ↓"}
                        </button>
                      </div>

                      <div className="rounded-lg bg-[#101f35] px-3 py-2">
                        <p className="text-gray-400 text-xs">Total comments</p>
                        <p className="text-lg font-bold text-cyan-300 mt-0.5">
                          {totalComments}
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          Including replies
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-300">
                      <span>👍 {counts.like}</span>
                      <span>❤️ {counts.love}</span>
                      <span>😂 {counts.haha}</span>
                      <span>😮 {counts.wow}</span>
                      <span>😢 {counts.sad}</span>
                      <span>😡 {counts.angry}</span>
                    </div>

                    {expandedPosts[post.id] && (
                      <div className="mt-3 rounded-lg bg-[#101f35] p-3">
                        <h3 className="text-cyan-300 font-semibold mb-3">
                          People who reacted
                        </h3>

                        {people.length === 0 ? (
                          <p className="text-gray-400 text-sm">
                            Nobody has reacted to this post yet.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {people.map((person, index) => (
                              <div
                                key={`${person.user_id}-${post.id}-${index}`}
                                className="flex items-center justify-between gap-3"
                              >
                                <span className="text-gray-200">
                                  {person.display_name}
                                </span>
                                <span className="text-xl">
                                  {reactionEmojis[person.reaction_type] || "👍"}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="text-gray-500 text-xs mt-4">
                    {new Date(post.created_at).toLocaleString()}
                  </p>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

export default function MemberProfilePage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#050b18] text-white flex items-center justify-center">
          Loading member profile...
        </main>
      }
    >
      <MemberProfileContent />
    </Suspense>
  );
}
