import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { Difficulty } from "@/components/Difficulty";

export default async function LabsPage() {
  const session = await auth();
  if (!session?.user) redirect("/giris");

  const userId = (session.user as { id?: string }).id;

  const [categories, solved] = await Promise.all([
    prisma.labCategory.findMany({ include: { labs: true } }),
    userId
      ? prisma.submission.findMany({
          where: { userId, correct: true },
          select: { labId: true },
        })
      : Promise.resolve([] as { labId: string }[]),
  ]);
  const solvedIds = new Set(solved.map((s) => s.labId));

  return (
    <AppShell userLabel={(session.user as { name?: string }).name ?? undefined}>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <h1 className="text-3xl font-semibold">Laboratuvarlar</h1>
        <p className="mt-1 max-w-xl text-ink-dim">
          Her laboratuvar kendi izole ağında çalışır. Gerçek dünyaya erişim
          yoktur.
        </p>

        {categories.length === 0 && (
          <p className="mt-10 rounded-lg border border-line bg-surface px-5 py-10 text-center text-sm text-ink-dim">
            Henüz laboratuvar eklenmemiş.
          </p>
        )}

        {categories.map((cat) => {
          const done = cat.labs.filter((l) => solvedIds.has(l.id)).length;
          return (
            <section key={cat.id} className="mt-10">
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-accent-soft text-accent">
                  <Icon name={cat.icon} className="h-[18px] w-[18px]" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <h2 className="text-lg font-semibold">{cat.name}</h2>
                    <span className="shrink-0 text-xs text-ink-faint">
                      {done}/{cat.labs.length} çözüldü
                    </span>
                  </div>
                  <p className="text-sm text-ink-dim">{cat.description}</p>
                </div>
              </div>

              <div className="mt-4 overflow-hidden rounded-lg border border-line bg-surface">
                {cat.labs.map((lab) => {
                  const isSolved = solvedIds.has(lab.id);
                  return (
                    <Link
                      key={lab.id}
                      href={`/laboratuvarlar/${lab.slug}`}
                      className="group flex flex-col gap-3 border-b border-line px-5 py-4 transition-colors last:border-0 hover:bg-paper sm:flex-row sm:items-center sm:gap-5"
                    >
                      <div className="flex min-w-0 flex-1 items-start gap-3">
                        {isSolved ? (
                          <Icon name="check" className="mt-0.5 h-[18px] w-[18px] text-ok" />
                        ) : (
                          <span className="mt-0.5 h-[18px] w-[18px] shrink-0 rounded-full border border-line" />
                        )}
                        <div className="min-w-0">
                          <h3 className="text-[15px] font-semibold">{lab.title}</h3>
                          <p className="mt-0.5 text-sm leading-relaxed text-ink-dim">
                            {lab.summary}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-5 pl-[30px] sm:pl-0">
                        <Difficulty difficulty={lab.difficulty} />
                        <span className="w-16 text-sm tabular-nums text-ink-dim sm:text-right">
                          {lab.points} puan
                        </span>
                        <Icon
                          name="chevronRight"
                          className="ml-auto hidden h-4 w-4 text-ink-faint transition-colors group-hover:text-accent sm:block"
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </AppShell>
  );
}
