"use client";

import { Loader2Icon } from "lucide-react";
import { SignInForm } from "@/components/auth/sign-in-form";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "@/i18n/navigation";

export default function SignInPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  function handleAuthenticated() {
    router.replace("/");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <SignInForm onWalletAuth={handleAuthenticated} />
    </div>
  );
}
