"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase";

type Reaction =
  | "like"
  | "love"
  | "care"
  | "haha"
  | "wow"
  | "sad"
  | "angry";

type Reel = {
  id: string;
  user_id: string;
  caption: string;
  video_path: string;
  created_at: string;
  video_url: string;
  display_name: string;
  username: string;
  avatar_url: string | null;
  reaction_count: number;
  comment_count: number;
  my_reaction: Reaction | null;
  following: boolean;
  saved: boolean;
};

type ReelComment = {
  id: string;
  reel_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  created_at: string;
  display_name: string;
};

const REACTIONS: {
  id: Reaction;
  emoji: string;
  label: string;
}[] = [
  { id: "like", emoji: "👍", label: "Like" },
  { id: "love", emoji: "❤️", label: "Love" },
  { id: "care", emoji: "🥰", label: "Care" },
  { id: "haha", emoji: "😂", label: "Haha" },
  { id: "wow", emoji: "😮", label: "Wow" },
  { id: "sad", emoji: "😢", label: "Sad" },
  { id: "angry", emoji: "😡", label: "Angry" },
];

const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

export default function ReelsPage() {
  const supabase = createClient();

  const [userId, setUserId] = useState("");
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeReel, setActiveReel] = useState("");
  const [playing, setPlaying] = useState(true);

  const [reactionPicker, setReactionPicker] = useState("");
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdTriggered = useRef(false);

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState<ReelComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  // -----------------------------------------
  // AUTHENTICATION
  // -----------------------------------------

  useEffect(() => {
    let active = true;

    async function initialize() {
      const { data, error } = await supabase.auth.getUser();

      if (!active) return;

      if (error || !data.user) {
        window.location.replace("/login");
        return;
      }

      setUserId(data.user.id);
      await loadReels(data.user.id);

      if (active) setLoading(false);
    }

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        window.location.replace("/login");
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  // -----------------------------------------
  // LOAD REELS
  // -----------------------------------------

  const loadReels = useCallback(async (memberId: string) => {
    setError("");

    const { data: reelData, error: reelError } = await supabase
      .from("reels")
      .select("id,user_id,caption,video_path,created_at")
      .order("created_at", { ascending: false })
      .limit(30);

    if (reelError) {
      setError(reelError.message);
      return;
    }

    if (!reelData || reelData.length === 0) {
      setReels([]);
      return;
    }

    const creatorIds = [
      ...new Set(reelData.map((reel) => reel.user_id)),
    ];

    const reelIds = reelData.map((reel) => reel.id);

    const [
      profileResult,
      publicProfileResult,
      reactionResult,
      commentResult,
      followResult,
      saveResult,
      myReactionResult,
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("id,full_name,username,avatar_url")
        .in("id", creatorIds),

      supabase
        .from("member_public_profiles")
        .select("user_id,display_name")
        .in("user_id", creatorIds),

      supabase
        .from("reel_reactions")
        .select("reel_id,reaction")
        .in("reel_id", reelIds),

      supabase
        .from("reel_comments")
        .select("reel_id")
        .in("reel_id", reelIds),

      supabase
        .from("member_follows")
        .select("followed_id")
        .eq("follower_id", memberId)
        .in("followed_id", creatorIds),

      supabase
        .from("reel_saves")
        .select("reel_id")
        .eq("user_id", memberId)
        .in("reel_id", reelIds),

      supabase
        .from("reel_reactions")
        .select("reel_id,reaction")
        .eq("user_id", memberId)
        .in("reel_id", reelIds),
    ]);

    const profiles = profileResult.data ?? [];
    const publicProfiles = publicProfileResult.data ?? [];
    const reactions = reactionResult.data ?? [];
    const commentsData = commentResult.data ?? [];
    const follows = followResult.data ?? [];
    const saves = saveResult.data ?? [];
    const myReactions = myReactionResult.data ?? [];

    const profileMap = new Map(
      profiles.map((profile) => [profile.id, profile])
    );

    const publicProfileMap = new Map(
      publicProfiles.map((profile) => [
        profile.user_id,
        profile.display_name,
      ])
    );

    const followingSet = new Set(
      follows.map((follow) => follow.followed_id)
    );

    const savedSet = new Set(
      saves.map((save) => save.reel_id)
    );

    const myReactionMap = new Map(
      myReactions.map((reaction) => [
        reaction.reel_id,
        reaction.reaction as Reaction,
      ])
    );

    const prepared: Reel[] = [];

    for (const reel of reelData) {
      const creator = profileMap.get(reel.user_id);

      const { data: signedData, error: signedError } =
        await supabase.storage
          .from("reels-media")
          .createSignedUrl(reel.video_path, 3600);

      if (signedError || !signedData?.signedUrl) {
        continue;
      }

      prepared.push({
        ...reel,
        video_url: signedData.signedUrl,
        display_name:
          publicProfileMap.get(reel.user_id) ||
          creator?.full_name ||
          "POJAX Member",
        username: creator?.username || "",
        avatar_url: creator?.avatar_url || null,
        reaction_count: reactions.filter(
          (item) => item.reel_id === reel.id
        ).length,
        comment_count: commentsData.filter(
          (item) => item.reel_id === reel.id
        ).length,
        my_reaction: myReactionMap.get(reel.id) ?? null,
        following: followingSet.has(reel.user_id),
        saved: savedSet.has(reel.id),
      });
    }

    setReels(prepared);

    if (prepared.length > 0) {
      setActiveReel(prepared[0].id);
    }
  }, []);

  // -----------------------------------------
  // VIDEO PLAYBACK
  // -----------------------------------------

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.getAttribute("data-reel-id");

          if (!id) return;

          if (entry.isIntersecting && entry.intersectionRatio >= 0.65) {
            setActiveReel(id);
          }
        });
      },
      { threshold: [0.3, 0.65, 0.9] }
    );

    document
      .querySelectorAll("[data-reel-id]")
      .forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [reels]);

  useEffect(() => {
    Object.entries(videoRefs.current).forEach(([id, video]) => {
      if (!video) return;

      if (id === activeReel && playing && !document.hidden) {
        const playPromise = video.play();

        if (playPromise) {
          playPromise.catch(() => {
            // Mobile browsers may block automatic playback.
            // The member can start playback with a tap.
            setPlaying(false);
          });
        }
      } else {
        video.pause();
      }
    });
  }, [activeReel, playing, reels]);

  // Stop every video as soon as the page is hidden or left.
  // This prevents audio from continuing after navigation on phones.
  useEffect(() => {
    const pauseAllVideos = () => {
      Object.values(videoRefs.current).forEach((video) => {
        if (video && !video.paused) video.pause();
      });
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        pauseAllVideos();
        setPlaying(false);
      }
    };

    const handlePageHide = () => {
      pauseAllVideos();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pagehide", handlePageHide);

      // Pause synchronously so audio does not continue in the background.
      Object.values(videoRefs.current).forEach((video) => {
        if (!video) return;

        video.pause();
        video.removeAttribute("src");
        video.load();
      });

      videoRefs.current = {};
    };
  }, []);

  // -----------------------------------------
  // REACTIONS
  // -----------------------------------------

  function startReactionHold(reelId: string) {
    holdTriggered.current = false;

    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
    }

    holdTimer.current = setTimeout(() => {
      holdTriggered.current = true;
      setReactionPicker(reelId);
    }, 2000);
  }

  function cancelReactionHold() {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  }

  async function chooseReaction(
    reelId: string,
    reaction: Reaction
  ) {
    const current = reels.find((reel) => reel.id === reelId);

    if (!current || !userId) return;

    const previous = current.my_reaction;

    setReactionPicker("");

    setReels((items) =>
      items.map((reel) =>
        reel.id === reelId
          ? {
              ...reel,
              my_reaction: reaction,
              reaction_count: previous
                ? reel.reaction_count
                : reel.reaction_count + 1,
            }
          : reel
      )
    );

    const { error } = await supabase
      .from("reel_reactions")
      .upsert(
        {
          reel_id: reelId,
          user_id: userId,
          reaction,
        },
        { onConflict: "reel_id,user_id" }
      );

    if (error) {
      setError(error.message);
      await loadReels(userId);
    }
  }

  async function toggleReaction(reelId: string) {
    if (holdTriggered.current) {
      holdTriggered.current = false;
      return;
    }

    const current = reels.find((reel) => reel.id === reelId);

    if (!current || !userId) return;

    if (current.my_reaction) {
      const { error } = await supabase
        .from("reel_reactions")
        .delete()
        .eq("reel_id", reelId)
        .eq("user_id", userId);

      if (error) {
        setError(error.message);
        return;
      }

      setReels((items) =>
        items.map((reel) =>
          reel.id === reelId
            ? {
                ...reel,
                my_reaction: null,
                reaction_count: Math.max(
                  0,
                  reel.reaction_count - 1
                ),
              }
            : reel
        )
      );
    } else {
      await chooseReaction(reelId, "like");
    }
  }

  // -----------------------------------------
  // FOLLOW
  // -----------------------------------------

  async function toggleFollow(reel: Reel) {
    if (!userId || reel.user_id === userId) return;

    const wasFollowing = reel.following;

    setReels((items) =>
      items.map((item) =>
        item.user_id === reel.user_id
          ? { ...item, following: !wasFollowing }
          : item
      )
    );

    const result = wasFollowing
      ? await supabase
          .from("member_follows")
          .delete()
          .eq("follower_id", userId)
          .eq("followed_id", reel.user_id)
      : await supabase
          .from("member_follows")
          .insert({
            follower_id: userId,
            followed_id: reel.user_id,
          });

    if (result.error) {
      setError(result.error.message);
      await loadReels(userId);
    }
  }

  // -----------------------------------------
  // SAVE VIDEO
  // -----------------------------------------

  async function toggleSave(reel: Reel) {
    const result = reel.saved
      ? await supabase
          .from("reel_saves")
          .delete()
          .eq("reel_id", reel.id)
          .eq("user_id", userId)
      : await supabase
          .from("reel_saves")
          .insert({
            reel_id: reel.id,
            user_id: userId,
          });

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setReels((items) =>
      items.map((item) =>
        item.id === reel.id
          ? { ...item, saved: !reel.saved }
          : item
      )
    );
  }

  // -----------------------------------------
  // COMMENTS
  // -----------------------------------------

  async function openComments(reelId: string) {
    setCommentsOpen(true);
    setCommentsLoading(true);
    setReplyTo(null);

    const { data, error } = await supabase
      .from("reel_comments")
      .select("id,reel_id,user_id,parent_id,content,created_at")
      .eq("reel_id", reelId)
      .order("created_at", { ascending: true });

    if (error) {
      setError(error.message);
      setCommentsLoading(false);
      return;
    }

    const memberIds = [
      ...new Set((data ?? []).map((comment) => comment.user_id)),
    ];

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id,full_name")
      .in("id", memberIds);

    const profileMap = new Map(
      (profiles ?? []).map((profile) => [
        profile.id,
        profile.full_name,
      ])
    );

    setComments(
      (data ?? []).map((comment) => ({
        ...comment,
        display_name:
          profileMap.get(comment.user_id) || "POJAX Member",
      }))
    );

    setCommentsLoading(false);
  }

  async function submitComment(reelId: string) {
    const content = commentText.trim();

    if (!content || !userId) return;

    const { error } = await supabase
      .from("reel_comments")
      .insert({
        reel_id: reelId,
        user_id: userId,
        parent_id: replyTo,
        content,
      });

    if (error) {
      setError(error.message);
      return;
    }

    setCommentText("");
    setReplyTo(null);

    setReels((items) =>
      items.map((reel) =>
        reel.id === reelId
          ? { ...reel, comment_count: reel.comment_count + 1 }
          : reel
      )
    );

    await openComments(reelId);
  }

  // -----------------------------------------
  // SHARE
  // -----------------------------------------

  async function shareReel(reelId: string) {
    const url = `${window.location.origin}/reels?id=${reelId}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "POJAX SOCIAL Reel",
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Reel link copied.");
      }
    } catch {
      // Sharing was cancelled or unavailable.
    }
  }

  // -----------------------------------------
  // UPLOAD REEL
  // -----------------------------------------

  async function uploadReel() {
    if (!userId || !uploadFile) return;

    if (uploadFile.size > MAX_VIDEO_SIZE) {
      setError("Your video must be 50 MB or smaller.");
      return;
    }

    const allowedTypes = [
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];

    if (!allowedTypes.includes(uploadFile.type)) {
      setError("Please choose an MP4, WebM or MOV video.");
      return;
    }

    setUploading(true);
    setError("");

    const extension =
      uploadFile.name.split(".").pop()?.toLowerCase() || "mp4";

    const videoPath = `${userId}/${crypto.randomUUID()}.${extension}`;

    const { error: storageError } = await supabase.storage
      .from("reels-media")
      .upload(videoPath, uploadFile, {
        contentType: uploadFile.type,
        upsert: false,
      });

    if (storageError) {
      setError(storageError.message);
      setUploading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("reels")
      .insert({
        user_id: userId,
        caption: caption.trim(),
        video_path: videoPath,
      });

    if (insertError) {
      await supabase.storage
        .from("reels-media")
        .remove([videoPath]);

      setError(insertError.message);
      setUploading(false);
      return;
    }

    setUploadOpen(false);
    setUploadFile(null);
    setCaption("");
    setUploading(false);

    await loadReels(userId);
  }

  // -----------------------------------------
  // LOADING
  // -----------------------------------------

  if (loading) {
    return (
      <main className="fixed inset-0 flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="text-xl font-bold tracking-widest">
            POJAX REELS
          </div>
          <p className="mt-3 text-sm text-gray-300">
            Loading videos...
          </p>
        </div>
      </main>
    );
  }

  // -----------------------------------------
  // MAIN PAGE
  // -----------------------------------------

  return (
    <main className="fixed inset-0 z-40 bg-black text-white">
      <header className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between px-4 py-4">
        <a href="/dashboard" className="text-lg font-bold">
          POJAX <span className="text-blue-400">REELS</span>
        </a>

        <button
          onClick={() => setUploadOpen(true)}
          className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur"
        >
          ＋ Create
        </button>
      </header>

      {error && (
        <div className="absolute left-3 right-3 top-16 z-50 rounded-xl bg-red-700 p-3 text-sm">
          {error}
          <button
            onClick={() => setError("")}
            className="ml-3 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {reels.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center px-6 text-center">
          <div className="text-5xl">🎬</div>
          <h2 className="mt-4 text-xl font-bold">
            Your Reels feed is ready
          </h2>
          <p className="mt-2 max-w-sm text-sm text-gray-300">
            There are no videos to show yet. Upload your first Reel
            or come back when members have shared videos.
          </p>
          <button
            onClick={() => setUploadOpen(true)}
            className="mt-6 rounded-full bg-blue-600 px-6 py-3 font-semibold"
          >
            Upload a Reel
          </button>
        </div>
      ) : (
        <div className="h-full snap-y snap-mandatory overflow-y-scroll overscroll-contain">
          {reels.map((reel) => {
            const selectedReaction = REACTIONS.find(
              (item) => item.id === reel.my_reaction
            );

            return (
              <section
                key={reel.id}
                data-reel-id={reel.id}
                className="relative h-screen min-h-[100svh] w-full snap-start snap-always overflow-hidden bg-black"
              >
                <video
                  ref={(element) => {
                    videoRefs.current[reel.id] = element;
                  }}
                  src={reel.video_url}
                  className="absolute inset-0 z-0 block h-full w-full cursor-pointer bg-black object-contain"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    objectPosition: "center",
                  }}
                  loop
                  playsInline
                  preload="auto"
                  disablePictureInPicture
                  onError={() =>
                    setError(
                      "This video could not be displayed on this device. Please try an MP4 video encoded with H.264 video and AAC audio."
                    )
                  }
                  onClick={() =>
                    setPlaying((value) =>
                      reel.id === activeReel ? !value : true
                    )
                  }
                  onPlay={() => {
                    if (reel.id === activeReel) setPlaying(true);
                  }}
                />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

                {activeReel === reel.id && !playing && (
                  <button
                    onClick={() => setPlaying(true)}
                    className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 text-6xl"
                  >
                    ▶
                  </button>
                )}

                {/* CREATOR INFORMATION */}
                <div className="absolute bottom-24 left-4 right-20 z-20">
                  <div className="flex items-center gap-3">
                    <a
                      href={`/profile/${reel.user_id}`}
                      className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/70 bg-white/10"
                    >
                      {reel.avatar_url ? (
                        <img
                          src={reel.avatar_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="font-bold">
                          {reel.display_name.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </a>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">
                        {reel.display_name}
                      </p>
                      {reel.username && (
                        <p className="text-xs text-white/70">
                          @{reel.username}
                        </p>
                      )}
                    </div>

                    {reel.user_id !== userId && (
                      <button
                        onClick={() => toggleFollow(reel)}
                        className="rounded-full border border-white/80 px-3 py-1 text-xs font-bold"
                      >
                        {reel.following ? "Following" : "Follow"}
                      </button>
                    )}
                  </div>

                  {reel.caption && (
                    <p className="mt-3 whitespace-pre-wrap text-sm">
                      {reel.caption}
                    </p>
                  )}

                  <p className="mt-2 text-xs text-white/70">
                    POJAX SOCIAL · Reel
                  </p>
                </div>

                {/* FLOATING CONTROLS */}
                <div className="absolute bottom-28 right-3 z-30 flex flex-col items-center gap-6">
                  <div className="relative flex flex-col items-center">
                    {reactionPicker === reel.id && (
                      <div className="absolute bottom-12 right-0 flex gap-2 rounded-full bg-black/75 p-2 shadow-xl backdrop-blur">
                        {REACTIONS.map((reaction) => (
                          <button
                            key={reaction.id}
                            title={reaction.label}
                            onClick={() =>
                              chooseReaction(reel.id, reaction.id)
                            }
                            className="text-2xl transition-transform hover:scale-125"
                          >
                            {reaction.emoji}
                          </button>
                        ))}
                      </div>
                    )}

                    <button
                      onPointerDown={() => startReactionHold(reel.id)}
                      onPointerUp={cancelReactionHold}
                      onPointerLeave={cancelReactionHold}
                      onPointerCancel={cancelReactionHold}
                      onContextMenu={(event) => event.preventDefault()}
                      onClick={() => toggleReaction(reel.id)}
                      className="flex flex-col items-center"
                    >
                      <span className="text-3xl">
                        {selectedReaction?.emoji || "👍"}
                      </span>
                      <span className="mt-1 text-xs">
                        {reel.reaction_count}
                      </span>
                    </button>
                  </div>

                  <button
                    onClick={() => openComments(reel.id)}
                    className="flex flex-col items-center"
                  >
                    <span className="text-3xl">💬</span>
                    <span className="mt-1 text-xs">
                      {reel.comment_count}
                    </span>
                  </button>

                  <button
                    onClick={() => shareReel(reel.id)}
                    className="flex flex-col items-center"
                  >
                    <span className="text-3xl">↗</span>
                    <span className="mt-1 text-xs">Share</span>
                  </button>

                  <button
                    onClick={() => toggleSave(reel)}
                    className="flex flex-col items-center"
                  >
                    <span className="text-3xl">
                      {reel.saved ? "🔖" : "♧"}
                    </span>
                    <span className="mt-1 text-xs">Save</span>
                  </button>
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* COMMENTS PANEL */}
      {commentsOpen && (
        <div className="absolute inset-0 z-50 flex items-end bg-black/60">
          <div className="flex max-h-[75%] w-full flex-col rounded-t-3xl bg-white text-black">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="font-bold">Comments</h2>
              <button
                onClick={() => setCommentsOpen(false)}
                className="text-xl"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {commentsLoading ? (
                <p className="text-sm text-gray-500">
                  Loading comments...
                </p>
              ) : comments.length === 0 ? (
                <p className="text-sm text-gray-500">
                  Be the first to comment.
                </p>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`rounded-xl bg-gray-100 p-3 ${
                      comment.parent_id ? "ml-7" : ""
                    }`}
                  >
                    <p className="text-sm font-bold">
                      {comment.display_name}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-sm">
                      {comment.content}
                    </p>
                    <button
                      onClick={() => setReplyTo(comment.id)}
                      className="mt-2 text-xs font-semibold text-blue-700"
                    >
                      Reply
                    </button>
                  </div>
                ))
              )}
            </div>

            {replyTo && (
              <div className="px-4 text-xs text-blue-700">
                Replying to a comment
                <button
                  onClick={() => setReplyTo(null)}
                  className="ml-2 font-bold"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="flex gap-2 border-t p-3">
              <input
                value={commentText}
                onChange={(event) => setCommentText(event.target.value)}
                placeholder="Write a comment..."
                maxLength={2000}
                className="min-w-0 flex-1 rounded-full bg-gray-100 px-4 py-3 text-sm outline-none"
              />
              <button
                onClick={() => {
                  const reel = reels.find(
                    (item) => item.id === activeReel
                  );

                  if (reel) submitComment(reel.id);
                }}
                className="rounded-full bg-blue-600 px-4 font-semibold text-white"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UPLOAD PANEL */}
      {uploadOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 text-black">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Create a Reel</h2>
              <button
                onClick={() => setUploadOpen(false)}
                className="text-xl"
              >
                ✕
              </button>
            </div>

            <p className="mt-2 text-xs text-gray-500">
              MP4, WebM or MOV · Maximum 50 MB
            </p>

            <label className="mt-5 flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-cyan-400/50 bg-[#081a30] px-5 py-6 text-center transition hover:border-cyan-300 hover:bg-[#102b48]">
              <span className="text-3xl text-cyan-400">＋</span>

              <span className="mt-2 text-sm font-bold text-white">
                Choose video
              </span>

              <span className="mt-1 text-xs text-gray-400">
                Select an MP4, WebM or MOV video
              </span>

              <span className="mt-1 text-xs text-cyan-300">
                Maximum size: 50 MB
              </span>

              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                onChange={(event) =>
                  setUploadFile(event.target.files?.[0] ?? null)
                }
                className="hidden"
              />
            </label>

            {uploadFile && (
              <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-800">
                    {uploadFile.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setUploadFile(null)}
                  className="shrink-0 rounded-md px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100"
                >
                  Remove
                </button>
              </div>
            )}

            <textarea
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              maxLength={2200}
              placeholder="Write a caption..."
              className="mt-4 w-full rounded-xl border p-3 text-sm"
              rows={4}
            />

            <button
              onClick={uploadReel}
              disabled={!uploadFile || uploading}
              className="mt-4 w-full rounded-full bg-blue-600 py-3 font-bold text-white disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Publish Reel"}
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
