-- Seed a starter set of JSE-listed REITs.
-- Company-level facts only (name, ticker, sector, international exposure).
-- Verify against current JSE/SENS data before relying on this in production —
-- listings, sectors, and especially executives can change after this was written.

insert into companies (name, jse_code, sector, description, website_url, has_international_exposure) values
  ('Growthpoint Properties', 'GRT', 'Diversified', 'South Africa''s largest primary listed REIT, with a diversified portfolio and international exposure via Growthpoint Properties Australia and interests in Eastern Europe.', 'https://growthpoint.co.za', true),
  ('Redefine Properties', 'RDF', 'Diversified', 'Diversified REIT with a South African portfolio and international exposure through investments in Poland (EPP) and the UK.', 'https://www.redefine.co.za', true),
  ('Vukile Property Fund', 'VKE', 'Retail', 'Retail-focused REIT with a South African shopping centre portfolio and international exposure through its Spanish subsidiary, Castellana Properties.', 'https://www.vukile.co.za', true),
  ('Fortress REIT', 'FFB', 'Industrial', 'Logistics and industrial property REIT, historically also held a significant stake in NEPI Rockcastle.', 'https://www.fortressfund.co.za', false),
  ('Hyprop Investments', 'HYP', 'Retail', 'Owner of major South African shopping malls; has previously held Eastern European retail interests.', 'https://www.hyprop.co.za', false),
  ('NEPI Rockcastle', 'NRP', 'Retail', 'REIT focused on dominant shopping centres across Central and Eastern Europe, dual-listed on the JSE and Euronext Amsterdam.', 'https://www.nepirockcastle.com', true),
  ('Resilient REIT', 'RES', 'Retail', 'Retail REIT with a South African portfolio including large-format and rural/township shopping centres.', 'https://www.resilient.co.za', false),
  ('Attacq', 'ATT', 'Diversified', 'Diversified REIT best known for developing and owning the Waterfall City precinct in Gauteng.', 'https://attacq.co.za', false),
  ('Emira Property Fund', 'EMI', 'Diversified', 'Diversified South African REIT spanning office, retail, industrial, and residential property.', 'https://www.emira.co.za', false),
  ('SA Corporate Real Estate', 'SAC', 'Diversified', 'Diversified South African REIT with a focus on retail, industrial, and residential property.', 'https://www.sacorporatefund.co.za', false);
