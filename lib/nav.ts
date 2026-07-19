export type NavItem = {
  label: string;
  href: string;
  phase: 1 | 2 | 3 | 4;
};

export const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/", phase: 1 }],
  },
  {
    title: "Feeds",
    items: [
      { label: "SENS Announcements", href: "/sens", phase: 2 },
      { label: "News Articles", href: "/news", phase: 2 },
      { label: "Social Media Posts", href: "/social", phase: 4 },
      { label: "Podcasts", href: "/podcasts", phase: 4 },
      { label: "Video / Interviews", href: "/video", phase: 4 },
      { label: "Regulatory Bodies", href: "/regulatory", phase: 2 },
    ],
  },
  {
    title: "Companies & Data",
    items: [
      { label: "Company Profiles", href: "/companies", phase: 1 },
      { label: "Analyst Coverage", href: "/analysts", phase: 4 },
      { label: "Financial Metrics", href: "/financials", phase: 3 },
      { label: "Market Data", href: "/market", phase: 2 },
      { label: "Macro Indicators", href: "/macro", phase: 3 },
    ],
  },
];
