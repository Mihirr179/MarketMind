import React from "react";

export default function GlassButton({
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { className?: string }) {
  return (
    <button
      {...props}
      className={`rounded-xl px-6 py-4 font-bold transition focus:outline-none focus:ring-2 focus:ring-[#FACC15]/50 ${
        className || ""
      }`}
    />
  );
}

