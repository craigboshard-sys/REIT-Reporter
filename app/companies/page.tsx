import { createClient } from "@/lib/supabase/server";

export default async function CompaniesPage() {
  const supabase = await createClient();
  const { data: companies, error } = await supabase
    .from("companies")
    .select("id, name, jse_code, sector, description, website_url, has_international_exposure")
    .order("jse_code");

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-2">Company Profiles</h1>
      <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-2xl">
        JSE-listed property REITs tracked by REIT Reporter.
      </p>

      {error && (
        <p className="text-red-600 dark:text-red-400 text-sm">
          Failed to load companies: {error.message}
        </p>
      )}

      {companies && companies.length === 0 && (
        <p className="text-zinc-500 text-sm">No companies found.</p>
      )}

      {companies && companies.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {companies.map((company) => (
            <div
              key={company.id}
              className="rounded-lg border border-black/[.08] dark:border-white/[.145] px-4 py-3"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-sm">{company.name}</span>
                <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                  {company.jse_code}
                </span>
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                {company.sector}
                {company.has_international_exposure && " · International exposure"}
              </div>
              {company.description && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                  {company.description}
                </p>
              )}
              {company.website_url && (
                <a
                  href={company.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100 underline"
                >
                  {company.website_url.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
