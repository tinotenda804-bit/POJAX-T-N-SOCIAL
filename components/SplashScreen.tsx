
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type SplashScreenProps = {
  children: React.ReactNode;
};

export default function SplashScreen({
  children,
}: SplashScreenProps) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {children}

      {showSplash && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
          <Image
            src="/pojax-logo.jpg"
            alt="POJAX SOCIAL"
            width={120}
            height={120}
            priority
            className="h-28 w-28 rounded-full object-contain"
          />

          <div className="mt-8 flex items-center gap-2">
            {[0, 1, 2, 3].map((dot) => (
              <span
                key={dot}
                className="h-2.5 w-2.5 animate-bounce rounded-full bg-blue-600"
                style={{
                  animationDelay: `${dot * 150}ms`,
                }}
              />
            ))}
          </div>

          <p className="mt-5 text-sm font-semibold tracking-widest text-gray-600">
            POJAX SOCIAL
          </p>
        </div>
      )}
    </>
  );
}
