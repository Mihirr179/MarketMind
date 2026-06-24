"use client";

import { useEffect, useState } from "react";
import ProfileDropdown from "@/components/ui/ProfileDropdown";



type StoredUser = {
  name?: string;
  email?: string;
};

export default function TopNavbar() {
  const [user, setUser] = useState<StoredUser>({});


  useEffect(() => {
    const syncUser = () => {
      try {
        setUser(JSON.parse(localStorage.getItem("user") || "{}"));
      } catch {
        setUser({});
      }
    };

    syncUser();
    window.addEventListener("marketmind:user-updated", syncUser);
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener("marketmind:user-updated", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  const displayName = user.name?.trim() || "User";

  return (
    <header className="sticky top-0 z-30 flex min-h-20 items-center justify-end border-b border-zinc-800 bg-black/85 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 sm:gap-3">
        <ProfileDropdown userName={displayName} />
      </div>
    </header>
  );
}

