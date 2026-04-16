"use client";

import { FcGoogle } from "react-icons/fc";
import { FaGithub, FaFacebook } from "react-icons/fa";

export function SocialButtons() {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

  const handleOAuth = (provider: "google" | "github" | "facebook") => {
    // The backend endpoint returns a redirect URL to the provider
    // This is better than doing it front-end only, as state is saved in httpOnly cookie
    window.location.href = `${backendUrl}/auth/oauth/${provider}`;
  };

  return (
    <div className="flex flex-row justify-center gap-3 w-full">
      <button
        type="button"
        onClick={() => handleOAuth("google")}
        className="flex-1 flex items-center justify-center p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] text-white font-medium transition-all duration-200 group hover:cursor-pointer"
        aria-label="Continue with Google"
      >
        <FcGoogle className="text-xl group-hover:scale-110 transition-transform" />
      </button>
      <button
        type="button"
        onClick={() => handleOAuth("github")}
        className="flex-1 flex items-center justify-center p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] text-white font-medium transition-all duration-200 group hover:cursor-pointer"
        aria-label="Continue with GitHub"
      >
        <FaGithub className="text-xl group-hover:scale-110 transition-transform" />
      </button>
      <button
        type="button"
        onClick={() => handleOAuth("facebook")}
        className="flex-1 flex items-center justify-center p-3 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] hover:border-white/[0.1] text-white font-medium transition-all duration-200 group hover:cursor-pointer"
        aria-label="Continue with Facebook"
      >
        <FaFacebook className="text-xl text-[#1877F2] group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );
}
