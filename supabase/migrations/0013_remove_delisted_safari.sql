-- Safari Investments RSA (SAR) has been delisted from the JSE and become a
-- wholly owned subsidiary of Heriot REIT (HET) -- its entire website is now
-- just a "Notice of Change" page. Removing it as an independently tracked
-- company; on delete cascade removes any related rows (news tags, etc.)
-- automatically. Heriot REIT (which absorbed it) remains.
delete from companies where jse_code = 'SAR';
