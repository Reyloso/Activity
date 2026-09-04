import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Activity Milio - Inicia sesión",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { blocked } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <LoginForm blocked={blocked === "1"} />
    </div>
  );
}
