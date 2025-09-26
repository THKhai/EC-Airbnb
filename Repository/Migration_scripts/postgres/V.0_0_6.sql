-- Insert sample data for property_images table
INSERT INTO property_images (
    property_id, image_url, alt_text, title, display_order, is_primary, created_at
) VALUES

-- Images for property_id = 1
(1, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', 'Modern living room with city view', 'Spacious Living Area', 0, true, CURRENT_TIMESTAMP),
(1, 'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800', 'Master bedroom with king size bed', 'Master Bedroom', 1, false, CURRENT_TIMESTAMP),
(1, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800', 'Modern kitchen with granite countertops', 'Kitchen', 2, false, CURRENT_TIMESTAMP),
(1, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800', 'Bathroom with modern fixtures', 'Bathroom', 3, false, CURRENT_TIMESTAMP),
(1, 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800', 'City skyline view from balcony', 'City View', 4, false, CURRENT_TIMESTAMP),

-- Images for property_id = 2
(2, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'Cozy studio apartment interior', 'Studio Interior', 0, true, CURRENT_TIMESTAMP),
(2, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', 'Comfortable bed area', 'Sleeping Area', 1, false, CURRENT_TIMESTAMP),
(2, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800', 'Compact kitchen setup', 'Kitchen Area', 2, false, CURRENT_TIMESTAMP),
(2, 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800', 'View of Central Park', 'Park View', 3, false, CURRENT_TIMESTAMP),

-- Images for property_id = 3
(3, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', 'Luxury penthouse living room', 'Grand Living Room', 0, true, CURRENT_TIMESTAMP),
(3, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', 'Master suite with panoramic views', 'Master Suite', 1, false, CURRENT_TIMESTAMP),
(3, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800', 'Gourmet kitchen with premium appliances', 'Gourmet Kitchen', 2, false, CURRENT_TIMESTAMP),
(3, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800', 'Luxury marble bathroom', 'Luxury Bathroom', 3, false, CURRENT_TIMESTAMP),
(3, 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800', 'Panoramic city skyline view', 'Skyline View', 4, false, CURRENT_TIMESTAMP),
(3, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', 'Private rooftop terrace', 'Rooftop Terrace', 5, false, CURRENT_TIMESTAMP),

-- Images for property_id = 4
(4, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', 'Artist loft with high ceilings', 'Loft Space', 0, true, CURRENT_TIMESTAMP),
(4, 'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800', 'Creative workspace area', 'Work Area', 1, false, CURRENT_TIMESTAMP),
(4, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800', 'Industrial style kitchen', 'Kitchen', 2, false, CURRENT_TIMESTAMP),
(4, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', 'Exposed brick wall feature', 'Brick Wall', 3, false, CURRENT_TIMESTAMP),

-- Images for property_id = 5
(5, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', 'Victorian house exterior', 'House Exterior', 0, true, CURRENT_TIMESTAMP),
(5, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', 'Victorian living room with period features', 'Living Room', 1, false, CURRENT_TIMESTAMP),
(5, 'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800', 'Traditional bedroom with antique furniture', 'Bedroom', 2, false, CURRENT_TIMESTAMP),
(5, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800', 'Classic kitchen with modern updates', 'Kitchen', 3, false, CURRENT_TIMESTAMP),
(5, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', 'Beautiful garden view', 'Garden', 4, false, CURRENT_TIMESTAMP),

-- Images for property_id = 3109
(3109, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', 'Modern downtown apartment living space', 'Living Space', 0, true, CURRENT_TIMESTAMP),
(3109, 'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800', 'Bedroom with city views', 'Bedroom', 1, false, CURRENT_TIMESTAMP),
(3109, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800', 'Modern kitchen amenities', 'Kitchen', 2, false, CURRENT_TIMESTAMP),
(3109, 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800', 'Downtown cityscape view', 'City View', 3, false, CURRENT_TIMESTAMP),

-- Images for property_id = 11798
(11798, 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', 'Cozy studio near Central Park', 'Studio View', 0, true, CURRENT_TIMESTAMP),
(11798, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', 'Comfortable sleeping area', 'Sleep Area', 1, false, CURRENT_TIMESTAMP),
(11798, 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800', 'Central Park proximity', 'Park Nearby', 2, false, CURRENT_TIMESTAMP),

-- Images for property_id = 15253
(15253, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', 'Luxury penthouse interior', 'Penthouse Interior', 0, true, CURRENT_TIMESTAMP),
(15253, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', 'Premium master bedroom', 'Master Bedroom', 1, false, CURRENT_TIMESTAMP),
(15253, 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800', 'High-end kitchen appliances', 'Premium Kitchen', 2, false, CURRENT_TIMESTAMP),
(15253, 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800', 'Marble bathroom suite', 'Luxury Bath', 3, false, CURRENT_TIMESTAMP),
(15253, 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800', 'Panoramic city views', 'City Panorama', 4, false, CURRENT_TIMESTAMP),

-- Images for property_id = 16580
(16580, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', 'Artist loft in SoHo', 'SoHo Loft', 0, true, CURRENT_TIMESTAMP),
(16580, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', 'Creative living space', 'Creative Space', 1, false, CURRENT_TIMESTAMP),
(16580, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', 'Industrial design elements', 'Industrial Style', 2, false, CURRENT_TIMESTAMP),

-- Images for property_id = 16626
(16626, 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', 'Victorian house facade', 'House Front', 0, true, CURRENT_TIMESTAMP),
(16626, 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', 'Period living room features', 'Period Features', 1, false, CURRENT_TIMESTAMP),
(16626, 'https://images.unsplash.com/photo-1556020685-ae41abfc9365?w=800', 'Classic bedroom design', 'Classic Bedroom', 2, false, CURRENT_TIMESTAMP),
(16626, 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', 'Garden and outdoor space', 'Garden Space', 3, false, CURRENT_TIMESTAMP);


alter table users add column phone_number varchar(15);
alter table users add column gender varchar(10);