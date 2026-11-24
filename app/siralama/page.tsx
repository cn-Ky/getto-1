import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";

export default async function LeaderboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/giris");

  const currentId = (session.user as { id?: string }).id;

  const users = await prisma.user.findMany({
    orderBy: { totalPoints: "desc" },
    take: 25,
    select: { id: true, username: true, displayName: true, totalPoints: true },
  });

  return (
    <AppShell userLabel={(session.user as { name?: string }).name ?? undefined}>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="text-3xl font-semibold">Sıralama</h1>
        <p className="mt-1 text-ink-dim">
          Tüm izole laboratuvarlardan toplanan puanlara göre ilk 25.
        </p>

        <div className="mt-8 overflow-hidden rounded-lg border border-line bg-surface">
          {users.map((u, i) => {
            const isMe = u.id === currentId;
            const leader = i === 0 && u.totalPoints > 0;
            return (
              <div
                key={u.id}
                className={`flex items-center justify-between gap-4 border-b border-line px-5 py-3.5 last:border-0 ${
                  isMe ? "bg-accent-soft" : ""
                }`}
              >
                <div className="flex min-w-0 items-center gap-4">
                  <span
                    className={`w-7 text-right font-display text-lg font-semibold tabular-nums ${
                      i < 3 ? "text-ink" : "text-ink-faint"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="truncate text-sm font-medium">
                    {u.displayName ?? u.username}
                  </span>
                  {isMe && (
                    <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-white">
                      Sen
                    </span>
                  )}
                  {leader && <Icon name="trophy" className="h-4 w-4 text-warn" />}
                </div>
                <span className="shrink-0 text-sm tabular-nums text-ink-dim">
                  <span className="font-semibold text-ink">{u.totalPoints}</span>{" "}
                  puan
                </span>
              </div>
            );
          })}
          {users.length === 0 && (
            <p className="px-5 py-10 text-center text-sm text-ink-dim">
              Henüz kimse puan almadı. İlk laboratuvarı çözen sıralamaya girer.
            </p>
          )}
        </div>
      </div>
    </AppShell>
  );
}
