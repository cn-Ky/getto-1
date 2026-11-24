import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { Difficulty } from "@/components/Difficulty";
import { LabConsole } from "./LabConsole";

export default async function LabDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/giris");

  const { slug } = await params;
  const lab = await prisma.lab.findUnique({
    where: { slug },
    include: { category: true },
  });
  if (!lab) notFound();

  const tools = lab.toolTags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <AppShell userLabel={(session.user as { name?: string }).name ?? undefined}>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <nav
          aria-label="Konum"
          className="flex items-center gap-1.5 text-sm text-ink-dim"
        >
          <Link href="/laboratuvarlar" className="hover:text-ink hover:underline">
            Laboratuvarlar
          </Link>
          <Icon name="chevronRight" className="h-3.5 w-3.5 text-ink-faint" />
          <span>{lab.category.name}</span>
        </nav>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <h1 className="text-3xl font-semibold">{lab.title}</h1>
          <div className="flex items-center gap-4 pt-2">
            <Difficulty difficulty={lab.difficulty} />
            <span className="rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold tabular-nums text-accent-strong">
              {lab.points} puan
            </span>
          </div>
        </div>

        {tools.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-ink-dim">Araçlar:</span>
            {tools.map((t) => (
              <span
                key={t}
                className="rounded-md border border-line bg-surface px-2 py-0.5 font-mono text-xs text-ink-dim"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <section className="mt-6 rounded-lg border border-line bg-surface p-5 sm:p-6">
          <h2 className="text-base font-semibold">Senaryo</h2>
          <p className="mt-2 max-w-prose leading-relaxed text-ink">
            {lab.briefing}
          </p>
          <p className="mt-4 flex items-start gap-2 border-t border-line pt-4 text-sm text-ink-dim">
            <Icon name="lock" className="mt-0.5 h-4 w-4" />
            Bu laboratuvar, platformun kendi izole ağındaki kurgusal bir hedefe
            karşı çalışır. Gerçek dünyaya erişim yoktur.
          </p>
        </section>

        <LabConsole slug={lab.slug} />
      </div>
    </AppShell>
  );
}
