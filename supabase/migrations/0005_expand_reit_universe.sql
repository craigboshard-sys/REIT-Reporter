-- Expand companies to the full SA REIT Association membership (21 REITs)
-- plus NEPI Rockcastle, which was already seeded but is not a SA REIT
-- Association member (it's a Netherlands N.V.) -- kept as an "international
-- exposure" JSE-listed property company per the project's stated scope.
--
-- Source: SA REIT Association member list (sareit.co.za/reit-members/),
-- cross-checked with individual company sites for tickers/websites/exposure.
-- As with the original seed, executive/service-provider data is deliberately
-- left out -- verify against current filings before relying on this in
-- production, and note the sector classification for smaller/newer REITs
-- (e.g. Heriot) is a best-effort call based on public descriptions, not a
-- verified JSE sector code.

insert into companies (name, jse_code, sector, description, website_url, has_international_exposure) values
  ('Accelerate Property Fund', 'APF', 'Diversified', 'JSE-listed REIT with a portfolio of retail, office, and industrial properties, including Fourways Mall.', 'https://www.acceleratepf.co.za', false),
  ('Burstone Group', 'BTN', 'Industrial', 'Internationally diversified real estate investment trust with logistics and industrial property across South Africa, the UK, and Europe.', 'https://www.burstone.com', true),
  ('Delta Property Fund', 'DLT', 'Office', 'REIT specialising in office accommodation for corporates, government, and parastatals, concentrated in South African CBD nodes.', 'https://www.deltafund.co.za', false),
  ('Dipula Properties', 'DIB', 'Diversified', 'South Africa-focused REIT with a portfolio of retail, office, industrial, and residential properties.', 'https://dipula.co.za', false),
  ('Equites Property Fund', 'EQU', 'Industrial', 'REIT focused on developing and acquiring logistics and industrial facilities in South Africa and the UK.', 'https://equites.co.za', true),
  ('Fairvest', 'FTA', 'Retail', 'South African-focused REIT with a retail-led portfolio (retail, office, and industrial) across all nine provinces.', 'https://fairvest.co.za', false),
  ('Heriot REIT', 'HET', 'Diversified', 'Diversified property investment REIT listed on the JSE AltX, spanning retail, industrial, commercial, and residential assets.', 'https://www.heriotreit.com', false),
  ('Oasis Crescent Property Fund', 'OAS', 'Diversified', 'Shari''ah-compliant, closed-end property REIT listed on the JSE AltX.', 'https://www.oasis.co.za', false),
  ('Octodec Investments', 'OCT', 'Diversified', 'REIT with a residential, office, and retail portfolio concentrated in Pretoria and Johannesburg CBDs.', 'https://www.octodec.co.za', false),
  ('Safari Investments RSA', 'SAR', 'Retail', 'REIT focused on township and rural retail shopping centres.', 'https://www.safari-investments.com', false),
  ('Spear REIT', 'SEA', 'Diversified', 'Western Cape-focused REIT with a diversified property portfolio.', 'https://www.spearprop.co.za', false),
  ('Stor-Age Property REIT', 'SSS', 'Storage', 'Self-storage REIT operating the Stor-Age brand in South Africa and the Storage King brand in the UK.', 'https://www.stor-age.co.za', true);
