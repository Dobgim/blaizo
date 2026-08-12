import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-[26rem]">
        <p className="eyebrow text-canvas-deep">{siteConfig.name}</p>
        <h1 className="mt-3 text-h2 text-spruce">Sign in</h1>
        <p className="mt-3 text-small text-canvas-deep">
          For the kennel only. Nothing on the public site needs an account.
        </p>

        <LoginForm nextPath={next} />
      </div>
    </div>
  );
}
