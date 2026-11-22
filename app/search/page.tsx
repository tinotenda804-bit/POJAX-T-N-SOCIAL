
"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

type SearchCategory = "all" | "posts" | "people";

type SearchPost = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
};

type SearchPerson = {
  user_id: string;
  display_name: string;
};

export default function SearchPage() {
  const supabase = createClient();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SearchCategory>("all");
  const [posts, setPosts] = useState<SearchPost[]>([]);
  const [people, setPeople] = useState<SearchPerson[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const term = query.trim();

    if (!term) {
      setError("Please enter something to search.");
      return;
    }

    setLoading(true);
    setSearched(true);
    setError("");
    setPosts([]);
    setPeople([]);

    try {
      if (category === "all" || category === "posts") {
        const { data, error: postError } = await supabase
          .from("posts")
          .select("id, user_id, content, created_at")
          .ilike("content", `%${term}%`)
          .order("created_at", { ascending: false })
          .limit(30);

        if (postError) throw postError;

        setPosts(data || []);
      }

      if (category === "all" || category === "people") {
        const { data, error: peopleError } = await supabase
          .from("member_directory")
          .select("user_id, display_name")
          .ilike("display_name", `%${term}%`)
          .order("display_name", { ascending: true })
          .limit(30);

        if (peopleError) throw peopleError;

        setPeople(data || []);
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#07111f] text-white px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/dashboard"
          className="text-cyan-400 hover:text-cyan-300 text-sm"
        >
          ← Back to Dashboard
        </Link>

        <div className="text-center mt-10 mb-8">
          <h1 className="text-3xl font-bold text-cyan-400">
            POJAX GLOBAL SEARCH
          </h1>
          <p className="text-gray-400 mt-2">
            Find people, posts and ideas across PojaX.
          </p>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex items-center bg-[#12233a] border border-cyan-900 rounded-xl px-4">
            <span className="text-cyan-400 text-xl mr-3">⌕</span>

            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts, people and more..."
              className="w-full bg-transparent py-4 outline-none text-white placeholder-gray-500"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {([
              ["all", "Everything"],
              ["posts", "Posts"],
              ["people", "People"],
            ] as [SearchCategory, string][]).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setCategory(value)}
                className={`px-4 py-2 rounded-full text-sm border ${
                  category === value
                    ? "bg-cyan-500 text-black border-cyan-400"
                    : "bg-[#12233a] text-gray-300 border-gray-700"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-bold py-3 rounded-xl"
          >
            {loading ? "Searching..." : "Search PojaX"}
          </button>
        </form>

        {error && (
          <p className="text-red-400 mt-5 text-center">{error}</p>
        )}

        {searched && !loading && !error && (
          <div className="mt-8 space-y-8">
            {(category === "all" || category === "people") && (
              <section>
                <h2 className="text-xl font-bold text-cyan-400 mb-4">
                  People ({people.length})
                </h2>

                {people.length === 0 ? (
                  <p className="text-gray-500">No people found.</p>
                ) : (
                  <div className="space-y-3">
                    {people.map((person) => (
                      <Link
                        key={person.user_id}
                        href={`/member/${person.user_id}`}
                        className="block bg-[#12233a] border border-gray-800 hover:border-cyan-500 rounded-xl p-4"
                      >
                        <h3 className="font-semibold">
                          {person.display_name}
                        </h3>

                        <p className="text-gray-400 text-sm mt-1">
                          PojaX member
                        </p>

                        <p className="text-cyan-400 text-xs mt-2">
                          View member profile →
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            )}

            {(category === "all" || category === "posts") && (
              <section>
                <h2 className="text-xl font-bold text-cyan-400 mb-4">
                  Posts ({posts.length})
                </h2>

                {posts.length === 0 ? (
                  <p className="text-gray-500">No posts found.</p>
                ) : (
                  <div className="space-y-3">
                    {posts.map((post) => (
                      <article
                        key={post.id}
                        className="bg-[#12233a] border border-gray-800 rounded-xl p-4"
                      >
                        <p className="text-white whitespace-pre-wrap break-words">
                          {post.content}
                        </p>

                        <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
                          <Link
                            href={`/member/${post.user_id}`}
                            className="text-cyan-400 hover:underline"
                          >
                            View author
                          </Link>

                          <span>
                            {new Date(post.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
