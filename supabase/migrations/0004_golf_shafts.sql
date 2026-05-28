-- ── golf_shafts table ─────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS golf_shafts (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  brand       text NOT NULL,
  model       text NOT NULL,
  category    text NOT NULL,
  search_text text GENERATED ALWAYS AS (
    lower(brand || ' ' || model)
  ) STORED
);

CREATE INDEX IF NOT EXISTS golf_shafts_search_trgm
  ON golf_shafts USING gin(search_text gin_trgm_ops);

ALTER TABLE golf_shafts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "readable by all"
  ON golf_shafts FOR SELECT USING (true);

-- ── Add skaft_merke to annonser ───────────────────────────────────────────────

ALTER TABLE annonser ADD COLUMN IF NOT EXISTS skaft_merke text;

-- ── Shaft seed data ───────────────────────────────────────────────────────────

INSERT INTO golf_shafts (brand, model, category) VALUES

-- Driver & Fairway
('Fujikura', 'Ventus Blue', 'driver_fairway'),
('Fujikura', 'Ventus Red', 'driver_fairway'),
('Fujikura', 'Ventus Black', 'driver_fairway'),
('Fujikura', 'Ventus TR Blue', 'driver_fairway'),
('Fujikura', 'Ventus TR Red', 'driver_fairway'),
('Fujikura', 'Ventus TR Black', 'driver_fairway'),
('Fujikura', 'Speeder NX', 'driver_fairway'),
('Fujikura', 'Speeder Evolution 7', 'driver_fairway'),
('Mitsubishi', 'Tensei AV Blue', 'driver_fairway'),
('Mitsubishi', 'Tensei AV White', 'driver_fairway'),
('Mitsubishi', 'Tensei AV Raw Blue', 'driver_fairway'),
('Mitsubishi', 'Tensei AV Raw White', 'driver_fairway'),
('Mitsubishi', 'Diamana D+', 'driver_fairway'),
('Mitsubishi', 'Diamana S+', 'driver_fairway'),
('Mitsubishi', 'Diamana ZF', 'driver_fairway'),
('Mitsubishi', 'Diamana GT', 'driver_fairway'),
('Mitsubishi', 'KURO KAGE Black TiNi', 'driver_fairway'),
('Project X', 'HZRDUS Smoke Black RDX', 'driver_fairway'),
('Project X', 'HZRDUS Smoke Yellow', 'driver_fairway'),
('Project X', 'HZRDUS Smoke Green', 'driver_fairway'),
('Project X', 'HZRDUS Red', 'driver_fairway'),
('Project X', 'Even Flow Riptide CB', 'driver_fairway'),
('Project X', 'Even Flow T1100', 'driver_fairway'),
('Graphite Design', 'Tour AD DI', 'driver_fairway'),
('Graphite Design', 'Tour AD IZ', 'driver_fairway'),
('Graphite Design', 'Tour AD VF', 'driver_fairway'),
('Graphite Design', 'Tour AD CQ', 'driver_fairway'),
('Graphite Design', 'Tour AD BB', 'driver_fairway'),
('Aldila', 'Rogue White 130 MSI', 'driver_fairway'),
('Aldila', 'Rogue Black', 'driver_fairway'),
('Aldila', 'Synergy 60', 'driver_fairway'),
('Aldila', 'NV 2KXV Blue', 'driver_fairway'),
('UST Mamiya', 'Helium Nanocore', 'driver_fairway'),
('UST Mamiya', 'Lin-Q Blue', 'driver_fairway'),
('UST Mamiya', 'Recoil 460 ESX', 'driver_fairway'),
('Accra', 'TZ5', 'driver_fairway'),
('Accra', 'Concept 90', 'driver_fairway'),
('Matrix', 'Ozik HD', 'driver_fairway'),
('Oban', 'Kiyoshi Purple', 'driver_fairway'),
('Oban', 'Devotion', 'driver_fairway'),
('MCA', 'Tensei 1K Black', 'driver_fairway'),

-- Iron shafts
('True Temper', 'Dynamic Gold S300', 'iron'),
('True Temper', 'Dynamic Gold S400', 'iron'),
('True Temper', 'Dynamic Gold X100', 'iron'),
('True Temper', 'Dynamic Gold 105', 'iron'),
('True Temper', 'Dynamic Gold 120', 'iron'),
('True Temper', 'AMT Tour White', 'iron'),
('True Temper', 'AMT Tour Red', 'iron'),
('True Temper', 'AMT Black', 'iron'),
('True Temper', 'XP 95', 'iron'),
('KBS', 'Tour', 'iron'),
('KBS', 'Tour 90', 'iron'),
('KBS', 'Tour 80', 'iron'),
('KBS', 'Tour Lite', 'iron'),
('KBS', 'C-Taper', 'iron'),
('KBS', 'C-Taper Lite', 'iron'),
('KBS', 'C-Taper 125', 'iron'),
('KBS', 'Shaft', 'iron'),
('KBS', 'Max 90', 'iron'),
('Nippon', 'Modus3 Tour 105', 'iron'),
('Nippon', 'Modus3 Tour 120', 'iron'),
('Nippon', 'Modus3 Tour 125', 'iron'),
('Nippon', 'Modus3 System 3', 'iron'),
('Nippon', 'NS Pro 950 GH', 'iron'),
('Nippon', 'NS Pro 1050 GH', 'iron'),
('Nippon', 'NS Pro 1150 GH Neo', 'iron'),
('Project X', '5.0', 'iron'),
('Project X', '5.5', 'iron'),
('Project X', '6.0', 'iron'),
('Project X', '6.5', 'iron'),
('Project X', 'LZ 5.0', 'iron'),
('Project X', 'LZ 5.5', 'iron'),
('Project X', 'IO', 'iron'),
('Aerotech', 'SteelFiber i80', 'iron'),
('Aerotech', 'SteelFiber i95', 'iron'),
('Aerotech', 'SteelFiber i110', 'iron'),
('Aerotech', 'SteelFiber fc80', 'iron'),
('UST Mamiya', 'Recoil 95 ESX', 'iron'),
('UST Mamiya', 'Recoil 110 ESX', 'iron'),
('Fujikura', 'Elevate MCI 80', 'iron'),
('Fujikura', 'Elevate MCI 95', 'iron'),
('Graphite Design', 'Tour AD HY', 'iron'),
('Accra', 'FX 1.0', 'iron'),
('Aldila', 'Rogue Black 130 MSI', 'iron'),

-- Wedge shafts
('True Temper', 'Dynamic Gold S400', 'wedge'),
('True Temper', 'Dynamic Gold X100', 'wedge'),
('True Temper', 'Dynamic Gold Tour Issue S400', 'wedge'),
('KBS', 'Hi-Rev 2.0', 'wedge'),
('KBS', 'Tour', 'wedge'),
('KBS', 'Wedge', 'wedge'),
('Nippon', 'Modus3 Wedge', 'wedge'),
('Project X', '6.0', 'wedge'),
('Project X', '6.5', 'wedge'),

-- Putter shafts
('BGT', 'Stability Tour', 'putter'),
('BGT', 'Stability Classic', 'putter'),
('BGT', 'Stability Tour Black', 'putter'),
('KBS', 'CT Tour', 'putter'),
('KBS', 'Putter', 'putter'),
('Ping', 'Cushin', 'putter'),
('Ping', 'Cushin+', 'putter'),
('Odyssey', 'Stroke Lab', 'putter'),
('True Temper', 'GS95', 'putter'),
('UST Mamiya', 'Matador', 'putter'),
('Nippon', 'Putter Steel', 'putter');

-- ── Additional club data ───────────────────────────────────────────────────────

INSERT INTO golf_equipment (brand, model, year, category) VALUES

-- Drivers
('Titleist', 'GT3', 2024, 'driver'),
('Titleist', 'GT2', 2024, 'driver'),
('Titleist', 'GT1', 2024, 'driver'),
('Titleist', 'TSR3', 2023, 'driver'),
('Titleist', 'TSR2', 2023, 'driver'),
('Titleist', 'TSi3', 2021, 'driver'),
('Ping', 'G430 Max', 2023, 'driver'),
('Ping', 'G430 LST', 2023, 'driver'),
('Ping', 'G430 SFT', 2023, 'driver'),
('Ping', 'G410 Plus', 2019, 'driver'),
('Ping', 'G400 Max', 2018, 'driver'),
('Ping', 'G425 Max', 2021, 'driver'),
('TaylorMade', 'Qi10 Max', 2024, 'driver'),
('TaylorMade', 'Qi10', 2024, 'driver'),
('TaylorMade', 'Qi10 LS', 2024, 'driver'),
('TaylorMade', 'Stealth', 2022, 'driver'),
('TaylorMade', 'SIM2 Max', 2021, 'driver'),
('Callaway', 'Paradym Ai Smoke Max', 2024, 'driver'),
('Callaway', 'Paradym Ai Smoke LS', 2024, 'driver'),
('Callaway', 'Paradym X', 2023, 'driver'),
('Callaway', 'Rogue ST Max', 2022, 'driver'),
('Cobra', 'Darkspeed X', 2024, 'driver'),
('Cobra', 'Darkspeed LS', 2024, 'driver'),
('Cobra', 'Aerojet Max', 2023, 'driver'),
('Srixon', 'ZX7 Mk II', 2023, 'driver'),
('Cleveland', 'Launcher XL2', 2023, 'driver'),
('Mizuno', 'ST-X 230', 2023, 'driver'),
('Wilson', 'Dynapower', 2023, 'driver'),

-- Fairway woods
('Titleist', 'GT2 Fairway', 2024, 'fairway_wood'),
('Titleist', 'GT3 Fairway', 2024, 'fairway_wood'),
('Titleist', 'TSR2 Fairway', 2023, 'fairway_wood'),
('Titleist', 'TSR3 Fairway', 2023, 'fairway_wood'),
('Ping', 'G430 LST Fairway', 2023, 'fairway_wood'),
('TaylorMade', 'Qi10 Fairway', 2024, 'fairway_wood'),
('TaylorMade', 'Stealth 2 Fairway', 2023, 'fairway_wood'),
('Callaway', 'Paradym Ai Smoke Fairway', 2024, 'fairway_wood'),
('Callaway', 'Paradym Fairway', 2023, 'fairway_wood'),
('Cobra', 'Darkspeed Fairway', 2024, 'fairway_wood'),
('Srixon', 'ZX Mk II Fairway', 2023, 'fairway_wood'),

-- Hybrids
('Titleist', 'GT2 Hybrid', 2024, 'hybrid'),
('Ping', 'G430 Hybrid', 2023, 'hybrid'),
('TaylorMade', 'Qi10 Rescue', 2024, 'hybrid'),
('Callaway', 'Paradym Ai Smoke Hybrid', 2024, 'hybrid'),
('Cobra', 'Darkspeed Hybrid', 2024, 'hybrid'),

-- Irons
('Titleist', 'T100', 2023, 'jernsett'),
('Titleist', 'T100S', 2023, 'jernsett'),
('Titleist', 'T150', 2023, 'jernsett'),
('Titleist', 'T350', 2023, 'jernsett'),
('Titleist', 'AP2 718', 2018, 'jernsett'),
('Ping', 'i525', 2022, 'jernsett'),
('Ping', 'G430', 2023, 'jernsett'),
('Ping', 'Blueprint S', 2023, 'jernsett'),
('TaylorMade', 'P7MC', 2021, 'jernsett'),
('TaylorMade', 'P7MB', 2021, 'jernsett'),
('Callaway', 'Apex Pro', 2024, 'jernsett'),
('Callaway', 'Apex CB', 2024, 'jernsett'),
('Callaway', 'Apex MB', 2024, 'jernsett'),
('Callaway', 'Paradym Ai Smoke', 2024, 'jernsett'),
('Mizuno', 'JPX 923 Tour', 2023, 'jernsett'),
('Mizuno', 'JPX 923 Hot Metal', 2023, 'jernsett'),
('Mizuno', 'MP-20 MB', 2020, 'jernsett'),
('Srixon', 'ZX7 Mk II', 2023, 'jernsett'),
('Srixon', 'ZX5 Mk II', 2023, 'jernsett'),
('Cleveland', 'ZipCore XL', 2022, 'jernsett'),
('Wilson', 'D9 Forged', 2021, 'jernsett'),

-- Wedges
('Titleist', 'Vokey SM8', 2020, 'wedge'),
('Cleveland', 'RTX Full-Face 2', 2023, 'wedge'),
('Callaway', 'PM Grind 22', 2022, 'wedge'),
('TaylorMade', 'Hi-Toe 4', 2024, 'wedge'),
('TaylorMade', 'MG4', 2024, 'wedge'),
('Mizuno', 'T24', 2024, 'wedge'),
('Mizuno', 'T22', 2022, 'wedge'),
('Cobra', 'King Cobra Snakebite', 2023, 'wedge'),
('Wilson', 'Staff Model Wedge', 2022, 'wedge'),

-- Putters
('Scotty Cameron', 'Phantom 11', 2023, 'putter'),
('Scotty Cameron', 'Phantom X 11', 2022, 'putter'),
('Scotty Cameron', 'Special Select Newport 2', 2021, 'putter'),
('Scotty Cameron', 'Super Select Newport 2', 2023, 'putter'),
('Ping', 'PLD Anser', 2023, 'putter'),
('Ping', 'PLD Milled DS72', 2023, 'putter'),
('Ping', 'Sigma 2 Tyne', 2021, 'putter'),
('TaylorMade', 'Spider Tour', 2023, 'putter'),
('TaylorMade', 'Spider GT', 2022, 'putter'),
('TaylorMade', 'TP Hydro Blast', 2021, 'putter'),
('Odyssey', 'White Hot OG #1', 2022, 'putter'),
('Odyssey', 'Tri-Hot 5K', 2023, 'putter'),
('Cleveland', 'Frontline Elite', 2022, 'putter'),
('Bettinardi', 'BB1', 2023, 'putter'),
('Bettinardi', 'BB8', 2023, 'putter'),
('Evnroll', 'ER2', 2023, 'putter');
