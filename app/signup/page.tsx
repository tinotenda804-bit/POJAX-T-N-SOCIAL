
"use client";

import { useState, type FormEvent } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { createClient } from "@/lib/supabase";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [countryName, setCountryName] = useState("Malawi");
  const [countryCode, setCountryCode] = useState("MW");
  const [location, setLocation] = useState("");
  const [joinReason, setJoinReason] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const supabase = createClient();

      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone ? `+${phone}` : null,
            country: countryName,
            country_code: countryCode,
            location: location.trim() || null,
            join_reason: joinReason.trim(),
          },
        },
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage(
          "Registration submitted! Please check your email for confirmation."
        );
      }
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg rounded-2xl border border-cyan-900 bg-slate-900 p-6 shadow-xl">
        <h1 className="text-center text-3xl font-bold text-cyan-400">
          POJAX T-N
        </h1>

        <h2 className="mt-3 text-center text-xl font-semibold">
          Create Your Account
        </h2>

        <p className="mt-2 text-center text-sm text-slate-400">
          Connect, share, learn and grow with people around the world.
        </p>

        <form onSubmit={handleSignup} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-400"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-400"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-400"
              placeholder="At least 8 characters"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">
              Phone Number (Optional)
            </label>

            <PhoneInput
              country="mw"
              enableSearch
              searchPlaceholder="Search country..."
              value={phone}
              onChange={(value, data) => {
                setPhone(value);

                if (data && typeof data === "object") {
  const selectedCountry = data as {
    name?: string;
    countryCode?: string;
  };

  setCountryName(selectedCountry.name || "");
  setCountryCode(selectedCountry.countryCode?.toUpperCase() || "");
}
              }}
              inputProps={{
                name: "phone",
                autoComplete: "tel",
              }}
              containerStyle={{ width: "100%" }}
              inputStyle={{
                width: "100%",
                height: "48px",
                background: "#1e293b",
                color: "white",
                border: "1px solid #475569",
                borderRadius: "8px",
              }}
              buttonStyle={{
                background: "#1e293b",
                border: "1px solid #475569",
                borderRadius: "8px 0 0 8px",
              }}
              dropdownStyle={{
                background: "#1e293b",
                color: "white",
              }}
              searchStyle={{
                background: "#1e293b",
                color: "white",
              }}
            />
            <p className="mt-2 text-xs text-slate-400">
              Select your country from the flag menu. Its calling code will update automatically.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm">
              General Location (Optional)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              autoComplete="address-level2"
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-400"
              placeholder="City or district"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">
              Why do you want to join PojaX T-N?
            </label>
            <textarea
              value={joinReason}
              onChange={(e) => setJoinReason(e.target.value)}
              required
              maxLength={500}
              rows={4}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 p-3 text-white outline-none focus:border-cyan-400"
              placeholder="Tell us why you want to join..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-cyan-500 p-3 font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          {message && (
            <p className="break-words text-center text-sm text-cyan-300">
              {message}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
