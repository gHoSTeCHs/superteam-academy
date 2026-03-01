'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SignInForm } from '@/components/auth/sign-in-form';
import { useSession } from '@/hooks/use-session';

export default function SignInPage() {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      router.replace('/dashboard');
    }
  }, [session, router]);

  function handleAuthenticated() {
    router.replace('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <SignInForm onWalletAuth={handleAuthenticated} />
    </div>
  );
}
