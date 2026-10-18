import type { NextConfig } from "next";

// News cover/step images are uploaded to Supabase Storage (public bucket),
// so next/image must be allowed to load from the project's host.
const supabaseHost = (() => {
  try {
    return new URL(process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname;
  } catch {
    return null;
  }
})();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
};

export default nextConfig;
