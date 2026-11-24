import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { btnPrimary } from "@/components/ui";

const STATUS: Record<string, { label: string; className: string }> = {
  PROVISIONING: { label: "Hazırlanıyor", className: "bg-warn-soft text-warn" },
  RUNNING: { label: "Çalışıyor", className: "bg-accent-soft text-accent-strong" },
  COMPLETED: { label: "Tamamlandı", className: "bg-ok-soft text-ok" },
  EXPIRED: { label: "Süresi doldu", className: "bg-paper text-ink-dim" },
  FAILED: { label: "Başarısız", className: "bg-danger-soft text-danger" },
};

export default async function PanelPage() {
  const session = await auth();
  if (!session?.user) redirect("/giris");

  const user = await prisma.user.findUnique({
    where: { id: (session.user as { id: string }).id },
    include: {
      submissions: { where: { correct: true }, include: { lab: true } },
      sessions: { orderBy: { startedAt: "desc" }, take: 5, include: { lab: true } },
    },
  });

  if (!user) redirect("/giris");

  const totalLabs = await prisma.lab.count();
  const completed = new Set(user.submissions.map((s) => s.labId)).size;
  const percent = totalLabs > 0 ? Math.round((completed / totalLabs) * 100) : 0;

  return (
    <AppShell userLabel={user.username}>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="text-3xl font-semibold">
          Merhaba, {user.displayName ?? user.username}
        </h1>
        <p className="mt-1 text-ink-dim">İlerlemenin özeti aşağıda.</p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.7fr]">
          {/* İlerleme */}
          <section className="rounded-lg border border-line bg-surface p-5">
            <div className="flex items-center gap-2 text-sm text-ink-dim">
              <Icon name="trophy" />
              Toplam puan
            </div>
            <div className="mt-1 font-display text-5xl font-bold tabular-nums">
              {user.totalPoints}
            </div>

            <div className="mt-6 border-t border-line pt-5">
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-ink-dim">Tamamlanan laboratuvar</span>
                <span className="font-semibold tabular-nums">
                  {completed} / {totalLabs}
                </span>
              </div>
              <div
                className="mt-2 h-2 overflow-hidden rounded-full bg-paper"
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Tamamlanan laboratuvar oranı"
              >
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>

            <Link href="/laboratuvarlar" className={`${btnPrimary} mt-6 w-full`}>
              Laboratuvarlara git
              <Icon name="arrowRight" />
            </Link>
          </section>

          {/* Son oturumlar */}
          <section>
            <h2 className="text-lg font-semibold">Son oturumlar</h2>
            <div className="mt-3 overflow-hidden rounded-lg border border-line bg-surface">
              {user.sessions.length === 0 && (
                <div className="px-5 py-10 text-center">
                  <p className="text-sm text-ink-dim">
                    Henüz bir laboratuvar oturumu başlatmadın.
                  </p>
                  <Link
                    href="/laboratuvarlar"
                    className="mt-2 inline-block text-sm font-medium text-accent hover:underline"
                  >
                    İlk laboratuvarını seç
                  </Link>
                </div>
              )}
              {user.sessions.map((s) => {
                const st = STATUS[s.status] ?? STATUS.EXPIRED;
                return (
                  <Link
                    key={s.id}
                    href={`/laboratuvarlar/${s.lab.slug}`}
                    className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5 transition-colors last:border-0 hover:bg-paper"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">
                        {s.lab.title}
                      </div>
                      <div className="text-xs text-ink-faint">
                        {new Date(s.startedAt).toLocaleString("tr-TR", {
                          dateStyle: "medium",
                          timeStyle: "short",
                          timeZone: "Europe/Istanbul",
                        })}
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${st.className}`}
                    >
                      {st.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
