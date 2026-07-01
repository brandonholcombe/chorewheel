import { redirect } from 'next/navigation';
import { currentUser } from '@/lib/session';
import { OnboardingForms } from '@/components/OnboardingForms';
import { SignOutButton } from '@/components/AuthButtons';

export default async function OnboardingPage() {
  const user = await currentUser();
  if (!user) redirect('/');

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Get started</h1>
        <SignOutButton />
      </header>
      <p className="mb-8 text-sm text-neutral-500">
        Signed in as {user.name ?? user.email}. Create a new household or join an existing one with
        its invite code.
      </p>
      <OnboardingForms />
    </main>
  );
}
