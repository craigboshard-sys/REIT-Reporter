import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const supabase = await createClient();

  const { data: company } = await supabase
    .from("companies")
    .select(
      "id, name, jse_code, sector, description, website_url, has_international_exposure",
    )
    .eq("jse_code", code.toUpperCase())
    .maybeSingle();

  if (!company) notFound();

  const { data: people, error } = await supabase
    .from("company_people")
    .select("full_name, role_title, is_executive, bio")
    .eq("company_id", company.id)
    .order("is_executive", { ascending: false });

  const executives = (people ?? []).filter((p) => p.is_executive);
  const nonExecutives = (people ?? []).filter((p) => !p.is_executive);

  return (
    <div>
      <Link href="/companies" className="text-sm text-zinc-500 hover:underline">
        ← Company Profiles
      </Link>

      <div className="flex items-center justify-between mt-3 mb-2">
        <h1 className="text-2xl font-semibold tracking-tight">{company.name}</h1>
        <span className="text-sm font-mono text-zinc-500 dark:text-zinc-400">
          {company.jse_code}
        </span>
      </div>
      <div className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
        {company.sector}
        {company.has_international_exposure && " · International exposure"}
      </div>
      {company.description && (
        <p className="text-zinc-600 dark:text-zinc-400 mb-2 max-w-2xl">{company.description}</p>
      )}
      {company.website_url && (
        <a
          href={company.website_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-100 underline"
        >
          {company.website_url.replace(/^https?:\/\//, "")}
        </a>
      )}

      <h2 className="text-lg font-semibold tracking-tight mt-10 mb-2">Key Individuals</h2>

      {error && (
        <p className="text-red-600 dark:text-red-400 text-sm">
          Failed to load key individuals: {error.message}
        </p>
      )}

      {!error && (people ?? []).length === 0 && (
        <p className="text-zinc-500 text-sm">
          Not yet available for this company — see scraper/README.md for coverage.
        </p>
      )}

      {executives.length > 0 && (
        <>
          <h3 className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-2">
            Executives
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
            {executives.map((p) => (
              <div
                key={p.full_name}
                className="rounded-lg border border-black/[.08] dark:border-white/[.145] px-4 py-3"
              >
                <div className="font-medium text-sm">{p.full_name}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">{p.role_title}</div>
                {p.bio && <p className="text-sm text-zinc-600 dark:text-zinc-400">{p.bio}</p>}
              </div>
            ))}
          </div>
        </>
      )}

      {nonExecutives.length > 0 && (
        <>
          <h3 className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-2">
            Non-Executive Board Members
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {nonExecutives.map((p) => (
              <div
                key={p.full_name}
                className="rounded-lg border border-black/[.08] dark:border-white/[.145] px-4 py-3"
              >
                <div className="font-medium text-sm">{p.full_name}</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">{p.role_title}</div>
                {p.bio && <p className="text-sm text-zinc-600 dark:text-zinc-400">{p.bio}</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
