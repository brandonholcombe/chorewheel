import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/session';
import { OnboardingForms } from '@/components/OnboardingForms';
import { Brand } from '@/components/Brand';
import { UserBadge } from '@/components/UserBadge';

export default async function OnboardingPage() {
  const user = await currentUser();
  if (!user) redirect('/');

  return (
    <main className="relative mx-auto max-w-md px-6 py-16">
      <header className="mb-10 flex items-center justify-between">
        <Brand />
        <UserBadge />
      </header>
      <h1 className="font-display text-3xl font-black">Get started</h1>
      <p className="mb-8 mt-2 text-sm font-medium text-ink/60">
        Signed in as <span className="font-bold text-ink">{user.name ?? user.email}</span>. Create a
        new household or join one with its invite code.
      </p>
      <OnboardingForms />
    </main>
  );
}
