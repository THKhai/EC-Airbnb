-- Insert 20 sample properties data
INSERT INTO properties (
    id, host_id, title, description, property_type, category, max_guests, bedrooms, bathrooms,
    address_line1, city, state, country, postal_code, latitude, longitude,
    base_price, cleaning_fee, cancellation_policy, instant_book, minimum_stay,
    home_tier, is_guest_favorite, language, status, created_at, updated_at
) VALUES
-- Apartment properties
(3109, 1001, 'Modern Downtown Apartment', 'Stylish 2-bedroom apartment in the heart of the city with stunning views', 'Apartment', 'City', 4, 2, 2, '123 Main Street', 'New York', 'NY', 'USA', '10001', 40.7589, -73.9851, 150.00, 25.00, 'Moderate', true, 2, 1, true, 'English', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(11798, 1002, 'Cozy Studio Near Central Park', 'Charming studio apartment perfect for couples, walking distance to Central Park', 'Apartment', 'City', 2, 1, 1, '456 Park Avenue', 'New York', 'NY', 'USA', '10022', 40.7614, -73.9776, 120.00, 20.00, 'Flexible', false, 1, 1, false, 'English', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(15253, 1003, 'Luxury Penthouse Apartment', 'Exclusive penthouse with panoramic city views and premium amenities', 'Apartment', 'Luxury', 6, 3, 3, '789 Fifth Avenue', 'New York', 'NY', 'USA', '10065', 40.7505, -73.9934, 400.00, 50.00, 'Strict', false, 3, 3, true, 'English', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(16580, 1004, 'Artist Loft in SoHo', 'Creative space in trendy SoHo district, perfect for artists and creatives', 'Apartment', 'City', 4, 2, 1, '321 Spring Street', 'New York', 'NY', 'USA', '10012', 40.7230, -74.0037, 180.00, 30.00, 'Moderate', true, 2, 2, false, 'English', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- House properties
(16626, 1005, 'Charming Victorian House', 'Beautiful 4-bedroom Victorian house with garden and period features', 'House', 'City', 8, 4, 3, '567 Elm Street', 'San Francisco', 'CA', 'USA', '94102', 37.7749, -122.4194, 250.00, 40.00, 'Moderate', false, 2, 2, true, 'English', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(3110, 1006, 'Modern Family House', 'Spacious contemporary home perfect for families, with backyard and garage', 'House', 'City', 10, 5, 4, '890 Oak Drive', 'Los Angeles', 'CA', 'USA', '90210', 34.0522, -118.2437, 300.00, 45.00, 'Flexible', true, 3, 2, false, 'English', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(11799, 1007, 'Historic Brownstone', 'Elegant brownstone house in historic neighborhood with original details', 'House', 'Luxury', 6, 3, 2, '234 Beacon Street', 'Boston', 'MA', 'USA', '02116', 42.3601, -71.0589, 280.00, 35.00, 'Strict', false, 2, 3, true, 'English', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(15254, 1008, 'Suburban Family Home', 'Comfortable suburban house with large yard, perfect for family vacations', 'House', 'City', 8, 4, 3, '678 Maple Lane', 'Chicago', 'IL', 'USA', '60601', 41.8781, -87.6298, 200.00, 30.00, 'Moderate', true, 2, 2, false, 'English', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Condo properties
(16581, 1009, 'Luxury Beachfront Condo', 'Stunning oceanfront condominium with private balcony and beach access', 'Condo', 'Beach', 6, 3, 2, '123 Ocean Drive', 'Miami', 'FL', 'USA', '33139', 25.7617, -80.1918, 350.00, 50.00, 'Strict', false, 3, 3, true, 'English', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(16627, 1010, 'Mountain View Condo', 'Beautiful condo with spectacular mountain views and ski access', 'Condo', 'Mountain', 4, 2, 2, '456 Alpine Way', 'Aspen', 'CO', 'USA', '81611', 39.1911, -106.8175, 275.00, 40.00, 'Moderate', true, 2, 2, true, 'English', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(3111, 1011, 'Downtown Luxury Condo', 'High-end condominium in prime downtown location with concierge service', 'Condo', 'Luxury', 4, 2, 2, '789 City Center', 'Seattle', 'WA', 'USA', '98101', 47.6062, -122.3321, 225.00, 35.00, 'Flexible', false, 2, 3, false, 'English', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(11800, 1012, 'Waterfront Condo Resort', 'Resort-style condominium with marina views and resort amenities', 'Condo', 'Beach', 6, 3, 2, '321 Marina Boulevard', 'San Diego', 'CA', 'USA', '92101', 32.7157, -117.1611, 300.00, 45.00, 'Moderate', true, 3, 2, true, 'English', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Villa properties
(15255, 1013, 'Mediterranean Villa', 'Luxurious villa with pool, garden, and Mediterranean-style architecture', 'Villa', 'Luxury', 12, 6, 5, '567 Villa Road', 'Napa', 'CA', 'USA', '94558', 38.2975, -122.2869, 500.00, 75.00, 'Strict', false, 4, 3, true, 'English', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(16582, 1014, 'Tuscan-Style Villa', 'Elegant villa surrounded by vineyards with wine tasting facilities', 'Villa', 'Rural', 10, 5, 4, '890 Vineyard Lane', 'Sonoma', 'CA', 'USA', '95476', 38.2919, -122.4580, 450.00, 70.00, 'Moderate', true, 3, 3, true, 'English', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(16628, 1015, 'Hilltop Villa Retreat', 'Private villa with panoramic views and infinity pool', 'Villa', 'Mountain', 8, 4, 3, '234 Summit Drive', 'Sedona', 'AZ', 'USA', '86336', 34.8697, -111.7610, 400.00, 60.00, 'Strict', false, 3, 3, false, 'English', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Cabin properties
(3112, 1016, 'Rustic Mountain Cabin', 'Cozy log cabin in the mountains with fireplace and hot tub', 'Cabin', 'Mountain', 6, 3, 2, '678 Forest Trail', 'Big Bear', 'CA', 'USA', '92315', 34.2439, -116.9114, 175.00, 25.00, 'Flexible', true, 2, 1, true, 'English', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(11801, 1017, 'Lakeside Log Cabin', 'Traditional cabin right on the lake with private dock and canoe', 'Cabin', 'Rural', 8, 4, 2, '123 Lake Shore Drive', 'Lake Tahoe', 'CA', 'USA', '96150', 38.9697, -119.9447, 200.00, 30.00, 'Moderate', false, 2, 2, false, 'English', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(15256, 1018, 'Ski Chalet Cabin', 'Alpine-style cabin near ski slopes with mountain views', 'Cabin', 'Mountain', 10, 5, 3, '456 Snow Peak Road', 'Vail', 'CO', 'USA', '81657', 39.6403, -106.3742, 325.00, 50.00, 'Strict', true, 3, 2, true, 'English', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Additional mixed properties
(16583, 1019, 'Beachside Cottage House', 'Charming beach cottage with ocean views and private beach access', 'House', 'Beach', 6, 3, 2, '789 Coastal Highway', 'Malibu', 'CA', 'USA', '90265', 34.0259, -118.7798, 380.00, 55.00, 'Moderate', true, 3, 3, true, 'English', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

(16629, 1020, 'Urban Luxury Apartment', 'Premium apartment in financial district with city skyline views', 'Apartment', 'Luxury', 4, 2, 2, '321 Financial Plaza', 'San Francisco', 'CA', 'USA', '94105', 37.7849, -122.4094, 320.00, 45.00, 'Flexible', false, 2, 3, false, 'English', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);