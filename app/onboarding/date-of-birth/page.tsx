
"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DateOfBirthPage() {
  const router = useRouter();

  const [currentYear, setCurrentYear] = useState(2026);
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const months = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December",
  ];

  const years = useMemo(
    () =>
      Array.from(
        { length: Math.max(1, currentYear - 1899) },
        (_, index) => String(currentYear - index)
      ),
    [currentYear]
  );

  const daysInMonth = useMemo(() => {
    if (!month || !year) return 31;

    return new Date(
      Number(year),
      Number(month),
      0
    ).getDate();
  }, [month, year]);

  const days = useMemo(
    () => Array.from({ length: daysInMonth }, (_, index) => index + 1),
    [daysInMonth]
  );

  function handleContinue(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (!day || !month || !year) {
      setMessage("Please select your day, month and year of birth.");
      return;
    }

    const formattedDate =
      `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

    const selectedDate = new Date(`${formattedDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (
      Number.isNaN(selectedDate.getTime()) ||
      selectedDate > today
    ) {
      setMessage("Please select a valid date that is not in the future.");
      return;
    }

    try {
      const savedDetails = sessionStorage.getItem(
        "pojax_registration_details"
      );

      if (!savedDetails) {
        setMessage(
          "Your personal details could not be found. Please return to the first step."
        );
        return;
      }

      sessionStorage.setItem("pojax_date_of_birth", formattedDate);

      router.push("/onboarding/password");
    } catch {
      setMessage("Something went wrong. Please try again.");
    }
  }

  const selectClass =
    "w-full rounded-lg border border-slate-700 bg-[#050914] p-3 text-white outline-none transition focus:border-cyan-400";

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050914] px-4 py-10 text-white">
      <div className="w-full max-w-lg rounded-2xl border border-cyan-500/30 bg-[#0b1628] p-6 shadow-2xl shadow-cyan-950/30 sm:p-8">
        <h1 className="text-center text-3xl font-bold tracking-wide text-cyan-400">
          POJAX T-N
        </h1>

        <h2 className="mt-4 text-center text-2xl font-semibold">
          When Is Your Birthday?
        </h2>

        <p className="mt-2 text-center text-sm leading-6 text-slate-400">
          Select your date of birth below.
        </p>

        <div className="mt-6 flex justify-center gap-2">
          <span className="h-1.5 w-10 rounded-full bg-cyan-400" />
          <span className="h-1.5 w-10 rounded-full bg-cyan-400" />
          <span className="h-1.5 w-10 rounded-full bg-slate-700" />
        </div>

        <p className="mt-2 text-center text-xs text-slate-500">
          Step 2 of registration
        </p>

        <form onSubmit={handleContinue} className="mt-8 space-y-6">
          <div>
            <label className="mb-3 block text-sm font-medium">
              Date of Birth
            </label>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-2 block text-xs text-slate-400">
                  Day
                </label>
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  required
                  className={selectClass}
                >
                  <option value="">DD</option>
                  {days.map((number) => (
                    <option key={number} value={number}>
                      {String(number).padStart(2, "0")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs text-slate-400">
                  Month
                </label>
                <select
                  value={month}
                  onChange={(e) => {
                    setMonth(e.target.value);
                    setDay("");
                  }}
                  required
                  className={selectClass}
                >
                  <option value="">MM</option>
                  {months.map((name, index) => (
                    <option key={name} value={String(index + 1)}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs text-slate-400">
                  Year
                </label>
                <select
                  value={year}
                  onChange={(e) => {
                    setYear(e.target.value);
                    setDay("");
                  }}
                  required
                  className={selectClass}
                >
                  <option value="">YYYY</option>
                  {years.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-400">
              Your date of birth is private and should not appear on
              your public profile.
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

          <Link
            href="/signup"
            className="block w-full rounded-lg border border-slate-700 p-3 text-center text-sm text-slate-300 transition hover:border-cyan-400 hover:text-cyan-400"
          >
            Back to Personal Details
          </Link>
        </form>
      </div>
    </main>
  );
}
