
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

type CountryData = {
  name?: string;
  countryCode?: string;
};

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [countryName, setCountryName] = useState("Malawi");
  const [countryCode, setCountryCode] = useState("MW");
  const [message, setMessage] = useState("");

  function handleContinue(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (phone.replace(/\D/g, "").length < 7) {
      setMessage("Please enter a valid phone number.");
      return;
    }

    try {
      const personalDetails = {
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: `+${phone}`,
        countryName,
        countryCode,
      };

      sessionStorage.setItem(
        "pojax_registration_details",
        JSON.stringify(personalDetails)
      );

      router.push("/onboarding/date-of-birth");
    } catch {
      setMessage("Unable to continue. Please try again.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050914] px-4 py-10 text-white">
      <div className="w-full max-w-lg rounded-2xl border border-cyan-500/30 bg-[#0b1628] p-6 shadow-2xl shadow-cyan-950/30 sm:p-8">
        <h1 className="text-center text-3xl font-bold tracking-wide text-cyan-400">
          POJAX T-N
        </h1>

        <h2 className="mt-4 text-center text-2xl font-semibold">
          Create Your Account
        </h2>

        <p className="mt-2 text-center text-sm text-slate-400">
          Let's get to know you. Start with your personal details.
        </p>

        <div className="mt-6 flex justify-center gap-2">
          <span className="h-1.5 w-10 rounded-full bg-cyan-400" />
          <span className="h-1.5 w-10 rounded-full bg-slate-700" />
          <span className="h-1.5 w-10 rounded-full bg-slate-700" />
        </div>

        <p className="mt-2 text-center text-xs text-slate-500">
          Step 1 of registration
        </p>

        <form onSubmit={handleContinue} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Full Name
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              autoComplete="name"
              className="w-full rounded-lg border border-slate-700 bg-[#050914] p-3 outline-none transition focus:border-cyan-400"
              placeholder="Enter your full name"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-lg border border-slate-700 bg-[#050914] p-3 outline-none transition focus:border-cyan-400"
              placeholder="Enter your email address"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Phone Number <span className="text-cyan-400">Required</span>
            </label>

            <PhoneInput
              country="mw"
              enableSearch
              searchPlaceholder="Search country..."
              value={phone}
              onChange={(value, data) => {
                setPhone(value);

                if (data && typeof data === "object") {
                  const selected = data as CountryData;
                  setCountryName(selected.name || "");
                  setCountryCode(
                    selected.countryCode?.toUpperCase() || ""
                  );
                }
              }}
              inputProps={{
                name: "phone",
                required: true,
                autoComplete: "tel",
              }}
              containerStyle={{ width: "100%" }}
              inputStyle={{
                width: "100%",
                height: "48px",
                background: "#050914",
                color: "white",
                border: "1px solid #334155",
                borderRadius: "8px",
              }}
              buttonStyle={{
                background: "#0b1628",
                border: "1px solid #334155",
                borderRadius: "8px 0 0 8px",
              }}
              dropdownStyle={{
                background: "#0b1628",
                color: "white",
              }}
              searchStyle={{
                background: "#050914",
                color: "white",
              }}
            />

            <p className="mt-2 text-xs text-slate-400">
              Select your country using the flag menu. The international
              calling code updates automatically.
            </p>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-cyan-500 p-3 font-bold text-[#050914] transition hover:bg-cyan-300"
          >
            Continue
          </button>

          {message && (
            <p className="break-words text-center text-sm text-rose-300">
              {message}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
