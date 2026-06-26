import type { NextConfig } from "next";

// Root cause of the Turbopack workspace warning:
// Next.js scans the *workspace* for package-lock.json files to infer the root.
// In this repo you have multiple lockfiles (repo-level and marketmind/).
// That inference is ambiguous, so Next.js prints a warning.
//
// Fix: explicitly set Turbopack root to the folder that contains the actual app.
// This keeps functionality unchanged and makes the warning go away.
const nextConfig: NextConfig = {
  // IMPORTANT:
  // Turbopack.root must be absolute; Next.js also validates distDirRoot stays within projectPath.
  // The correct project root for this Next.js app is the current `marketmind/` folder.
  // Setting turbopack.root to an absolute path inside the project avoids both the workspace warning
  // and the distDirRoot panic.
  turbopack: {
    root: "C:\\Users\\Mihir\\OneDrive\\Desktop\\MarketMindProject\\marketmind",
  },
};

export default nextConfig;


