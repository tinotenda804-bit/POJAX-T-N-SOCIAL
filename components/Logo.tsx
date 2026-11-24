import Image from "next/image";

type LogoProps = {
  size?: number;
  showText?: boolean;
};

export default function Logo({
  size = 40,
  showText = true,
}: LogoProps) {
  return (
    <div className="flex items-center gap-2">
      <Image
        src="/pojax-logo.jpg"
        alt="POJAX SOCIAL logo"
        width={size}
        height={size}
        priority
        className="rounded-full object-contain"
      />

      {showText && (
        <span className="text-lg font-bold tracking-wide">
          POJAX T-N
        </span>
      )}
    </div>
  );
}