
"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

type Group = {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  owner_id: string;
};

type GroupMember = {
  id: string;
  username: string | null;
  avatar_url: string | null;
};

type InviteSearchResult = {
  user_id: string;
  username: string | null;
  avatar_url: string | null;
};

function GroupLoading() {
  return (
    <main className="min-h-screen bg-[#07111f] text-white flex items-center justify-center">
      Loading group...
    </main>
  );
}

export default function GroupChatPage() {
  return (
    <Suspense fallback={<GroupLoading />}>
      <GroupChatContent />
    </Suspense>
  );
}

function GroupChatContent() {
  const supabase = useMemo(() => createClient(), []);
  const params = useParams<{ groupId: string }>();
  const router = useRouter();

  const groupId = params.groupId;

  const [userId, setUserId] = useState("");
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editCategory, setEditCategory] = useState("General");

  const [inviteSearch, setInviteSearch] = useState("");
  const [inviteResults, setInviteResults] = useState<InviteSearchResult[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [sendingInviteId, setSendingInviteId] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");

  const isOwner = group?.owner_id === userId;

  useEffect(() => {
    async function initialize() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      setUserId(user.id);

      const { data: membership } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("group_id", groupId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (!membership) {
        router.push("/groups");
        return;
      }

      const { data: groupData, error: groupError } = await supabase
        .from("groups")
        .select("id, name, description, category, owner_id")
        .eq("id", groupId)
        .single();

      if (groupError || !groupData) {
        setMessage("Could not load this group.");
        setLoading(false);
        return;
      }

      setGroup(groupData);
      setEditName(groupData.name);
      setEditDescription(groupData.description || "");
      setEditCategory(groupData.category || "General");

      const { data: memberData, error: memberError } =
        await supabase.rpc("get_group_members", {
          target_group: groupId,
        });

      if (memberError) {
        setMessage("Could not load group members.");
      } else {
        setMembers(memberData || []);
      }

      setLoading(false);
    }

    initialize();
  }, [groupId, router, supabase]);

  async function searchInviteUsers(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setInviteMessage("");
    setInviteResults([]);

    const term = inviteSearch.trim();

    if (term.length < 2) {
      setInviteMessage("Enter at least 2 characters of a username.");
      return;
    }

    setSearchingUsers(true);

    const { data, error } = await supabase.rpc(
      "search_group_invite_users",
      { search_text: term }
    );

    if (error) {
      setInviteMessage("Could not search members: " + error.message);
    } else {
      setInviteResults((data || []) as InviteSearchResult[]);

      if (!data || data.length === 0) {
        setInviteMessage("No matching usernames found.");
      }
    }

    setSearchingUsers(false);
  }

  async function sendInvitation(person: InviteSearchResult) {
    setInviteMessage("");
    setSendingInviteId(person.user_id);

    const { error } = await supabase.rpc("send_group_invitation", {
      group_id: groupId,
      invitee_id: person.user_id,
    });

    if (error) {
      setInviteMessage("Invitation could not be sent: " + error.message);
    } else {
      setInviteMessage(
        `Invitation sent to @${person.username || "member"} successfully.`
      );

      setInviteResults((previous) =>
        previous.filter((item) => item.user_id !== person.user_id)
      );
    }

    setSendingInviteId("");
  }

  async function saveSettings(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (!isOwner) {
      setMessage("Only the group owner can change these settings.");
      return;
    }

    if (editName.trim().length < 3) {
      setMessage("Group name must contain at least 3 characters.");
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from("groups")
      .update({
        name: editName.trim(),
        description: editDescription.trim(),
        category: editCategory,
      })
      .eq("id", groupId)
      .select("id, name, description, category, owner_id")
      .single();

    if (error) {
      setMessage("Could not save settings: " + error.message);
    } else {
      setGroup(data);
      setMessage("Group settings saved successfully.");
    }

    setSaving(false);
  }

  async function deleteGroup() {
    if (!isOwner) {
      setMessage("Only the group owner can delete this group.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to permanently delete this group? This action cannot be undone."
    );

    if (!confirmed) return;

    setDeleting(true);
    setMessage("");

    const { error } = await supabase
      .from("groups")
      .delete()
      .eq("id", groupId);

    if (error) {
      setMessage("Could not delete group: " + error.message);
      setDeleting(false);
      return;
    }

    router.push("/groups");
  }

  if (loading) {
    return <GroupLoading />;
  }

  if (!group) {
    return (
      <main className="min-h-screen bg-[#07111f] text-white p-8">
        {message || "Group not found."}
        <p className="mt-4">
          <Link href="/groups" className="text-cyan-400">
            Back to Groups
          </Link>
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#07111f] text-white px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/groups"
          className="text-cyan-400 hover:text-cyan-300 text-sm"
        >
          ← Back to Groups
        </Link>

        <header className="mt-8 mb-8">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold text-cyan-400">
                {group.name}
              </h1>

              <p className="text-gray-400 mt-2">
                {group.description || "Welcome to this community."}
              </p>

              <p className="text-gray-500 text-sm mt-2">
                {members.length} members
              </p>
            </div>

            {isOwner && (
              <button
                type="button"
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="bg-[#12233a] border border-gray-700 rounded-xl px-4 py-3 hover:border-cyan-400"
              >
                {settingsOpen ? "Close Settings" : "⚙ Group Settings"}
              </button>
            )}
          </div>
        </header>

        {message && (
          <p className="bg-[#12233a] border border-gray-700 p-3 rounded-xl mb-5 text-center text-sm">
            {message}
          </p>
        )}

        <section className="bg-[#12233a] border border-gray-800 rounded-2xl p-5 mb-6">
          <h2 className="text-xl font-bold text-cyan-400 mb-2">
            Invite Members
          </h2>

          <p className="text-gray-400 text-sm mb-4">
            Find people by their username and invite them to this community.
          </p>

          <form onSubmit={searchInviteUsers} className="flex flex-col sm:flex-row gap-3">
            <input
              type="search"
              value={inviteSearch}
              onChange={(e) => setInviteSearch(e.target.value)}
              placeholder="Enter a username..."
              maxLength={50}
              className="flex-1 min-w-0 bg-[#07111f] border border-gray-700 rounded-xl p-3 outline-none focus:border-cyan-400"
            />

            <button
              type="submit"
              disabled={searchingUsers}
              className="bg-cyan-500 text-black font-bold rounded-xl px-5 py-3 hover:bg-cyan-400 disabled:opacity-50"
            >
              {searchingUsers ? "Searching..." : "Search"}
            </button>
          </form>

          {inviteMessage && (
            <p className="text-sm text-cyan-300 mt-4 break-words">
              {inviteMessage}
            </p>
          )}

          {inviteResults.length > 0 && (
            <div className="mt-5 space-y-3">
              {inviteResults.map((person) => (
                <div
                  key={person.user_id}
                  className="flex items-center justify-between gap-3 bg-[#07111f] border border-gray-800 rounded-xl p-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {person.avatar_url ? (
                      <img
                        src={person.avatar_url}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-cyan-950 flex items-center justify-center shrink-0">
                        <span className="text-cyan-400 font-bold">
                          {(person.username || "?")[0].toUpperCase()}
                        </span>
                      </div>
                    )}

                    <span className="font-medium truncate">
                      @{person.username || "member"}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => sendInvitation(person)}
                    disabled={sendingInviteId !== ""}
                    className="shrink-0 bg-cyan-500 text-black font-semibold rounded-lg px-4 py-2 hover:bg-cyan-400 disabled:opacity-50"
                  >
                    {sendingInviteId === person.user_id
                      ? "Sending..."
                      : "Invite"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {settingsOpen && isOwner && (
          <section className="bg-[#12233a] border border-gray-800 rounded-2xl p-5 mb-6">
            <h2 className="text-xl font-bold text-cyan-400 mb-5">
              Group Settings
            </h2>

            <form onSubmit={saveSettings} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Group Name
                </label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  maxLength={60}
                  required
                  className="w-full bg-[#07111f] border border-gray-700 rounded-xl p-3 outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Description
                </label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  className="w-full bg-[#07111f] border border-gray-700 rounded-xl p-3 outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Category
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full bg-[#07111f] border border-gray-700 rounded-xl p-3 outline-none"
                >
                  <option>General</option>
                  <option>Technology</option>
                  <option>Education</option>
                  <option>Business</option>
                  <option>Entertainment</option>
                  <option>Sports</option>
                  <option>Culture</option>
                  <option>Books and Writing</option>
                  <option>Other</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="bg-cyan-500 text-black font-bold rounded-xl px-5 py-3 hover:bg-cyan-400 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </form>

            <div className="border-t border-gray-700 mt-8 pt-6">
              <h3 className="text-red-400 font-bold text-lg">
                Danger Zone
              </h3>

              <p className="text-gray-400 text-sm mt-2 mb-4">
                Permanently delete this group. This action cannot be undone.
              </p>

              <button
                type="button"
                onClick={deleteGroup}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl px-5 py-3 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Group"}
              </button>
            </div>
          </section>
        )}

        <section className="bg-[#12233a] rounded-2xl border border-gray-800 p-5">
          <h2 className="text-xl font-bold text-cyan-400 mb-4">
            Group Members
          </h2>

          <div className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-3">
                {member.avatar_url ? (
                  <img
                    src={member.avatar_url}
                    alt=""
                    className="w-11 h-11 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-11 h-11 rounded-full bg-cyan-950 flex items-center justify-center">
                    <span className="text-cyan-400 font-bold">
                      {(member.username || "?")[0].toUpperCase()}
                    </span>
                  </div>
                )}

                <span className="font-medium">
                  {member.username || "Member"}
                  {member.id === userId && " (You)"}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 bg-[#12233a] rounded-2xl border border-gray-800 p-5">
          <h2 className="text-xl font-bold text-cyan-400">
            Group Conversation
          </h2>

          <p className="text-gray-400 text-sm mt-2">
            Your group messaging interface will be connected next.
          </p>
        </section>
      </div>
    </main>
  );
}
