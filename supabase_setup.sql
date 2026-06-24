-- ==========================================
-- SUPABASE SCHEMA & SEED DATA SETUP
-- Copy & paste this into the Supabase SQL Editor
-- ==========================================

-- 1. Create Timeline Table
CREATE TABLE IF NOT EXISTS timeline (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    date_range TEXT NOT NULL,
    bullets TEXT[] NOT NULL,
    media JSONB[] DEFAULT '{}',
    sort_order INT NOT NULL
);

-- Enable RLS & Select policy for Timeline
ALTER TABLE timeline ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access for timeline" ON timeline FOR SELECT USING (true);

-- 2. Create Podcasts Table
CREATE TABLE IF NOT EXISTS podcasts (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    host TEXT NOT NULL,
    frequency TEXT NOT NULL,
    apple_podcasts_url TEXT,
    status TEXT NOT NULL,
    notes TEXT
);

-- Enable RLS & Select policy for Podcasts
ALTER TABLE podcasts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access for podcasts" ON podcasts FOR SELECT USING (true);

-- 3. Create Portfolio Table
CREATE TABLE IF NOT EXISTS portfolio (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    image_path TEXT NOT NULL,
    tags TEXT[] NOT NULL
);

-- Enable RLS & Select policy for Portfolio
ALTER TABLE portfolio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access for portfolio" ON portfolio FOR SELECT USING (true);

-- 4. Create Socials Table
CREATE TABLE IF NOT EXISTS socials (
    id SERIAL PRIMARY KEY,
    category TEXT NOT NULL, -- 'primary' or 'community'
    platform TEXT NOT NULL, -- e.g. 'linkedin', 'substack', 'tiktok'
    url TEXT NOT NULL,
    handle TEXT NOT NULL,
    title TEXT NOT NULL
);

-- Enable RLS & Select policy for Socials
ALTER TABLE socials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access for socials" ON socials FOR SELECT USING (true);

-- 5. Create Skills Table
CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    category TEXT NOT NULL, -- 'leadership' or 'comms'
    name TEXT NOT NULL
);

-- Enable RLS & Select policy for Skills
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access for skills" ON skills FOR SELECT USING (true);

-- 6. Create Education Table
CREATE TABLE IF NOT EXISTS education (
    id SERIAL PRIMARY KEY,
    institution TEXT NOT NULL,
    details TEXT NOT NULL
);

-- Enable RLS & Select policy for Education
ALTER TABLE education ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access for education" ON education FOR SELECT USING (true);


-- ==========================================
-- SEED DATA STATEMENTS
-- ==========================================

-- Seed Timeline
TRUNCATE timeline RESTART IDENTITY CASCADE;
INSERT INTO timeline (id, role, company, location, date_range, bullets, media, sort_order) VALUES
('redwood-empire', 'Partner / Producer / Editor', 'Redwood Empire Media', NULL, '02/2025 - Present', 
 ARRAY[
   'Complete in-person and remote video podcast production.',
   'Creation of premium short and long-form video content.',
   'Professional audio and video editing.',
   'Content strategy for individuals and businesses to increase online visibility.'
 ], 
 ARRAY[
   '{"title": "Studio Recording Setup Photo", "req": "1920x1080px (PNG/JPG)"}'::jsonb,
   '{"title": "Podcast Production Still", "req": "1920x1080px (PNG/JPG)"}'::jsonb
 ], 1),

('seiu-1021', 'Field Representative', 'SEIU 1021', 'Santa Rosa, CA', '07/2023 - 06/2025', 
 ARRAY[
   'Led contract negotiations for the California Academy of Sciences, developing effective communication strategies.',
   'Bargained contracts and represented union members in public education sectors.',
   'Managed grievance presentation, member defense, and contract enforcement procedures.'
 ], 
 ARRAY[
   '{"title": "California Academy of Sciences Rally", "req": "1920x1080px (PNG/JPG)"}'::jsonb,
   '{"title": "Bargaining Committee Sessions", "req": "1920x1080px (PNG/JPG)"}'::jsonb
 ], 2),

('teamsters-harris', 'Director', 'Teamsters for Harris', 'National Campaign', '07/2024 - 11/2024', 
 ARRAY[
   'Led digital organizing campaign, growing online communities by 10,000+ followers on X/Twitter and 3,000+ on Facebook in just two months.',
   'Managed cross-platform ad campaigns (X, Meta, Google) targeting union member recruitment and mobilization.',
   'Created dynamic digital assets, educational videos, and messaging frameworks tailored for labor audiences.',
   'Built a nationwide grassroots coalition leading to local/regional endorsements covering over 1 million union members.'
 ], 
 ARRAY[
   '{"title": "Campaign Design & Banner Graphics", "req": "1920x1080px (PNG/JPG)"}'::jsonb,
   '{"title": "Ad Campaign Analytics Graph", "req": "1920x1080px (PNG/JPG)"}'::jsonb
 ], 3),

('apple', 'Specialist', 'Apple', 'Corte Madera, CA', '10/2021 - 08/2023', 
 ARRAY[
   'Maintained 95% customer satisfaction rating through empathetic, clear communication and high-impact troubleshooting.',
   'Developed targeted messaging and educational walkthroughs for a highly diverse consumer demographic.',
   'Leveraged modern technology suites to deliver premium client experiences.'
 ], 
 ARRAY[
   '{"title": "Apple Store Corte Madera Still", "req": "1920x1080px (PNG/JPG)"}'::jsonb
 ], 4),

('norcal-pods', 'Content Producer', 'NorCal Pods', 'San Francisco Bay Area', '09/2020 - 02/2023', 
 ARRAY[
   'Produced over 150 podcast episodes, expanding distribution channels to capture thousands of active listeners.',
   'Provided targeted marketing, SEO optimization, and algorithm tuning to maximize audience viewership and engagement.'
 ], 
 ARRAY[
   '{"title": "NorCal Pods Episode Cover Designs", "req": "1920x1080px (PNG/JPG)"}'::jsonb
 ], 5),

('freelance', 'Independent Communications Consultant', 'Freelance', 'Streaming Focus', '10/2020 - 08/2023', 
 ARRAY[
   'Advised and guided creators to expand, distribute, and monetize interactive digital content.',
   'Created and edited multi-format creative assets including print layout, graphic design, audio, and video streams.',
   'Strategized distribution pipelines to enhance structural SEO and organic viewer conversions.'
 ], 
 ARRAY[
   '{"title": "Stream Overlay & Branding Layouts", "req": "1920x1080px (PNG/JPG)"}'::jsonb
 ], 6),

('healthy-democracy', 'Technology and Logistics Specialist', 'Healthy Democracy', 'Portland, OR', '06/2022 - 08/2022', 
 ARRAY[
   'Managed digital streaming and communication technology pipelines for citizen engagement assemblies.',
   'Guaranteed seamless technical operations and low-latency broadcast systems for public participation processes.'
 ], 
 ARRAY[
   '{"title": "Citizen Assembly Broadcaster Control Desk", "req": "1920x1080px (PNG/JPG)"}'::jsonb
 ], 7),

('teamsters-853', 'Business Representative / Communications', 'Teamsters Local 853', 'Oakland, CA', '01/2014 - 10/2020', 
 ARRAY[
   'Managed comprehensive communications initiatives prior to the formation of a formal department.',
   'Negotiated, maintained, and enforced contracts. Handled grievance presentation and arbitration file preparation.',
   'Produced worker-facing media to train, onboard, and explain labor rights and benefit designs.',
   'Developed internal and external communications frameworks supporting dynamic local organizing drives.',
   'Planned and orchestrated large-scale union events and assemblies.'
 ], 
 ARRAY[
   '{"title": "Union General Membership Meeting", "req": "1920x1080px (PNG/JPG)"}'::jsonb,
   '{"title": "Picket Lines & Member Mobilization", "req": "1920x1080px (PNG/JPG)"}'::jsonb
 ], 8),

('north-coast-trust', 'Trustee', 'North Coast Trust Fund', NULL, '09/2007 - 09/2014', 
 ARRAY[
   'Collaborated on structural health plan design, fiduciary coverage policies, and responsible trust fund budgeting.'
 ], 
 ARRAY[
   '{"title": "Trust Fund Board Assembly", "req": "1920x1080px (PNG/JPG)"}'::jsonb
 ], 9),

('teamsters-665', 'Business Representative', 'Teamsters Local 665', 'Santa Rosa, CA', '01/2012 - 01/2014', 
 ARRAY[
   'Bargained labor agreements, represented member interests, and conducted workplace audits and contract enforcement.'
 ], 
 ARRAY[
   '{"title": "Local 665 Member Action Still", "req": "1920x1080px (PNG/JPG)"}'::jsonb
 ], 10),

('teamsters-624', 'President', 'Teamsters Local 624', NULL, '06/2006 - 01/2012', 
 ARRAY[
   'Elected Local Union President, administering executive operations, financial budgeting, and strategic labor campaigns.',
   'Supervised all representational departments, business agents, and organizing drives.'
 ], 
 ARRAY[
   '{"title": "Local 624 Union Hall & President Assembly", "req": "1920x1080px (PNG/JPG)"}'::jsonb
 ], 11);

-- Seed Podcasts
TRUNCATE podcasts RESTART IDENTITY CASCADE;
INSERT INTO podcasts (title, host, frequency, apple_podcasts_url, status, notes) VALUES
('Buy The Bay', 'Dan Ancheta', 'Weekly', 'https://podcasts.apple.com/us/podcast/buy-the-bay-the-bay-area-real-estate-podcast/id1653134914', 'active', NULL),
('BenefitsTV', 'Andrew McNeil & Rosario Avila', 'Every Other Week', 'https://podcasts.apple.com/us/podcast/benefitstv-the-podcast/id1612739328', 'active', NULL),
('Lash Girls Don''t Cry', 'Niomi & Kayla', 'Weekly', 'https://podcasts.apple.com/us/podcast/lash-girls-dont-cry/id1527632152', 'ended', NULL),
('Leave It Better', 'Brandon Trammell', 'Every Other Week', 'https://podcasts.apple.com/us/podcast/leave-it-better-w-brandon-trammell/id1674488330', 'active', NULL),
('The Yin Project', 'Emily Beaven', 'Every Other Week', 'https://podcasts.apple.com/us/podcast/the-yin-project/id1614742967', 'active', NULL),
('The Redwood Empire', 'Phil Ybarrolaza', 'Varies', 'https://podcasts.apple.com/us/podcast/the-redwood-empire/id1552594611', 'active', NULL),
('That''s the Whiskey', 'Jasmine Cruz & Caroline Moeller', 'Every Other Week', 'https://podcasts.apple.com/us/podcast/thats-the-whiskey/id1573024982', 'active', NULL),
('RealWise Sonoma County', 'Stephanie Johnson', 'Varies', 'https://podcasts.apple.com/us/podcast/realwise-sonoma-county-a-real-estate-podcast-with/id1696205937', 'active', NULL),
('Unionist', 'Phil Ybarrolaza', 'Varies', 'https://podcasts.apple.com/us/podcast/unionist/id1534015691', 'active', NULL),
('AI for the Normal Guy', 'Phil Ybarrolaza', 'Varies', 'https://podcasts.apple.com/us/podcast/ai-for-the-normal-guy/id1736639446', 'active', NULL),
('Just Show Up', 'Julian Solano & Michael Williams', 'Weekly', NULL, 'no_apple_podcasts_match', 'Hosted by Julian & Michael. Video/Excellerate Real Estate content exists, but no standalone active show on Apple Podcasts.'),
('The Interview Series', 'Jeff Fuller', 'Varies', NULL, 'no_apple_podcasts_match', 'Produced by Redwood Empire Media. Distributed on other platforms (JioSaavn/Linktree), no standalone show on Apple Podcasts.'),
('BBL', 'Bianca Broos', 'Varies', NULL, 'no_apple_podcasts_match', 'Hosted by Bianca Broos. Guest appearances exist, but no standalone active show under this name on Apple Podcasts.');

-- Seed Portfolio
TRUNCATE portfolio RESTART IDENTITY CASCADE;
INSERT INTO portfolio (id, title, category, description, image_path, tags) VALUES
('tfh-banner', 'Teamsters for Harris Campaign Header', 'campaigns', 'National digital campaign header used across social channels during the 2024 presidential mobilization.', 'assets/portfolio/tfh-banner.png', ARRAY['Digital Banner', 'Social Media', 'Teamsters']),
('labor-rally-flyer', 'Academy of Sciences Rally Flyer', 'flyers', 'Mobilization flyer designed for the SEIU 1021 contract campaign at the California Academy of Sciences.', 'assets/portfolio/rally-flyer.png', ARRAY['Print Flyer', 'SEIU 1021', 'Member Rally']),
('redwood-media-logo', 'Redwood Empire Media Branding', 'branding', 'Visual identity design, logo variations, and style guides for Redwood Empire Media content network.', 'assets/portfolio/rem-branding.png', ARRAY['Logo Design', 'Style Guide', 'Vector']),
('unionist-artwork', 'Unionist Podcast Cover Artwork', 'branding', 'Podcast album cover art designed for the Unionist show, depicting labor solidarity and voice.', 'assets/portfolio/unionist-art.png', ARRAY['Cover Art', 'Typography', 'Illustrator']),
('local853-picket-flyer', 'Teamsters 853 Strike Support Flyer', 'flyers', 'Local union support materials designed to coordinate picket lines, shift schedules, and community donation drives.', 'assets/portfolio/strike-support.png', ARRAY['Print Flyer', 'Campaign Outreach', 'Teamsters 853']),
('harris-campaign-social-ad', 'National Organizing Social Ad', 'campaigns', 'Targeted social media ad creatives designed for Facebook and Instagram during the Teamsters for Harris mobilization.', 'assets/portfolio/social-ad.png', ARRAY['Ad Creative', 'Social Media', 'Harris-Walz']);

-- Seed Socials
TRUNCATE socials RESTART IDENTITY CASCADE;
INSERT INTO socials (category, platform, url, handle, title) VALUES
('primary', 'linkedin', 'https://linkedin.com/in/philybarrolaza', 'linkedin.com/in/philybarrolaza', 'LinkedIn'),
('primary', 'instagram', 'https://instagram.com/getphily', '@getphily', 'Instagram'),
('primary', 'x', 'https://x.com/thegetphily', '@thegetphily', 'X (Twitter)'),
('primary', 'youtube', 'https://www.youtube.com/channel/UCbXMbRy8d4s3zK-zc_2ia8Q', 'YouTube Channel', 'YouTube'),
('community', 'substack', 'https://substack.com/@getphily', '@getphily', 'Substack'),
('community', 'tiktok', 'https://tiktok.com/@.getphily', '@.getphily', 'TikTok'),
('community', 'threads', 'https://www.threads.net/@getphily', '@getphily', 'Threads'),
('community', 'twitch', 'https://www.twitch.tv/getphily', 'getphily', 'Twitch'),
('community', 'discord', 'https://discord.gg/jaTqahFj', 'Join Community', 'Discord'),
('community', 'spotify', 'https://open.spotify.com/playlist/3xJduo2qI3XjEyYvO4oOoz?si=90241d67d9d84b34', 'Phil''s Playlists', 'Spotify'),
('community', 'merch', 'https://getphily.creator-spring.com', 'Shop Getphily', 'Merch Store'),
('community', 'facebook', 'https://www.facebook.com/philybar', 'philybar', 'Facebook'),
('community', 'email', 'mailto:phil624@gmail.com', 'phil624@gmail.com', 'Direct Email');

-- Seed Skills
TRUNCATE skills RESTART IDENTITY CASCADE;
INSERT INTO skills (category, name) VALUES
('leadership', 'First Contracts & Collective Bargaining'),
('leadership', 'Contract Costing & Financial Analysis'),
('leadership', 'Coalition Building & Strategic Campaigns'),
('leadership', 'Grievance Writing, Case Management & Panels'),
('leadership', 'Organizing Drives & Project Management'),
('leadership', 'Steward Training & Member Engagement'),
('leadership', 'Leadership Recruitment & Team Coordination'),
('comms', 'Digital Organizing & Social Media Management'),
('comms', 'SEO, Website Development & Digital Algorithms'),
('comms', 'Video Podcast Production & Editing'),
('comms', 'Graphic Layout (Photoshop, Illustrator, InDesign)'),
('comms', 'Audio & Video Editing (Final Cut Pro, Audacity, CapCut)'),
('comms', 'Content Strategy & Campaign Messaging'),
('comms', 'Fiduciary Trust Health Plan Design & Budgeting');

-- Seed Education
TRUNCATE education RESTART IDENTITY CASCADE;
INSERT INTO education (institution, details) VALUES
('Cuesta College', 'Economics Coursework | 1989 - 1990'),
('Santa Rosa Junior College', 'Political Science, Economics Coursework | 1988 - 1989');

-- 7. Create Employers Table
CREATE TABLE IF NOT EXISTS employers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    industry TEXT NOT NULL,
    location TEXT NOT NULL
);

-- Enable RLS & Select policy for Employers
ALTER TABLE employers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access for employers" ON employers FOR SELECT USING (true);

-- Seed Employers
TRUNCATE employers RESTART IDENTITY CASCADE;
INSERT INTO employers (name, industry, location) VALUES
('Santa Rosa Junior College (SRJC)', 'Education', 'Sonoma County, CA (Santa Rosa & Petaluma)'),
('Cotati-Rohnert Park Unified School District', 'Education', 'Sonoma County, CA (Rohnert Park / Cotati)'),
('Geyserville School District (GUSD)', 'Education', 'Geyserville, CA'),
('Sonoma Valley Unified School District (SUSD)', 'Education', 'Sonoma, CA'),
('California Academy of Sciences', 'Non-Profit / Cultural', 'San Francisco, CA'),
('Loop Transportation', 'Transportation & Logistics', 'Menlo Park, CA'),
('SuperShuttle of San Francisco, Inc.', 'Transportation & Logistics', 'Burlingame, CA'),
('Central Parking System / New South Parking', 'Transportation & Logistics', 'San Francisco, CA'),
('Golden State Lumber, Inc.', 'Manufacturing & Construction', 'Newark, Brisbane, and San Rafael, CA'),
('Pacific Supply', 'Manufacturing & Construction', 'San Rafael, CA'),
('Stewart Chevrolet', 'Automotive Services', 'Colma, CA'),
('The Press Democrat', 'Media & Publishing', 'Santa Rosa / North Bay, CA'),
('ABF Freight', 'Transportation & Logistics', 'Santa Rosa, CA'),
('NeilMed Products, Inc.', 'Manufacturing & Construction', 'Santa Rosa, CA'),
('DHL Express', 'Transportation & Logistics', 'Santa Rosa, CA'),
('Farmer Brothers Coffee', 'Food & Beverage', 'Santa Rosa, CA'),
('USF Reddaway', 'Transportation & Logistics', 'Santa Rosa, CA'),
('Aramark Uniform Services', 'Facilities & Services', 'North Bay Area, CA'),
('North Bay Corporation', 'Environmental & Waste Management', 'Sonoma and Marin Counties, CA'),
('Marin Sanitary Service', 'Environmental & Waste Management', 'Marin County, CA'),
('Lumber and Mill Employers Association (LAMEA)', 'Manufacturing & Construction', 'San Mateo / East Bay / North Bay Regions, CA'),
('Serramonte Ford', 'Automotive Services', 'Colma / Daly City Area, CA'),
('Alsco / Steiner Corp.', 'Facilities & Services', 'North Bay Regional Network, CA'),
('Young’s Market', 'Food & Beverage', 'North Bay Regional Network, CA'),
('Kings County Truck Lines', 'Transportation & Logistics', 'Northern California Region'),
('Dairymen’s Feed', 'Agriculture', 'North Bay Regional Network, CA'),
('Lucero Trucking', 'Transportation & Logistics', 'Ukiah, CA'),
('Airborne Express', 'Transportation & Logistics', 'Corte Madera, CA'),
('Curtin Air Freight, Inc.', 'Transportation & Logistics', 'Petaluma, CA'),
('Unipart Services America, Inc.', 'Automotive Services', 'Brisbane, CA'),
('Buchanan Food Service', 'Food & Beverage', 'Rohnert Park, CA'),
('First Student', 'Transportation & Logistics', 'Santa Rosa/San Jose, CA'),
('Vella Cheese', 'Food & Beverage', 'Sonoma, CA'),
('Petaluma Poultry Processors', 'Food & Beverage', 'Petaluma, CA'),
('Lace House Linen', 'Facilities & Services', 'North Bay Regional Network, CA'),
('Luxor Cab', 'Transportation & Logistics', 'San Francisco / Bay Area, CA'),
('Mill Valley Refuse Service & Recycling', 'Environmental & Waste Management', 'Mill Valley / Marin County, CA'),
('McPhail’s Fuel Company', 'Energy & Utilities', 'North Bay Regional Network, CA'),
('Yellow Cab', 'Transportation & Logistics', 'San Francisco / Bay Area, CA'),
('Yellow Freight & Roadway Freight', 'Transportation & Logistics', 'Regional Distribution Hubs, CA'),
('P & S Sales, Inc.', 'Retail & Distribution', 'Hayward, CA'),
('AutoWest Honda', 'Automotive Services', 'Bay Area Region, CA'),
('Storer Transportation', 'Transportation & Logistics', 'Hayward, CA'),
('ABM', 'Facilities & Services', 'Oakland, CA'),
('Sims Metal Management', 'Environmental & Waste Management', 'Redwood City & San Jose, CA'),
('SFO Shuttle Bus Company', 'Transportation & Logistics', 'San Francisco / Bay Area, CA'),
('Park ''N Fly Service, LLC', 'Transportation & Logistics', 'Oakland, CA'),
('Mercedes-Benz of Oakland', 'Automotive Services', 'Oakland, CA'),
('WeDriveU, Inc.', 'Transportation & Logistics', 'Bay Area, CA'),
('Steeler, Inc.', 'Manufacturing & Construction', 'Newark, CA'),
('Clean Harbors Environmental Services, Inc.', 'Environmental & Waste Management', 'South San Francisco, CA'),
('Douglas Parking LLC', 'Transportation & Logistics', 'Oakland, CA'),
('Valet Hospitality Service', 'Transportation & Logistics', 'Oakland, CA'),
('Encore / Horizon Coach Lines / TMS', 'Transportation & Logistics', 'San Francisco, CA'),
('Zenith American Solutions', 'Financial & Administrative Services', 'Alameda, CA'),
('Durham School Services', 'Transportation & Logistics', 'Oakland, CA'),
('First Transit', 'Transportation & Logistics', 'Redwood City, CA'),
('Farmers Produce Corporation', 'Food & Beverage', 'Oakland, CA'),
('Golden Gate Truck Center', 'Automotive Services', 'Oakland, CA'),
('LAZ Parking', 'Transportation & Logistics', 'Oakland, CA'),
('Propark', 'Transportation & Logistics', 'Oakland, CA'),
('San Pablo Automotive', 'Automotive Services', 'Martinez, CA'),
('Oakland Honda', 'Automotive Services', 'Oakland, CA'),
('HW McKevitt', 'Facilities & Services', 'Berkeley & San Leandro, CA'),
('Pregis', 'Manufacturing & Construction', 'Hayward, CA'),
('Oakland, City of', 'Government', 'Oakland, CA'),
('UPS Freight, Inc.', 'Transportation & Logistics', 'Santa Rosa, CA'),
('Clover Stornetta', 'Food & Beverage', 'Petaluma, CA'),
('Sara Lee', 'Food & Beverage', 'Santa Rosa, CA'),
('Hansel Ford', 'Automotive Services', 'Santa Rosa, CA'),
('Laidlaw Transit', 'Transportation & Logistics', 'Lake County, CA'),
('Laidlaw School Bus', 'Transportation & Logistics', 'Santa Rosa, CA'),
('For Whom Productions, LLC', 'Production Companies & Studio Entities', 'San Francisco, CA'),
('Backyard Productions', 'Production Companies & Studio Entities', 'Manhattan Beach, CA'),
('Kaboom Productions, Inc.', 'Production Companies & Studio Entities', 'San Francisco, CA'),
('Epoch Films', 'Production Companies & Studio Entities', 'Los Angeles, CA'),
('The Cartel', 'Production Companies & Studio Entities', 'Los Angeles, CA'),
('Shocking Bottle, LLC', 'Production Companies & Studio Entities', 'Sonoma, CA');

-- 8. Create Competencies Table
CREATE TABLE IF NOT EXISTS competencies (
    id SERIAL PRIMARY KEY,
    group_type TEXT NOT NULL,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    sort_order INT NOT NULL
);

-- Enable RLS & Select policy for Competencies
ALTER TABLE competencies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access for competencies" ON competencies FOR SELECT USING (true);

-- Seed Competencies
TRUNCATE competencies RESTART IDENTITY CASCADE;
INSERT INTO competencies (group_type, category, name, description, sort_order) VALUES
('strategic_core', 'High-Stakes Collective Bargaining & Contract Architecture', 'Comprehensive Contract Auditing', 'Demonstrated ability to build, maintain, and manage extensive 15-to-20 Article contract structures, tracking moving target clauses from initial proposal through tentative agreements (TAs) and final document sign-offs.', 1),
('strategic_core', 'High-Stakes Collective Bargaining & Contract Architecture', 'Economic Strategy Frameworks', 'Expert at engineering multi-year economic packages, including the formulation of wage escalations, cost-of-living adjustments (COLAs), retirement programs, and stipend structures for vulnerable worker populations.', 2),
('strategic_core', 'High-Stakes Collective Bargaining & Contract Architecture', 'Language Harmonization', 'Proven experience modernizing legacy contracts by integrating local Letters of Understanding (LOUs) into unified national master templates.', 3),
('strategic_core', 'Strategic Campaign Organizing & Workforce Unit Mapping', 'High-Resolution Site Mapping', 'Skilled at designing synchronized on-the-ground organizing campaigns, explicitly scheduling team deployments, tracking department-by-department shift patterns, and mapping employee break rooms to maximize contact coverage.', 4),
('strategic_core', 'Strategic Campaign Organizing & Workforce Unit Mapping', 'Targeted Outreach Systems', 'Adept at executing structured digital and telephonic outreach funnels, interpreting real-time worker sentiment metrics, and maintaining call logging systems to convert non-members.', 5),
('strategic_core', 'Strategic Campaign Organizing & Workforce Unit Mapping', 'Objection Demolition & Messaging', 'Capable of synthesizing quick-response talking points to handle worker hesitations regarding dues investments, benefit changes, and collective voice importance.', 6),
('strategic_core', 'Regulatory Compliance & Forensic Grievance Administration', 'Public and Private Labor Law Navigation', 'Experienced managing formal administrative actions across competing jurisdictions, including the National Labor Relations Board (NLRB) decertification defenses and Unfair Labor Practice (ULP) filings.', 7),
('strategic_core', 'Regulatory Compliance & Forensic Grievance Administration', 'Advanced Grievance Resolutions', 'Adept at escalating workplace disputes through rigorous multi-level grievance procedures to recover back-pay and restore employee seniority.', 8),
('strategic_core', 'Regulatory Compliance & Forensic Grievance Administration', 'Joint Labor-Management Committee (JLMC) Leadership', 'Skilled at conducting recurring meet-and-confers, addressing structural employer reorganizations, and enforcing trust fund compliance or classification studies.', 9),
('strategic_core', 'Operational Leadership & Data Analytics', 'Total Workforce Representation (TWR) Matrix Tracking', 'Highly proficient at building metrics-driven dashboards to monitor chapter density percentiles against organizational growth goals.', 10),
('strategic_core', 'Operational Leadership & Data Analytics', 'Data-Driven Field Analytics', 'Experienced in executing and distilling large-scale qualitative member bargaining surveys into core action items.', 11),
('strategic_core', 'Operational Leadership & Data Analytics', 'Financial & Resource Administration', 'Knowledgeable in organizing data, processing complex expenditure records, and handling information requests in full compliance with public and private accounting standards.', 12),
('core_professional', 'Labor Relations & Collective Bargaining Strategy', 'Successor Contract Negotiations', 'Expert in drafting, editing, and executing multi-party collective bargaining agreements (CBAs) from initial Sunshine proposals through tentative agreements (TAs) to final ratification.', 1),
('core_professional', 'Labor Relations & Collective Bargaining Strategy', 'Economic Package Modeling', 'Skilled in analyzing financial indicators, budgets, and IRS Form 990s to architect wage scales, health/welfare contribution models, cost-of-living adjustments (COLAs), and special equity increases.', 2),
('core_professional', 'Labor Relations & Collective Bargaining Strategy', 'CBA Structural Integration', 'Adept at auditing legacy frameworks and seamlessly consolidating local Memorandums of Understanding (MOUs) and Letters of Understanding (LOUs) into unified master corporate agreements.', 3),
('core_professional', 'Labor Relations & Collective Bargaining Strategy', 'Strategic Escalation Management', 'Proven ability to navigate high-stakes bargaining impasses, organize legal strike sanctions, file federal dispute notices, and leverage mediation pathways (such as the FMCS).', 4),
('core_professional', 'Conflict Resolution & Forensic Grievance Administration', 'Multi-Step Grievance Processing', 'Competent in managing complex, multi-tiered grievance workflows, documenting contractual violations, conducting witness interrogations, and securing binding settlement terms.', 5),
('core_professional', 'Conflict Resolution & Forensic Grievance Administration', 'Just Cause Evaluation', 'Thorough understanding of structural investigative frameworks (e.g., Daugherty’s Seven Tests) to challenge unjust discipline, suspension, or termination actions.', 6),
('core_professional', 'Conflict Resolution & Forensic Grievance Administration', 'Joint Labor-Management Committee (JLMC) Leadership', 'Experienced in establishing and chairing recurring labor-management units to iron out shop-floor disputes, safety standards, and unilateral employer policy updates.', 7),
('core_professional', 'Conflict Resolution & Forensic Grievance Administration', 'Back-Pay and Seniority Restorations', 'Experienced in auditing employer payroll logs and roster metrics to resolve misclassified wage structures, lost overtime opportunities, and delayed step advancements.', 8),
('core_professional', 'Strategic Internal Organizing & Campaign Logistics', 'Worksite Unit Mapping', 'Expert in conducting visual, department-by-department workforce assessments and shift schedules to deploy union campaigns with maximum exposure.', 9),
('core_professional', 'Strategic Internal Organizing & Campaign Logistics', 'Total Workforce Representation (TWR) Oversight', 'Highly proficient in tracking member density percentages, processing check-off authorizations, and executing targeted campaigns to transition non-members into active participants.', 10),
('core_professional', 'Strategic Internal Organizing & Campaign Logistics', 'New Employee Orientation (NEO) Deployment', 'Adept at designing standardized, scaleable digital and video script onboarding tools to optimize union entry enrollment programs.', 11),
('core_professional', 'Strategic Internal Organizing & Campaign Logistics', 'Objection Demolition & Strategic Communications', 'Skilled in crafting quick-response messaging to neutralize worker pushback regarding dues structures, benefit packages, and personal workplace security.', 12),
('core_professional', 'Regulatory Compliance & Policy Analysis', 'NLRB & Public Sector Statutory Defense', 'Well-versed in defending union certifications against decertification petitions, filing unfair labor practice (ULP) charges, and managing board representation hearings.', 13),
('core_professional', 'Regulatory Compliance & Policy Analysis', 'Forensic Information Requests', 'Expert in engineering exhaustive pre-bargaining information requests targeting granular employee demographics, multi-year audited financial positions, overhead cost roll-ups, and contractor utilization data.', 14),
('core_professional', 'Regulatory Compliance & Policy Analysis', 'Workplace Health, Safety & Compliance Auditing', 'Capable of interpreting OSHA logs, Workers\' Compensation claim files, Workplace Violence Prevention Policies, and active classification/retention reports.', 15),
('core_professional', 'Regulatory Compliance & Policy Analysis', 'Employment Law Mastery', 'Comprehensive knowledge of worker safety nets, including FMLA/CFRA parameters, State Disability Insurance (SDI), Paid Family Leave (PFL), and the Americans with Disabilities Act (ADA) accommodation frameworks.', 16),
('core_professional', 'Professional Affiliations & Systems Experience', 'Union Administration Systems', 'Processing dynamic member data exports via CSV/Excel reporting frameworks to optimize campaign communications.', 17),
('core_professional', 'Professional Affiliations & Systems Experience', 'Sectors Represented', 'Public Education (K-12 & Community College Districts), Private-Sector Logistics, Regional Passenger Transportation/Shuttle Infrastructure, Public Health Valet Portfolios, and Specialized Scientific/Non-profit Cultural Institutions.', 18),
('skills_list', 'Labor Relations & Collective Bargaining', 'Collective Bargaining Agreements (CBA)', NULL, 1),
('skills_list', 'Labor Relations & Collective Bargaining', 'Successor Contract Negotiations', NULL, 2),
('skills_list', 'Labor Relations & Collective Bargaining', 'Memorandums of Understanding (MOU)', NULL, 3),
('skills_list', 'Labor Relations & Collective Bargaining', 'Letters of Understanding (LOU)', NULL, 4),
('skills_list', 'Labor Relations & Collective Bargaining', 'Sunshine Proposals', NULL, 5),
('skills_list', 'Labor Relations & Collective Bargaining', 'Tentative Agreements (TA)', NULL, 6),
('skills_list', 'Labor Relations & Collective Bargaining', 'Federal Mediation & Conciliation Service (FMCS)', NULL, 7),
('skills_list', 'Labor Relations & Collective Bargaining', 'Bargaining Unit Restructuring', NULL, 8),
('skills_list', 'Labor Relations & Collective Bargaining', 'Contract Ratification', NULL, 9),
('skills_list', 'Labor Relations & Collective Bargaining', 'Strike Sanctions & Dispute Notices', NULL, 10),
('skills_list', 'Grievance & Legal Administration', 'Multi-Level Grievance Arbitration', NULL, 11),
('skills_list', 'Grievance & Legal Administration', 'Unfair Labor Practices (ULP)', NULL, 12),
('skills_list', 'Grievance & Legal Administration', 'National Labor Relations Board (NLRB) Actions', NULL, 13),
('skills_list', 'Grievance & Legal Administration', 'Just Cause Disciplinary Defense', NULL, 14),
('skills_list', 'Grievance & Legal Administration', 'Seniority Roster Auditing', NULL, 15),
('skills_list', 'Grievance & Legal Administration', 'Back-Pay Forensic Calculations', NULL, 16),
('skills_list', 'Grievance & Legal Administration', 'Meet-and-Confer Proceedings', NULL, 17),
('skills_list', 'Grievance & Legal Administration', 'Joint Labor-Management Committees (JLMC)', NULL, 18),
('skills_list', 'Grievance & Legal Administration', 'Taft-Hartley Trust Compliance', NULL, 19),
('skills_list', 'Grievance & Legal Administration', 'Workplace Investigation Advocacy', NULL, 20),
('skills_list', 'Internal Organizing & Field Strategy', 'Total Workforce Representation (TWR) Metrics', NULL, 21),
('skills_list', 'Internal Organizing & Field Strategy', 'Worksite Unit Mapping', NULL, 22),
('skills_list', 'Internal Organizing & Field Strategy', 'On-the-Ground Strategic Organizing', NULL, 23),
('skills_list', 'Internal Organizing & Field Strategy', 'New Employee Orientation (NEO) Design', NULL, 24),
('skills_list', 'Internal Organizing & Field Strategy', 'Member Leader Recruitment', NULL, 25),
('skills_list', 'Internal Organizing & Field Strategy', 'Dues Check-Off Onboarding Systems', NULL, 26),
('skills_list', 'Internal Organizing & Field Strategy', 'Digital/Telephonic Call Center Campaigns (CallEvo/CallHub)', NULL, 27),
('skills_list', 'Internal Organizing & Field Strategy', 'Member Mobilization & Caucus Leadership', NULL, 28),
('skills_list', 'Internal Organizing & Field Strategy', 'Public-Sector Chapter Management', NULL, 29),
('skills_list', 'Internal Organizing & Field Strategy', 'Campaign Data Analytics', NULL, 30),
('skills_list', 'Compliance, HR, & Financial Diagnostics', 'Forensic Information Requests', NULL, 31),
('skills_list', 'Compliance, HR, & Financial Diagnostics', 'IRS Form 990 & Financial Auditing', NULL, 32),
('skills_list', 'Compliance, HR, & Financial Diagnostics', 'Workplace Violence Prevention Policies', NULL, 33),
('skills_list', 'Compliance, HR, & Financial Diagnostics', 'OSHA Compliance & Log Auditing', NULL, 34),
('skills_list', 'Compliance, HR, & Financial Diagnostics', 'Workers’ Compensation Claim Analysis', NULL, 35),
('skills_list', 'Compliance, HR, & Financial Diagnostics', 'Classification & Retention Studies', NULL, 36),
('skills_list', 'Compliance, HR, & Financial Diagnostics', 'Qualifying Life Event (QLE) Plan Rules', NULL, 37),
('skills_list', 'Compliance, HR, & Financial Diagnostics', 'FMLA / CFRA Leave Administration', NULL, 38),
('skills_list', 'Compliance, HR, & Financial Diagnostics', 'Total Compensation & Wage Opener Modeling', NULL, 39),
('skills_list', 'Compliance, HR, & Financial Diagnostics', 'Turnover Rate Risk Assessment', NULL, 40),
('skills_list', 'Strategic & Global Organizing Campaigns', 'Comprehensive Corporate Campaigns', 'Using strategic pressure on an employer''s weak or vulnerable areas (analyzing social, financial, and political networks) and mobilizing community support rather than relying solely on traditional strikes.', 41),
('skills_list', 'Strategic & Global Organizing Campaigns', 'International Labor Solidarity', 'Partnering with global sister unions (such as the UK-based Unite and the International Transport Workers'' Federation) to execute "all-in" coordinated international campaigns.', 42),
('skills_list', 'Strategic & Global Organizing Campaigns', 'Strategic Direct Actions & Workplace Tactics', 'Planning and executing focused direct-action tactics, such as statewide wage-theft campaigns or community-backed sidewalk work-stoppage meetings.', 43),
('skills_list', 'Regulatory & Board Representation (NLRB & RLA)', 'Unfair Labor Practice (ULP) Enforcement', 'Identifying employer misconduct (such as unlawful retaliation or surface bargaining) and successfully filing, investigating, and litigating ULP charges with the National Labor Relations Board.', 44),
('skills_list', 'Regulatory & Board Representation (NLRB & RLA)', 'Strategic Election Interventions', 'Managing complex representation election procedures, including filing requests to block decertification petitions during active employer interference and fighting for re-run elections following labor board technical errors.', 45),
('skills_list', 'Regulatory & Board Representation (NLRB & RLA)', 'Showing of Interest & Card Checks', 'Managing and verifying authorization cards or petitions to establish clear bargaining unit majority or cross-table recognition.', 46),
('skills_list', 'Internal Union Governance & Oversight', 'Trusteeships', 'Understanding the process of appointing and acting as a temporary trustee to manage local union assets, rectify internal financial malpractices, handle independent audits, and correct administrative corruption.', 47),
('skills_list', 'Internal Union Governance & Oversight', 'Fiduciary & Compliance Monitoring', 'Utilizing independent bodies (like the Independent Review Board) to permanently bar corrupt elements, handle confidential hotline investigations, and ensure compliance with the Landrum-Griffin Act.', 48),
('skills_list', 'Workplace Advocacy & Employee Protections', 'Weingarten Rights & Interrogation Defense', 'Safeguarding workers against management coercion during critical investigatory interviews, serving as a witness, objecting to intimidation, and raising extenuating factors.', 49),
('skills_list', 'Workplace Advocacy & Employee Protections', 'External Statutory Enforcement', 'Educating and representing members on rights derived entirely outside the collective bargaining agreement, such as the Family and Medical Leave Act (FMLA), California Family Rights Act (CFRA), Workers'' Compensation, and the Americans with Disabilities Act (ADA).', 50),
('skills_list', 'Political Action & Community Engagement', 'Governmental & Legislative Affairs', 'Engaging in political activism, lobbying for key legislative initiatives, and coordinating with municipal regulatory bodies (e.g., SFMTA, Board of Supervisors) to advocate on behalf of the workforce.', 51),
('skills_list', 'Political Action & Community Engagement', 'Community Coalition Building', 'Partnering with regional organizing coalitions (e.g., Silicon Valley Rising) and local community/charitable networks to protect living standards and affordable housing initiatives.', 52);
