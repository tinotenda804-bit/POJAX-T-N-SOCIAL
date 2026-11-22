
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

type Group = {
  id: string;
  name: string;
  description: string;
  category: string;
  owner_id: string;
  created_at: string;
};

export default function GroupsPage() {
  const supabase = createClient();

  const [groups, setGroups] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<string[]>([]);
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function initialize() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      setUserId(user.id);
      await loadGroups(user.id);
    }

    initialize();
  }, []);

  async function loadGroups(id: string) {
    setLoading(true);

    const { data: groupData, error: groupError } = await supabase
      .from("groups")
      .select("*")
      .order("created_at", { ascending: false });

    if (groupError) {
      setMessage("Could not load groups. Please try again.");
      setLoading(false);
      return;
    }

    const { data: memberData, error: memberError } = await supabase
      .from("group_members")
      .select("group_id")
      .eq("user_id", id);

    if (memberError) {
      setMessage("Could not load your group memberships.");
      setLoading(false);
      return;
    }

    setGroups(groupData || []);
    setMyGroups((memberData || []).map((item) => item.group_id));
    setLoading(false);
  }

  async function createGroup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (!name.trim()) {
      setMessage("Please enter a group name.");
      return;
    }

    if (name.trim().length < 3 || name.trim().length > 60) {
      setMessage("Group name must contain 3–60 characters.");
      return;
    }

    if (description.length > 1000) {
      setMessage("Description must be 1000 characters or fewer.");
      return;
    }

    setCreating(true);

    const { data, error } = await supabase
      .from("groups")
      .insert({
        name: name.trim(),
        description: description.trim(),
        category,
        owner_id: userId,
      })
      .select()
      .single();

    if (error) {
      setMessage("Could not create group: " + error.message);
      setCreating(false);
      return;
    }

    const { error: joinError } = await supabase
      .from("group_members")
      .insert({
        group_id: data.id,
        user_id: userId,
      });

    if (joinError) {
      setMessage(
        "Group created, but automatic membership failed. Please try joining it."
      );
    } else {
      setMessage("Your group was created successfully!");
    }

    setName("");
    setDescription("");
    setCategory("General");

    await loadGroups(userId);
    setCreating(false);
  }

  async function joinGroup(groupId: string) {
    setMessage("");

    const { error } = await supabase
      .from("group_members")
      .insert({
        group_id: groupId,
        user_id: userId,
      });

    if (error) {
      setMessage("Could not join group: " + error.message);
      return;
    }

    setMyGroups((previous) => [...previous, groupId]);
    setMessage("You have joined the group!");
  }

  async function leaveGroup(groupId: string) {
    setMessage("");

    const { error } = await supabase
      .from("group_members")
      .delete()
      .eq("group_id", groupId)
      .eq("user_id", userId);

    if (error) {
      setMessage("Could not leave group: " + error.message);
      return;
    }

    setMyGroups((previous) =>
      previous.filter((id) => id !== groupId)
    );

    setMessage("You have left the group.");
  }

  const filteredGroups = groups.filter((group) =>
    `${group.name} ${group.description} ${group.category}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#07111f] text-white px-4 py-8">
      <div className="max-w-5xl mx-auto">

        <Link
          href="/dashboard"
          className="text-cyan-400 hover:text-cyan-300 text-sm"
        >
          ← Back to Dashboard
        </Link>

        <header className="text-center mt-10 mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-cyan-400">
            POJAX PUBLIC GROUPS
          </h1>

          <p className="text-gray-400 mt-3">
            Discover communities, connect with people and share ideas.
          </p>
        </header>

        {message && (
          <div className="bg-[#12233a] border border-cyan-900 rounded-xl p-3 mb-6 text-center text-sm">
            {message}
          </div>
        )}

        <section className="bg-[#12233a] border border-gray-800 rounded-2xl p-5 mb-8">
          <h2 className="text-xl font-bold text-cyan-400 mb-4">
            Create a New Group
          </h2>

          <form onSubmit={createGroup} className="space-y-4">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Group name"
              maxLength={60}
              required
              className="w-full bg-[#07111f] border border-gray-700 rounded-xl p-3 outline-none focus:border-cyan-400"
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your group..."
              maxLength={1000}
              rows={3}
              className="w-full bg-[#07111f] border border-gray-700 rounded-xl p-3 outline-none focus:border-cyan-400"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
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

            <button
              type="submit"
              disabled={creating}
              className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold rounded-xl py-3"
            >
              {creating ? "Creating..." : "Create Group"}
            </button>
          </form>
        </section>

        <section>
          <h2 className="text-xl font-bold mb-4">
            Discover Groups
          </h2>

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search public groups..."
            className="w-full bg-[#12233a] border border-gray-700 rounded-xl p-3 mb-5 outline-none focus:border-cyan-400"
          />

          {loading ? (
            <p className="text-center text-gray-400 py-10">
              Loading groups...
            </p>
          ) : filteredGroups.length === 0 ? (
            <div className="text-center bg-[#12233a] rounded-xl p-8">
              <p className="text-gray-300">
                No groups found.
              </p>

              <p className="text-gray-500 text-sm mt-2">
                Create the first community on PojaX!
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredGroups.map((group) => {
                const joined = myGroups.includes(group.id);
                const isOwner = group.owner_id === userId;

                return (
                  <article
                    key={group.id}
                    className="bg-[#12233a] border border-gray-800 hover:border-cyan-700 rounded-2xl p-5"
                  >
                    <span className="text-xs text-cyan-400 bg-cyan-950 px-3 py-1 rounded-full">
                      {group.category}
                    </span>

                    <h3 className="text-lg font-bold mt-3">
                      {group.name}
                    </h3>

                    <p className="text-gray-400 text-sm mt-2 whitespace-pre-wrap break-words">
                      {group.description || "No description provided."}
                    </p>

                    <div className="flex items-center justify-between mt-5 gap-3">
                      <span className="text-xs text-gray-500">
                        {isOwner ? "Created by you" : "Public community"}
                      </span>

                      {joined ? (
                        <div className="flex gap-2">
                          <Link
                            href={`/groups/${group.id}`}
                            className="text-sm bg-cyan-500 text-black font-semibold rounded-lg px-4 py-2 hover:bg-cyan-400"
                          >
                            Enter Group
                          </Link>

                          <button
                            type="button"
                            onClick={() => leaveGroup(group.id)}
                            disabled={isOwner}
                            className="text-sm border border-gray-600 rounded-lg px-4 py-2 hover:border-red-400 disabled:opacity-50"
                          >
                            {isOwner ? "Owner" : "Leave Group"}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => joinGroup(group.id)}
                          className="text-sm bg-cyan-500 text-black font-semibold rounded-lg px-4 py-2 hover:bg-cyan-400"
                        >
                          Join Group
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
