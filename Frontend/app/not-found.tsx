import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-grid relative min-h-screen w-full flex items-center justify-center bg-[#1C1C1C]">
      <div className="relative z-10 flex flex-col items-center rounded-lg border border-[#222] bg-[#161616] max-w-sm w-[90vw] mx-auto px-8 py-10 text-center">
        <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#3ECF8E] to-[#4EEEA0] mb-4">
          404
        </div>
        <h1 className="text-xl font-medium text-white mb-2">Page not found</h1>
        <p className="text-zinc-400 text-sm mb-6">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="px-6 py-2.5 rounded-[4px] bg-[#3ECF8E] text-[#1C1C1C] text-sm font-medium hover:bg-[#4EEEA0] transition-all"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
