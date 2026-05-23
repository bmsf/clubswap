-- Enable trigram extension for efficient ILIKE search on search_text
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ── golf_equipment table ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS golf_equipment (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand       text NOT NULL,
  model       text NOT NULL,
  year        integer,
  category    text NOT NULL,
  search_text text GENERATED ALWAYS AS (
    lower(brand || ' ' || model || ' ' || COALESCE(year::text, ''))
  ) STORED
);

CREATE INDEX IF NOT EXISTS golf_equipment_search_trgm
  ON golf_equipment USING gin(search_text gin_trgm_ops);

ALTER TABLE golf_equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "readable by all"
  ON golf_equipment FOR SELECT USING (true);

-- ── Seed data ─────────────────────────────────────────────────────────────────
-- category values must match annonser.kategori

INSERT INTO golf_equipment (brand, model, year, category) VALUES

  -- Drivers
  ('TaylorMade',    'Stealth 2',                    2023, 'driver'),
  ('TaylorMade',    'Stealth 2 Plus',               2023, 'driver'),
  ('TaylorMade',    'Qi10',                         2024, 'driver'),
  ('TaylorMade',    'Qi10 Max',                     2024, 'driver'),
  ('TaylorMade',    'SIM2',                         2021, 'driver'),
  ('TaylorMade',    'M6',                           2019, 'driver'),
  ('Callaway',      'Paradym',                      2023, 'driver'),
  ('Callaway',      'Paradym Ai Smoke',             2024, 'driver'),
  ('Titleist',      'TSR3',                         2022, 'driver'),
  ('Titleist',      'TSR2',                         2022, 'driver'),
  ('Titleist',      'GT3',                          2024, 'driver'),
  ('Titleist',      'GT2',                          2024, 'driver'),
  ('Ping',          'G430 Max',                     2023, 'driver'),
  ('Ping',          'G430 LST',                     2023, 'driver'),
  ('Cobra',         'Aerojet',                      2023, 'driver'),
  ('Cobra',         'Darkspeed',                    2024, 'driver'),
  ('Srixon',        'ZX5 Mk II',                    2023, 'driver'),
  ('Mizuno',        'ST-Z 230',                     2023, 'driver'),

  -- Fairway woods
  ('TaylorMade',    'Qi10 HL',                      2024, 'fairway_wood'),
  ('TaylorMade',    'Stealth 2 HD',                 2023, 'fairway_wood'),
  ('Callaway',      'Paradym Ai Smoke FW',          2024, 'fairway_wood'),
  ('Titleist',      'TSi2 Fairway',                 2021, 'fairway_wood'),
  ('Ping',          'G430 Max Fairway',             2023, 'fairway_wood'),
  ('Cobra',         'Aerojet Fairway',              2023, 'fairway_wood'),

  -- Hybrids
  ('TaylorMade',    'Stealth 2 Rescue',             2023, 'hybrid'),
  ('Callaway',      'Apex Hybrid',                  2023, 'hybrid'),
  ('Titleist',      'TSi2 Hybrid',                  2022, 'hybrid'),
  ('Ping',          'G430 Hybrid',                  2023, 'hybrid'),
  ('Cobra',         'Aerojet Hybrid',               2023, 'hybrid'),
  ('Cleveland',     'Launcher XL Halo Hybrid',      2022, 'hybrid'),

  -- Jernsett (iron sets)
  ('TaylorMade',    'P770',                         2023, 'jernsett'),
  ('TaylorMade',    'P790',                         2023, 'jernsett'),
  ('TaylorMade',    'P7MB',                         2023, 'jernsett'),
  ('Callaway',      'Apex Pro',                     2023, 'jernsett'),
  ('Callaway',      'Apex DCB',                     2023, 'jernsett'),
  ('Callaway',      'X Forged CB',                  2021, 'jernsett'),
  ('Titleist',      'T100',                         2023, 'jernsett'),
  ('Titleist',      'T150',                         2023, 'jernsett'),
  ('Titleist',      'T200',                         2023, 'jernsett'),
  ('Ping',          'i230',                         2023, 'jernsett'),
  ('Ping',          'Blueprint T',                  2024, 'jernsett'),
  ('Ping',          'G730',                         2024, 'jernsett'),
  ('Mizuno',        'JPX923 Hot Metal',             2023, 'jernsett'),
  ('Mizuno',        'JPX923 Forged',                2023, 'jernsett'),
  ('Mizuno',        'MP-20 HMB',                    2020, 'jernsett'),
  ('Srixon',        'Z-Forged II',                  2022, 'jernsett'),
  ('Cobra',         'King Tour',                    2022, 'jernsett'),

  -- Wedges
  ('TaylorMade',    'Milled Grind 4',               2024, 'wedge'),
  ('Callaway',      'Jaws Raw',                     2022, 'wedge'),
  ('Titleist',      'Vokey SM10',                   2024, 'wedge'),
  ('Titleist',      'Vokey SM9',                    2022, 'wedge'),
  ('Ping',          'Glide 4.0',                    2023, 'wedge'),
  ('Cleveland',     'RTX 6 ZipCore',                2022, 'wedge'),
  ('Cleveland',     'RTX Full-Face 2',              2024, 'wedge'),
  ('Callaway',      'Jaws Full Toe',                2023, 'wedge'),

  -- Putters
  ('Scotty Cameron','Phantom X 5',                  2023, 'putter'),
  ('Scotty Cameron','Special Select Fastback 1.5',  2022, 'putter'),
  ('Scotty Cameron','Newport 2',                    2022, 'putter'),
  ('Odyssey',       'White Hot OG #7',              2022, 'putter'),
  ('Odyssey',       'Ai-ONE Milled',                2024, 'putter'),
  ('Odyssey',       'Eleven',                       2022, 'putter'),
  ('Ping',          'Anser 2',                      2022, 'putter'),

  -- Bags
  ('TaylorMade',    'FlexTech Stand Bag',           2024, 'stand_bag'),
  ('Ping',          'Hoofer 14',                    2023, 'stand_bag'),
  ('Titleist',      'Players 4 Plus',               2023, 'stand_bag'),
  ('Callaway',      'Hyperlite Zero',               2023, 'stand_bag'),
  ('Sun Mountain',  'C-130',                        2023, 'cart_bag'),
  ('Titleist',      'StaDry',                       2023, 'cart_bag'),

  -- Shoes
  ('FootJoy',       'Pro SL',                       2023, 'sko'),
  ('FootJoy',       'Premiere Series',              2024, 'sko'),
  ('Ecco',          'Biom G5',                      2023, 'sko'),
  ('Adidas',        'Tour360 22',                   2022, 'sko'),
  ('Nike',          'Air Max 270 G',                2022, 'sko'),
  ('Puma',          'Ignite Fasten8',               2023, 'sko'),

  -- Rangefinders
  ('Bushnell',      'Pro XE',                       2023, 'rangefinder'),
  ('Bushnell',      'Tour V6',                      2022, 'rangefinder'),
  ('Garmin',        'Approach Z82',                 2023, 'rangefinder'),
  ('Leupold',       'GX-5c',                        2022, 'rangefinder'),
  ('Nikon',         'Coolshot Pro II',              2022, 'rangefinder'),

  -- Balls
  ('Titleist',      'Pro V1',                       2023, 'baller'),
  ('Titleist',      'Pro V1x',                      2023, 'baller'),
  ('Callaway',      'Chrome Soft',                  2023, 'baller'),
  ('Bridgestone',   'Tour B XS',                    2022, 'baller'),
  ('Srixon',        'Z-Star XV',                    2022, 'baller'),
  ('TaylorMade',    'TP5',                          2023, 'baller');
