
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

type FollowRecord = {
  id: string;
  follower_id: string;
  followed_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
};

type MemberName = {
  user_id: string;
  display_name: string;
};

type Tab = "followers" | "following" | "received" | "sent";

export default function ConnectionsPage() {
  const supabase = createClient();
  const router = useRouter();

  const [userId, setUserId] = useState("");
  const [records, setRecords] = useState<FollowRecord[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<Tab>("followers");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadConnections = useCallback(async () => {
    setLoading(true);
    setError("");

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      router.push("/login");
      return;
    }

    setUserId(user.id);

    const { data, error: followError } = await supabase
      .from("member_follows")
      .select("*")
      .or(`follower_id.eq.${user.id},followed_id.eq.${user.id}`)
      .order("created_at", { ascending: false });

    if (followError) {
      setError(followError.message);
      setLoading(false);
      return;
    }

    const followRecords = (data || []) as FollowRecord[];
    setRecords(followRecords);

    const memberIds = Array.from(
      new Set(
        followRecords.flatMap((record) => [
          record.follower_id,
          record.followed_id,
        ])
      )
    ).filter((id) => id !== user.id);

    if (memberIds.length > 0) {
      const { data: profiles } = await supabase
        .from("member_public_profiles")
        .select("user_id, display_name")
        .in("user_id", memberIds);

      const nameMap: Record<string, string> = {};

      ((profiles || []) as MemberName[]).forEach((profile) => {
        nameMap[profile.user_id] =
          profile.display_name || "PojaX Member";
      });

      setNames(nameMap);
    } else {
      setNames({});
    }

    setLoading(false);
  }, [router, supabase]);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  async function respondToRequest(
    recordId: string,
    status: "accepted" | "rejected"
  ) {
    setBusyId(recordId);
    setMessage("");
    setError("");

    const { error } = await supabase
      .from("member_follows")
      .update({ status })
      .eq("id", recordId);

    if (error) {
      setError(error.message);
    } else {
      setMessage(
        status === "accepted"
          ? "Follow request accepted!"
          : "Follow request rejected."
      );
      await loadConnections();
    }

    setBusyId("");
  }

  async function removeRelationship(
    recordId: string,
    action: "unfollow" | "remove" | "cancel"
  ) {
    const confirmed = window.confirm(
      action === "unfollow"
        ? "Are you sure you want to unfollow this member?"
        : action === "remove"
        ? "Remove this follower?"
        : "Cancel this follow request?"
    );

    if (!confirmed) return;

    setBusyId(recordId);
    setMessage("");
    setError("");

    const { error } = await supabase
      .from("member_follows")
      .delete()
      .eq("id", recordId);

    if (error) {
      setError(error.message);
    } else {
      setMessage("Connection updated successfully.");
      await loadConnections();
    }

    setBusyId("");
  }

  function getMemberId(record: FollowRecord) {
    return record.follower_id === userId
      ? record.followed_id
      : record.follower_id;
  }

  const followers = records.filter(
    (record) =>
      record.followed_id === userId && record.status === "accepted"
  );

  const following = records.filter(
    (record) =>
      record.follower_id === userId && record.status === "accepted"
  );

  const received = records.filter(
    (record) =>
      record.followed_id === userId && record.status === "pending"
  );

  const sent = records.filter(
    (record) =>
      record.follower_id === userId && record.status === "pending"
  );

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "followers", label: "Followers", count: followers.length },
    { id: "following", label: "Following", count: following.length },
    { id: "received", label: "Requests", count: received.length },
    { id: "sent", label: "Sent", count: sent.length },
  ];

  const activeRecords =
    activeTab === "followers"
      ? followers
      : activeTab === "following"
      ? following
      : activeTab === "received"
      ? received
      : sent;

  return (
    <main className="min-h-screen bg-[#050b16] text-white px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-cyan-400 hover:text-cyan-300 mb-6"
        >
          ← Back to Dashboard
        </button>

        <div className="mb-8">
          <p className="text-cyan-400 text-sm font-semibold tracking-widest">
            POJAX T-N
          </p>
          <h1 className="text-3xl font-bold mt-2">
            POJAX CONNECTIONS
          </h1>
          <p className="text-gray-400 mt-2">
            Manage your followers, following and follow requests.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setMessage("");
                setError("");
              }}
              className={`rounded-xl border p-4 text-left transition ${
                activeTab === tab.id
                  ? "border-cyan-400 bg-cyan-500/10"
                  : "border-gray-800 bg-[#0d1728] hover:border-gray-600"
              }`}
            >
              <p className="text-gray-400 text-sm">{tab.label}</p>
              <p className="text-2xl font-bold mt-1">{tab.count}</p>
            </button>
          ))}
        </div>

        {message && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-300 rounded-lg p-3 mb-4">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-300 rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        <section className="bg-[#0d1728] border border-gray-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-semibold">
              {tabs.find((tab) => tab.id === activeTab)?.label}
            </h2>

            <button
              onClick={loadConnections}
              disabled={loading}
              className="text-cyan-400 text-sm hover:text-cyan-300 disabled:opacity-50"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <p className="text-gray-400 py-8 text-center">
              Loading your connections...
            </p>
          ) : activeRecords.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-300 font-medium">
                Nothing here yet.
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Your {tabs.find((tab) => tab.id === activeTab)?.label.toLowerCase()} will appear here.
              </p>
              <button
                onClick={() => router.push("/search")}
                className="mt-5 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-5 py-2 rounded-lg"
              >
                Discover Members
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeRecords.map((record) => {
                const memberId = getMemberId(record);
                const memberName =
                  names[memberId] || "PojaX Member";

                return (
                  <div
                    key={record.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-800 rounded-xl p-4"
                  >
                    <div>
                      <p className="font-semibold text-white">
                        {memberName}
                      </p>
                      <p className="text-gray-500 text-xs mt-1">
                        {record.status === "pending"
                          ? "Waiting for approval"
                          : "Connected member"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() =>
                          router.push(`/member/${memberId}`)
                        }
                        className="border border-cyan-500/50 text-cyan-300 hover:bg-cyan-500/10 px-3 py-2 rounded-lg text-sm"
                      >
                        View Profile
                      </button>

                      {activeTab === "received" && (
                        <>
                          <button
                            disabled={busyId === record.id}
                            onClick={() =>
                              respondToRequest(record.id, "accepted")
                            }
                            className="bg-cyan-500 hover:bg-cyan-400 text-black px-3 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                          >
                            Accept
                          </button>

                          <button
                            disabled={busyId === record.id}
                            onClick={() =>
                              respondToRequest(record.id, "rejected")
                            }
                            className="bg-red-500/10 border border-red-500/40 text-red-300 px-3 py-2 rounded-lg text-sm disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {activeTab === "following" && (
                        <button
                          disabled={busyId === record.id}
                          onClick={() =>
                            removeRelationship(record.id, "unfollow")
                          }
                          className="border border-red-500/40 text-red-300 px-3 py-2 rounded-lg text-sm disabled:opacity-50"
                        >
                          Unfollow
                        </button>
                      )}

                      {activeTab === "followers" && (
                        <button
                          disabled={busyId === record.id}
                          onClick={() =>
                            removeRelationship(record.id, "remove")
                          }
                          className="border border-red-500/40 text-red-300 px-3 py-2 rounded-lg text-sm disabled:opacity-50"
                        >
                          Remove
                        </button>
                      )}

                      {activeTab === "sent" && (
                        <button
                          disabled={busyId === record.id}
                          onClick={() =>
                            removeRelationship(record.id, "cancel")
                          }
                          className="border border-red-500/40 text-red-300 px-3 py-2 rounded-lg text-sm disabled:opacity-50"
                        >
                          Cancel Request
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
