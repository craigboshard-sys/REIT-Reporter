export type NavItem = {
  label: string;
  href: string;
  phase: 1 | 2 | 3 | 4;
  live: boolean;
};

export const navSections: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [{ label: "Dashboard", href: "/", phase: 1, live: true }],
  },
  {
    title: "Feeds",
    items: [
      { label: "SENS Announcements", href: "/sens", phase: 2, live: true },
      { label: "News Articles", href: "/news", phase: 2, live: true },
      { label: "Social Media Posts", href: "/social", phase: 4, live: true },
      { label: "Podcasts", href: "/podcasts", phase: 4, live: true },
      { label: "Video / Interviews", href: "/video", phase: 4, live: true },
      { label: "Regulatory Bodies", href: "/regulatory", phase: 2, live: true },
    ],
  },
  {
    title: "Companies & Data",
    items: [
      { label: "Company Profiles", href: "/companies", phase: 1, live: true },
      { label: "Broker & Analyst Coverage", href: "/analysts", phase: 4, live: true },
      { label: "Financial Metrics", href: "/financials", phase: 3, live: true },
      { label: "Compare Companies", href: "/compare", phase: 3, live: true },
      { label: "Market Data", href: "/market", phase: 2, live: true },
      { label: "Macro Indicators", href: "/macro", phase: 3, live: true },
    ],
  },
];
