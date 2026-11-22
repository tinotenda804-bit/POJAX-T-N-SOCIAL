"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

type Post = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  media_path: string | null;
  media_type: string | null;
  media_bucket: "post-media" | "private-post-media";
};

type ReactionType = "like" | "love" | "haha" | "wow" | "sad" | "angry";

type ReactionRow = {
  post_id: string;
  user_id: string;
  reaction_type: ReactionType;
};

type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
};

type PublicMember = {
  user_id: string;
  display_name: string;
};

const REACTIONS = [
  { type: "like", emoji: "👍", label: "Like" },
  { type: "love", emoji: "❤️", label: "Love" },
  { type: "haha", emoji: "😂", label: "Haha" },
  { type: "wow", emoji: "😮", label: "Wow" },
  { type: "sad", emoji: "😢", label: "Sad" },
  { type: "angry", emoji: "😡", label: "Angry" },
] as const;

const REPORT_REASONS = [
  { value: "spam", label: "Spam or misleading content" },
  { value: "harassment", label: "Harassment or bullying" },
  { value: "hate_or_abuse", label: "Hate speech or abuse" },
  { value: "false_information", label: "False information" },
  { value: "inappropriate_content", label: "Inappropriate content" },
  { value: "other", label: "Something else" },
];

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
];

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export default function SocialPage() {
  const router = useRouter();
  const supabase = createClient();

  const [posts, setPosts] = useState<Post[]>([]);
  const [reactions, setReactions] = useState<ReactionRow[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [members, setMembers] = useState<Record<string, string>>({});
  const [mediaUrls, setMediaUrls] = useState<Record<string, string>>({});
  const [userId, setUserId] = useState("");

  const [content, setContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyInputs, setReplyInputs] = useState<Record<string, string>>({});

  const [expandedReactions, setExpandedReactions] = useState<
    Record<string, boolean>
  >({});

  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [savedPostIds, setSavedPostIds] = useState<string[]>([]);
  const [hiddenPostIds, setHiddenPostIds] = useState<string[]>([]);
  const [reportingPost, setReportingPost] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("spam");
  const [reportDetails, setReportDetails] = useState("");

  const [loading, setLoading] = useState(true);
  const [, setClock] = useState(0);
  const [publishing, setPublishing] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [reactingTo, setReactingTo] = useState<string | null>(null);
  const [submittingReport, setSubmittingReport] = useState(false);
  const [sharingPost, setSharingPost] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  function memberName(id: string) {
    if (id === userId) return "You";
    return members[id] || "PojaX Member";
  }

  function memberLink(id: string) {
    return `/member/${encodeURIComponent(id)}`;
  }

  function formatPostTime(dateString: string) {
    const postedAt = new Date(dateString);
    const difference = Math.max(0, Date.now() - postedAt.getTime());

    if (difference < 60 * 60 * 1000) {
      const minutes = Math.max(1, Math.ceil(difference / 60000));
      return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    }

    if (difference < 24 * 60 * 60 * 1000) {
      const hours = Math.ceil(difference / 3600000);
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    }

    if (difference < 7 * 24 * 60 * 60 * 1000) {
      const days = Math.ceil(difference / 86400000);
      return `${days} ${days === 1 ? "day" : "days"} ago`;
    }

    return postedAt.toLocaleString();
  }

  async function loadSavedPosts(memberId: string) {
    const { data, error } = await supabase
      .from("saved_posts")
      .select("post_id")
      .eq("user_id", memberId);

    if (error) {
      console.error("Saved posts loading error:", error);
      return;
    }

    setSavedPostIds((data ?? []).map((item) => item.post_id));
  }

  async function loadPosts() {
    const { data, error } = await supabase
      .from("posts")
      .select(
        "id, user_id, content, created_at, media_path, media_type, media_bucket"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Posts loading error:", error);
      setMessage("Could not load posts. Please try again.");
      return;
    }

    const loadedPosts = (data ?? []) as Post[];
    setPosts(loadedPosts);

    if (loadedPosts.length === 0) {
      setReactions([]);
      setComments([]);
      setMembers({});
      setMediaUrls({});
      return;
    }

    // Generate temporary signed URLs for both media buckets.
    // Storage RLS determines whether the signed URL can be created.
    const urlEntries = await Promise.all(
      loadedPosts.map(async (post) => {
        if (!post.media_path) {
          return [post.id, ""] as const;
        }

        const { data: signedData, error: signedError } =
          await supabase.storage
            .from(post.media_bucket)
            .createSignedUrl(post.media_path, 3600);

        if (signedError || !signedData) {
          console.error("Media URL error:", {
            postId: post.id,
            bucket: post.media_bucket,
            error: signedError,
          });

          return [post.id, ""] as const;
        }

        return [post.id, signedData.signedUrl] as const;
      })
    );

    setMediaUrls(Object.fromEntries(urlEntries));

    const postIds = loadedPosts.map((post) => post.id);

    const [reactionResult, commentResult] = await Promise.all([
      supabase
        .from("post_reactions")
        .select("post_id, user_id, reaction_type")
        .in("post_id", postIds),

      supabase
        .from("post_comments")
        .select("id, post_id, user_id, parent_id, content, created_at")
        .in("post_id", postIds)
        .order("created_at", { ascending: true }),
    ]);

    if (reactionResult.error || commentResult.error) {
      console.error("Interaction loading error:", {
        reactions: reactionResult.error,
        comments: commentResult.error,
      });
      setMessage("Posts loaded, but some interactions could not be loaded.");
      return;
    }

    const loadedReactions = (reactionResult.data ?? []) as ReactionRow[];
    const loadedComments = (commentResult.data ?? []) as Comment[];

    setReactions(loadedReactions);
    setComments(loadedComments);

    const userIds = [
      ...new Set([
        ...loadedPosts.map((post) => post.user_id),
        ...loadedReactions.map((reaction) => reaction.user_id),
        ...loadedComments.map((comment) => comment.user_id),
      ]),
    ];

    if (userIds.length === 0) {
      setMembers({});
      return;
    }

    const { data: publicProfiles, error: profilesError } = await supabase
      .from("member_public_profiles")
      .select("user_id, display_name")
      .in("user_id", userIds);

    if (profilesError) {
      console.error("Public member names loading error:", profilesError);
      setMessage("Posts loaded, but some member names could not be loaded.");
      return;
    }

    const names: Record<string, string> = {};

    ((publicProfiles ?? []) as PublicMember[]).forEach((member) => {
      names[member.user_id] = member.display_name || "PojaX Member";
    });

    setMembers(names);
  }

  // Refresh relative post times so they stay current while the page is open.
  useEffect(() => {
    const timer = window.setInterval(() => {
      setClock((previous) => previous + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let active = true;

    async function initialize() {
      const { data, error } = await supabase.auth.getUser();

      if (!active) return;

      if (error || !data.user) {
        router.replace("/login");
        return;
      }

      setUserId(data.user.id);

      await Promise.all([
        loadSavedPosts(data.user.id),
        loadPosts(),
      ]);

      if (active) {
        setLoading(false);
      }
    }

    initialize();

    return () => {
      active = false;
    };
  }, [router]);

  async function publishPost() {
    if (publishing) return;

    setMessage("");
    const trimmedContent = content.trim();

    if (!trimmedContent && !selectedFile) {
      setMessage("Write something or choose a photo/video.");
      return;
    }

    if (trimmedContent.length > 5000) {
      setMessage("Your caption cannot exceed 5,000 characters.");
      return;
    }

    if (selectedFile) {
      if (!ALLOWED_TYPES.includes(selectedFile.type)) {
        setMessage("Choose a supported photo or video format.");
        return;
      }

      if (selectedFile.size > MAX_FILE_SIZE) {
        setMessage("Your file must be 50 MB or smaller.");
        return;
      }
    }

    setPublishing(true);
    let uploadedPath: string | null = null;
    let uploadBucket: "post-media" | "private-post-media" = "post-media";

    try {
      const { data: profile, error: profileError } = await supabase
        .from("member_public_profiles")
        .select("is_private")
        .eq("user_id", userId)
        .single();

      if (profileError) {
        console.error("Account privacy lookup error:", profileError);
        setMessage("Could not check your account privacy. Please try again.");
        return;
      }

      uploadBucket = profile.is_private
        ? "private-post-media"
        : "post-media";

      if (selectedFile) {
        const extension =
          selectedFile.name.split(".").pop()?.toLowerCase() || "file";

        uploadedPath = `${userId}/${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from(uploadBucket)
          .upload(uploadedPath, selectedFile, {
            contentType: selectedFile.type,
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.error("Media upload error:", uploadError);
          setMessage("Media upload failed. Please try again.");
          return;
        }
      }

      const { error: postError } = await supabase.from("posts").insert({
        user_id: userId,
        content: trimmedContent,
        media_path: uploadedPath,
        media_type: selectedFile?.type ?? null,
        media_bucket: uploadBucket,
      });

      if (postError) {
        console.error("Post publishing error:", postError);

        if (uploadedPath) {
          await supabase.storage.from(uploadBucket).remove([uploadedPath]);
        }

        setMessage("Your post could not be published. Please try again.");
        return;
      }

      setContent("");
      setSelectedFile(null);
      setFileInputKey((key) => key + 1);
      setMessage("Your post has been published!");
      await loadPosts();
    } catch (error) {
      console.error("Publishing error:", error);

      if (uploadedPath) {
        await supabase.storage.from(uploadBucket).remove([uploadedPath]);
      }

      setMessage("Something went wrong. Please try again.");
    } finally {
      setPublishing(false);
    }
  }

  async function deletePost(post: Post) {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", post.id)
      .eq("user_id", userId);

    if (error) {
      setMessage("Could not delete the post. Please try again.");
      return;
    }

    if (post.media_path) {
      const { error: mediaError } = await supabase.storage
        .from(post.media_bucket)
        .remove([post.media_path]);

      if (mediaError) {
        console.error("Media cleanup error:", mediaError);
        setMessage("Post deleted, but its media could not be removed.");
        await loadPosts();
        return;
      }
    }

    setOpenMenu(null);
    setMessage("Post deleted successfully.");
    await loadPosts();
  }

  async function toggleSavePost(postId: string) {
    const alreadySaved = savedPostIds.includes(postId);

    if (alreadySaved) {
      const { error } = await supabase
        .from("saved_posts")
        .delete()
        .eq("user_id", userId)
        .eq("post_id", postId);

      if (error) {
        console.error("Unsave error:", error);
        setMessage("Could not remove this saved post.");
        return;
      }

      setSavedPostIds((previous) =>
        previous.filter((id) => id !== postId)
      );
      setMessage("Post removed from your saved posts.");
    } else {
      const { error } = await supabase
        .from("saved_posts")
        .insert({ user_id: userId, post_id: postId });

      if (error) {
        console.error("Save error:", error);
        setMessage("Could not save this post.");
        return;
      }

      setSavedPostIds((previous) => [...previous, postId]);
      setMessage("Post saved successfully!");
    }

    setOpenMenu(null);
  }

  async function canSharePost(postId: string): Promise<boolean> {
    const post = posts.find((item) => item.id === postId);

    if (!post) {
      setMessage("This post is unavailable.");
      return false;
    }

    if (!userId) {
      setMessage("Please sign in before sharing.");
      return false;
    }

    const { data, error } = await supabase.rpc(
      "can_interact_with_post",
      {
        target_post_id: post.id,
        target_owner_id: post.user_id,
        viewer_id: userId,
        required_permission: "share_permission",
      }
    );

    if (error) {
      console.error("Share permission error:", error);
      setMessage("Could not verify sharing permission. Please try again.");
      return false;
    }

    if (data !== true) {
      setMessage("You don't have permission to share this post.");
      return false;
    }

    return true;
  }

  async function copyPostLink(postId: string) {
    if (sharingPost) return;

    setSharingPost(postId);

    try {
      if (!(await canSharePost(postId))) return;

      const url = `${window.location.origin}/social?post=${encodeURIComponent(postId)}`;

      try {
        await navigator.clipboard.writeText(url);
        setMessage("Post link copied successfully!");
      } catch {
        window.prompt("Copy this post link:", url);
      }

      setOpenMenu(null);
    } finally {
      setSharingPost(null);
    }
  }

  function hidePost(postId: string) {
    setHiddenPostIds((previous) =>
      previous.includes(postId) ? previous : [...previous, postId]
    );
    setOpenMenu(null);
    setMessage("This post is hidden for this session.");
  }

  async function submitPostReport(post: Post) {
    if (submittingReport) return;

    setSubmittingReport(true);

    try {
      const { error } = await supabase
        .from("content_reports")
        .insert({
          reporter_id: userId,
          reported_user_id: post.user_id,
          post_id: post.id,
          reason: reportReason,
          details: reportDetails.trim(),
        });

      if (error) {
        console.error("Report submission error:", error);
        setMessage("Could not submit your report. Please try again.");
        return;
      }

      setReportingPost(null);
      setReportDetails("");
      setReportReason("spam");
      setMessage("Thank you. Your report has been submitted.");
    } catch (error) {
      console.error("Report error:", error);
      setMessage("Something went wrong while submitting your report.");
    } finally {
      setSubmittingReport(false);
    }
  }

  async function toggleReaction(
    postId: string,
    reactionType: ReactionType
  ) {
    if (reactingTo) return;

    setReactingTo(postId);
    setMessage("");

    const existing = reactions.find(
      (item) => item.post_id === postId && item.user_id === userId
    );

    try {
      if (existing?.reaction_type === reactionType) {
        const { error } = await supabase
          .from("post_reactions")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", userId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("post_reactions")
          .upsert(
            {
              post_id: postId,
              user_id: userId,
              reaction_type: reactionType,
            },
            { onConflict: "post_id,user_id" }
          );

        if (error) throw error;
      }

      await loadPosts();
    } catch (error) {
      console.error("Reaction update error:", error);
      setMessage("Could not update your reaction. Please try again.");
    } finally {
      setReactingTo(null);
    }
  }

  async function addComment(
    postId: string,
    parentId: string | null = null
  ) {
    const text = parentId
      ? replyInputs[parentId]?.trim()
      : commentInputs[postId]?.trim();

    if (!text) {
      setMessage("Please write a comment first.");
      return;
    }

    if (text.length > 2000) {
      setMessage("Comments cannot exceed 2,000 characters.");
      return;
    }

    if (commenting) return;

    setCommenting(true);
    setMessage("");

    try {
      const { error } = await supabase.from("post_comments").insert({
        post_id: postId,
        user_id: userId,
        parent_id: parentId,
        content: text,
      });

      if (error) {
        console.error("Comment error:", error);
        setMessage("Your comment could not be published. Please try again.");
        return;
      }

      if (parentId) {
        setReplyInputs((previous) => ({
          ...previous,
          [parentId]: "",
        }));
        setReplyingTo(null);
      } else {
        setCommentInputs((previous) => ({
          ...previous,
          [postId]: "",
        }));
      }

      setMessage("Your comment has been published!");
      await loadPosts();
    } catch (error) {
      console.error("Comment error:", error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setCommenting(false);
    }
  }

  async function deleteComment(commentId: string) {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    const { error } = await supabase
      .from("post_comments")
      .delete()
      .eq("id", commentId)
      .eq("user_id", userId);

    if (error) {
      setMessage("Could not delete the comment. Please try again.");
      return;
    }

    setMessage("Comment deleted successfully.");
    await loadPosts();
  }

  async function sharePost(postId: string) {
    if (sharingPost) return;

    setSharingPost(postId);

    try {
      if (!(await canSharePost(postId))) return;

      const postUrl = `${window.location.origin}/social?post=${encodeURIComponent(postId)}`;

      try {
        if (navigator.share) {
          await navigator.share({
            title: "POJAX SOCIAL",
            text: "Check out this post on POJAX SOCIAL!",
            url: postUrl,
          });
        } else if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(postUrl);
          setMessage("Post link copied successfully!");
        } else {
          window.prompt("Copy this post link:", postUrl);
        }
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          console.error("Share error:", error);
          setMessage("Unable to share this post. Please try again.");
        }
      }
    } finally {
      setSharingPost(null);
    }
  }

  function toggleReactionPeople(postId: string) {
    setExpandedReactions((previous) => ({
      ...previous,
      [postId]: !previous[postId],
    }));
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050b18] text-white">
        Loading POJAX SOCIAL...
      </main>
    );
  }

  const visiblePosts = posts.filter(
    (post) => !hiddenPostIds.includes(post.id)
  );

  return (
    <main className="min-h-screen bg-[#050b18] px-4 py-8 text-white md:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between border-b border-cyan-500/30 pb-6">
          <div>
            <h1 className="text-3xl font-black text-cyan-400">
              POJAX SOCIAL
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Share ideas. Connect. Grow together.
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-bold hover:bg-slate-700"
          >
            Dashboard
          </button>
        </header>

        <section className="mt-8 rounded-2xl border border-cyan-900 bg-[#0b1628] p-6">
          <h2 className="text-xl font-bold text-cyan-300">Create a post</h2>

          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            maxLength={5000}
            placeholder="What's on your mind?"
            rows={5}
            className="mt-5 w-full resize-y rounded-xl border border-slate-700 bg-slate-900 p-4 text-white outline-none focus:border-cyan-400"
          />

          <div className="mt-4">
            <label className="mb-2 block text-sm font-semibold text-cyan-300">
              Add a photo or video
            </label>

            <input
              key={fileInputKey}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
              onChange={(event) =>
                setSelectedFile(event.target.files?.[0] ?? null)
              }
              className="block w-full text-sm text-gray-300 file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-500 file:px-4 file:py-2 file:font-bold file:text-slate-950"
            />

            {selectedFile && (
              <div className="mt-3 rounded-lg bg-slate-900 p-3 text-sm text-gray-300">
                <p className="break-all">{selectedFile.name}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setFileInputKey((key) => key + 1);
                  }}
                  className="mt-2 text-red-400"
                >
                  Remove selected file
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-gray-500">
              {content.length}/5000 characters
            </span>

            <button
              onClick={publishPost}
              disabled={publishing}
              className="rounded-lg bg-cyan-500 px-6 py-3 font-bold text-slate-950 disabled:opacity-50"
            >
              {publishing ? "Publishing..." : "Publish Post"}
            </button>
          </div>

          {message && (
            <p className="mt-4 rounded-lg bg-slate-800 p-3 text-sm text-cyan-300">
              {message}
            </p>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-2xl font-black">Community Posts</h2>
          <p className="mt-2 text-sm text-gray-400">
            Discover what members are sharing.
          </p>

          {visiblePosts.length === 0 ? (
            <div className="mt-6 rounded-xl border border-slate-800 bg-[#0b1628] p-8 text-center text-gray-400">
              No posts to display. Be the first to share something!
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {visiblePosts.map((post) => {
                const mediaUrl = mediaUrls[post.id] || null;

                const postReactions = reactions.filter(
                  (item) => item.post_id === post.id
                );

                const myReaction = postReactions.find(
                  (item) => item.user_id === userId
                );

                const postComments = comments.filter(
                  (item) => item.post_id === post.id
                );

                const topComments = postComments.filter(
                  (item) => item.parent_id === null
                );

                const isSaved = savedPostIds.includes(post.id);
                const menuIsOpen = openMenu === post.id;

                return (
                  <article
                    key={post.id}
                    className="rounded-xl border border-slate-800 bg-[#0b1628] p-6"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <Link
                          href={memberLink(post.user_id)}
                          className="font-bold text-cyan-400 hover:text-cyan-200 hover:underline"
                        >
                          {memberName(post.user_id)}
                        </Link>

                        <p className="mt-1 text-xs text-gray-500">
                          {formatPostTime(post.created_at)}
                        </p>
                      </div>

                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenu(menuIsOpen ? null : post.id)
                          }
                          aria-label="Post options"
                          aria-expanded={menuIsOpen}
                          className="rounded-full px-3 py-2 text-xl text-gray-300 hover:bg-slate-700 hover:text-cyan-300"
                        >
                          ⋮
                        </button>

                        {menuIsOpen && (
                          <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-slate-700 bg-[#101d32] p-2 shadow-xl">
                            <button
                              type="button"
                              disabled={sharingPost === post.id}
                              onClick={() => copyPostLink(post.id)}
                              className="w-full rounded-lg px-3 py-3 text-left text-sm hover:bg-slate-700 disabled:opacity-50"
                            >
                              {sharingPost === post.id
                                ? "Checking permission..."
                                : "🔗 Copy post link"}
                            </button>

                            <button
                              type="button"
                              onClick={() => toggleSavePost(post.id)}
                              className="w-full rounded-lg px-3 py-3 text-left text-sm hover:bg-slate-700"
                            >
                              {isSaved ? "🔖 Remove saved post" : "🔖 Save post"}
                            </button>

                            <button
                              type="button"
                              onClick={() => hidePost(post.id)}
                              className="w-full rounded-lg px-3 py-3 text-left text-sm hover:bg-slate-700"
                            >
                              👁 Hide post
                            </button>

                            {post.user_id === userId ? (
                              <button
                                type="button"
                                onClick={() => deletePost(post)}
                                className="w-full rounded-lg px-3 py-3 text-left text-sm text-red-400 hover:bg-slate-700"
                              >
                                🗑 Delete post
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setReportingPost(post.id);
                                  setOpenMenu(null);
                                }}
                                className="w-full rounded-lg px-3 py-3 text-left text-sm text-red-300 hover:bg-slate-700"
                              >
                                🚩 Report post
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {post.content && (
                      <p className="mt-4 whitespace-pre-wrap break-words leading-7 text-gray-200">
                        {post.content}
                      </p>
                    )}

                    {post.media_path && !mediaUrl && (
                      <p className="mt-4 text-sm text-amber-300">
                        This media is unavailable or you don't have permission to view it.
                      </p>
                    )}

                    {mediaUrl && post.media_type?.startsWith("image/") && (
                      <img
                        src={mediaUrl}
                        alt="Post media"
                        className="mt-4 max-h-[600px] w-full rounded-xl object-contain"
                      />
                    )}

                    {mediaUrl && post.media_type?.startsWith("video/") && (
                      <video
                        src={mediaUrl}
                        controls
                        preload="metadata"
                        className="mt-4 max-h-[600px] w-full rounded-xl"
                      />
                    )}

                    <div className="mt-5 border-t border-white/10 pt-4">
                      <div className="flex flex-wrap gap-2">
                        {REACTIONS.map((reaction) => {
                          const count = postReactions.filter(
                            (item) => item.reaction_type === reaction.type
                          ).length;

                          const active =
                            myReaction?.reaction_type === reaction.type;

                          return (
                            <button
                              key={reaction.type}
                              onClick={() =>
                                toggleReaction(post.id, reaction.type)
                              }
                              disabled={reactingTo === post.id}
                              aria-pressed={active}
                              title={reaction.label}
                              className={`rounded-lg border px-3 py-2 text-sm ${
                                active
                                  ? "border-cyan-400 bg-cyan-500/20 text-cyan-300"
                                  : "border-slate-700 bg-slate-900 hover:border-cyan-500"
                              } disabled:opacity-50`}
                            >
                              {reaction.emoji} {count > 0 ? count : ""}
                            </button>
                          );
                        })}

                        <button
                          type="button"
                          onClick={() => sharePost(post.id)}
                          disabled={sharingPost === post.id}
                          className="rounded-lg border border-cyan-700 bg-slate-900 px-3 py-2 text-sm font-semibold text-cyan-300 hover:border-cyan-400 disabled:opacity-50"
                        >
                          {sharingPost === post.id
                            ? "Checking..."
                            : "↗ Share"}
                        </button>
                      </div>

                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => toggleReactionPeople(post.id)}
                          className="text-sm text-cyan-400 hover:text-cyan-200"
                        >
                          {expandedReactions[post.id]
                            ? "Hide people who reacted ↑"
                            : `People who reacted (${postReactions.length}) ↓`}
                        </button>

                        {expandedReactions[post.id] && (
                          <div className="mt-3 rounded-lg bg-slate-900 p-4">
                            {postReactions.length === 0 ? (
                              <p className="text-sm text-gray-400">
                                Nobody has reacted to this post yet.
                              </p>
                            ) : (
                              <div className="space-y-3">
                                {postReactions.map((reaction, index) => {
                                  const emoji =
                                    REACTIONS.find(
                                      (item) =>
                                        item.type === reaction.reaction_type
                                    )?.emoji || "👍";

                                  return (
                                    <div
                                      key={`${reaction.user_id}-${index}`}
                                      className="flex items-center justify-between gap-3"
                                    >
                                      <Link
                                        href={memberLink(reaction.user_id)}
                                        className="text-sm text-gray-200 hover:text-cyan-300 hover:underline"
                                      >
                                        {memberName(reaction.user_id)}
                                      </Link>

                                      <span>{emoji}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <section className="mt-6 border-t border-white/10 pt-5">
                      <h3 className="font-bold text-cyan-300">
                        Comments ({postComments.length})
                      </h3>

                      <div className="mt-4 flex gap-2">
                        <input
                          value={commentInputs[post.id] ?? ""}
                          onChange={(event) =>
                            setCommentInputs((previous) => ({
                              ...previous,
                              [post.id]: event.target.value,
                            }))
                          }
                          maxLength={2000}
                          placeholder="Write a comment..."
                          className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                        />

                        <button
                          onClick={() => addComment(post.id)}
                          disabled={commenting}
                          className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-bold text-slate-950 disabled:opacity-50"
                        >
                          Comment
                        </button>
                      </div>

                      <div className="mt-5 space-y-4">
                        {topComments.map((comment) => {
                          const replies = postComments.filter(
                            (item) => item.parent_id === comment.id
                          );

                          return (
                            <div
                              key={comment.id}
                              className="rounded-lg bg-slate-900 p-4"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <Link
                                  href={memberLink(comment.user_id)}
                                  className="text-sm font-bold text-cyan-300 hover:underline"
                                >
                                  {memberName(comment.user_id)}
                                </Link>

                                {comment.user_id === userId && (
                                  <button
                                    onClick={() => deleteComment(comment.id)}
                                    className="text-xs text-red-400 hover:text-red-300"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>

                              <p className="mt-2 whitespace-pre-wrap break-words text-sm text-gray-200">
                                {comment.content}
                              </p>

                              <button
                                onClick={() =>
                                  setReplyingTo(
                                    replyingTo === comment.id
                                      ? null
                                      : comment.id
                                  )
                                }
                                className="mt-3 text-xs font-semibold text-cyan-400"
                              >
                                {replyingTo === comment.id ? "Cancel" : "Reply"}
                              </button>

                              {replyingTo === comment.id && (
                                <div className="mt-3 flex gap-2">
                                  <input
                                    value={replyInputs[comment.id] ?? ""}
                                    onChange={(event) =>
                                      setReplyInputs((previous) => ({
                                        ...previous,
                                        [comment.id]: event.target.value,
                                      }))
                                    }
                                    maxLength={2000}
                                    placeholder="Write a reply..."
                                    className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-[#050b18] px-3 py-2 text-sm text-white"
                                  />

                                  <button
                                    onClick={() =>
                                      addComment(post.id, comment.id)
                                    }
                                    disabled={commenting}
                                    className="rounded-lg bg-cyan-500 px-3 py-2 text-xs font-bold text-slate-950"
                                  >
                                    Send
                                  </button>
                                </div>
                              )}

                              {replies.length > 0 && (
                                <div className="mt-4 space-y-3 border-l-2 border-cyan-900 pl-4">
                                  {replies.map((reply) => (
                                    <div key={reply.id}>
                                      <div className="flex items-center justify-between gap-2">
                                        <Link
                                          href={memberLink(reply.user_id)}
                                          className="text-xs font-bold text-cyan-300 hover:underline"
                                        >
                                          {memberName(reply.user_id)}
                                        </Link>

                                        {reply.user_id === userId && (
                                          <button
                                            onClick={() =>
                                              deleteComment(reply.id)
                                            }
                                            className="text-xs text-red-400"
                                          >
                                            Delete
                                          </button>
                                        )}
                                      </div>

                                      <p className="mt-1 whitespace-pre-wrap break-words text-sm text-gray-300">
                                        {reply.content}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {reportingPost && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#0b1628] p-6 shadow-2xl">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-cyan-300">
                  Report this post
                </h2>

                <button
                  type="button"
                  onClick={() => setReportingPost(null)}
                  className="rounded-lg px-3 py-1 text-xl text-gray-400 hover:bg-slate-700"
                  aria-label="Close report form"
                >
                  ×
                </button>
              </div>

              <p className="mt-2 text-sm text-gray-400">
                Tell us why you are reporting this post. Reports are private.
              </p>

              <label className="mt-5 block text-sm font-semibold">
                Reason for reporting
              </label>

              <select
                value={reportReason}
                onChange={(event) => setReportReason(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-white outline-none focus:border-cyan-400"
              >
                {REPORT_REASONS.map((reason) => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>

              <label className="mt-5 block text-sm font-semibold">
                Additional details (optional)
              </label>

              <textarea
                value={reportDetails}
                onChange={(event) => setReportDetails(event.target.value)}
                maxLength={1000}
                rows={4}
                placeholder="Explain what happened..."
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 p-3 text-white outline-none focus:border-cyan-400"
              />

              <p className="mt-1 text-right text-xs text-gray-500">
                {reportDetails.length}/1000
              </p>

              <div className="mt-5 flex gap-3">
                <button
                  type="button"
                  onClick={() => setReportingPost(null)}
                  className="flex-1 rounded-lg border border-slate-600 px-4 py-3 font-semibold hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={submittingReport}
                  onClick={() => {
                    const post = posts.find(
                      (item) => item.id === reportingPost
                    );

                    if (post) submitPostReport(post);
                  }}
                  className="flex-1 rounded-lg bg-red-500 px-4 py-3 font-bold text-white disabled:opacity-50"
                >
                  {submittingReport ? "Submitting..." : "Submit report"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}