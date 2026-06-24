import { PropsWithChildren } from "react";

export default function GlassCard({
  children,
  className = "",
}: PropsWithChildren<{ className?: string }>) {
  return (
    <section
      className={`rounded-2xl border border-[#27272A]/80 bg-[#18181B]/50 backdrop-blur-xl shadow-[0_0_0_1px_rgba(250,204,21,0.0)] transition-all duration-300 hover:border-[#FACC15]/40 hover:shadow-[0_0_40px_rgba(250,204,21,0.08)] ${className}`}
    >
      {children}
    </section>
  );
}

