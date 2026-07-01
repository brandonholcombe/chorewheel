import { currentUser } from '@/lib/session';
import { SignOutButton } from '@/components/AuthButtons';

// Signed-in user chip for the top-right of headers: avatar + first name, with
// a sign-out control. Server component — reads the session directly.
export async function UserBadge() {
  const user = await currentUser();
  if (!user) return null;

  const firstName = (user.name ?? user.email).split(' ')[0];
  const initial = firstName.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 rounded-full border border-ink/12 bg-panel/85 py-1 pl-1 pr-3 shadow-sm backdrop-blur-md">
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.image}
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 rounded-full border border-ink/10 object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="grid h-7 w-7 place-items-center rounded-full bg-brand text-sm font-bold text-white">
            {initial}
          </span>
        )}
        <span className="max-w-[8rem] truncate text-sm font-semibold">{firstName}</span>
      </div>
      <SignOutButton />
    </div>
  );
}
