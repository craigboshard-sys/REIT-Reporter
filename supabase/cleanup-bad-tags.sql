-- One-time cleanup: removes company tags written by the buggy matcher
-- (fixed in match-company.ts). Re-run the news/podcasts/video scrapers
-- afterwards to rebuild correct tags.

delete from news_article_companies;
delete from podcast_episode_companies;
delete from video_interview_companies;
