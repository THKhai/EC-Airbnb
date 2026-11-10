-- ===================================================================
-- INSERT SAMPLE DATA FOR AUCTIONS AND BOOKINGS TABLES
-- ===================================================================

-- First, let's insert additional sample users if needed
INSERT INTO users (id, email, username, full_name, first_name, last_name, verification_status, is_active, created_at, updated_at) VALUES
(500001, 'guest1@example.com', 'guest_user_1', 'Alice Johnson', 'Alice', 'Johnson', 'VERIFIED', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(500002, 'guest2@example.com', 'guest_user_2', 'Bob Smith', 'Bob', 'Smith', 'VERIFIED', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(500003, 'guest3@example.com', 'guest_user_3', 'Carol Williams', 'Carol', 'Williams', 'VERIFIED', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(500004, 'guest4@example.com', 'guest_user_4', 'David Brown', 'David', 'Brown', 'VERIFIED', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(500005, 'guest5@example.com', 'guest_user_5', 'Emma Davis', 'Emma', 'Davis', 'VERIFIED', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- ===================================================================
-- AUCTIONS TABLE INSERTS
-- ===================================================================

-- Auction 1: Paris Zen Apartment (Property ID: 3109)
INSERT INTO auctions (
    id, property_id, start_date, end_date, min_nights, max_nights,
    starting_price, current_highest_bid, bid_increment, minimum_bid,
    auction_start_time, auction_end_time, objective, status, winner_user_id, total_bids
) VALUES (
    '11111111-1111-1111-1111-111111111111', 3109, '2025-08-15', '2025-08-20',
    2, 5, 50.00, 65.00, 5.00, 50.00,
    '2025-08-10 10:00:00', '2025-08-14 18:00:00', 'HIGHEST_TOTAL', 'ACTIVE', NULL, 3
);

-- Auction 2: Amazing Loft in Paris (Property ID: 11798)
INSERT INTO auctions (
    id, property_id, start_date, end_date, min_nights, max_nights,
    starting_price, current_highest_bid, bid_increment, minimum_bid,
    auction_start_time, auction_end_time, objective, status, winner_user_id, total_bids
) VALUES (
    '22222222-2222-2222-2222-222222222222', 11798, '2025-08-18', '2025-08-25',
    3, 7, 70.00, 85.00, 5.00, 70.00,
    '2025-08-12 09:00:00', '2025-08-17 20:00:00', 'HIGHEST_PER_NIGHT', 'COMPLETE', NULL, 5
);

-- Auction 3: Sydney Rooftop Apartment (Property ID: 15253)
INSERT INTO auctions (
    id, property_id, start_date, end_date, min_nights, max_nights,
    starting_price, current_highest_bid, bid_increment, minimum_bid,
    auction_start_time, auction_end_time, objective, status, winner_user_id, total_bids
) VALUES (
    '33333333-3333-3333-3333-333333333333', 15253, '2025-09-01', '2025-09-07',
    2, 6, 80.00, NULL, 10.00, 80.00,
    '2025-08-25 08:00:00', '2025-08-30 19:00:00', 'HYBRID', 'PENDING', NULL, 0
);

-- Auction 4: NYC East Village Room (Property ID: 16580) - COMPLETED
INSERT INTO auctions (
    id, property_id, start_date, end_date, min_nights, max_nights,
    starting_price, current_highest_bid, bid_increment, minimum_bid,
    auction_start_time, auction_end_time, objective, status, winner_user_id, total_bids
) VALUES (
    '44444444-4444-4444-4444-444444444444', 16580, '2025-08-01', '2025-08-05',
    1, 4, 60.00, 90.00, 5.00, 60.00,
    '2025-07-25 10:00:00', '2025-07-31 22:00:00', 'HIGHEST_TOTAL', 'COMPLETED', 500001, 7
);

-- Auction 5: St Michel Elegance (Property ID: 16626) - COMPLETED
INSERT INTO auctions (
    id, property_id, start_date, end_date, min_nights, max_nights,
    starting_price, current_highest_bid, bid_increment, minimum_bid,
    auction_start_time, auction_end_time, objective, status, winner_user_id, total_bids
) VALUES (
    '55555555-5555-5555-5555-555555555555', 16626, '2025-07-20', '2025-07-25',
    2, 5, 100.00, 130.00, 10.00, 100.00,
    '2025-07-15 11:00:00', '2025-07-19 21:00:00', 'HIGHEST_TOTAL', 'COMPLETED', 500002, 8
);

-- Auction 6: Future auction for Paris Zen (different dates)
INSERT INTO auctions (
    id, property_id, start_date, end_date, min_nights, max_nights,
    starting_price, current_highest_bid, bid_increment, minimum_bid,
    auction_start_time, auction_end_time, objective, status, winner_user_id, total_bids
) VALUES (
    '66666666-6666-6666-6666-666666666666', 3109, '2025-09-10', '2025-09-15',
    1, 5, 55.00, NULL, 5.00, 55.00,
    '2025-09-05 12:00:00', '2025-09-09 18:00:00', 'HIGHEST_PER_NIGHT', 'PENDING', NULL, 0
);
INSERT INTO auctions (
    id, property_id, start_date, end_date, min_nights, max_nights,
    starting_price, current_highest_bid, bid_increment, minimum_bid,
    auction_start_time, auction_end_time, objective, status, winner_user_id, total_bids
) VALUES (
    '77777777-7777-7777-7777-777777777777', 11798, '2025-09-1', '2025-09-15',
    1, 5, 55.00, NULL, 5.00, 55.00,
    '2025-08-25 12:00:00', '2025-08-29 18:00:00', 'HIGHEST_PER_NIGHT', 'PENDING', NULL, 0
);
INSERT INTO auctions (
    id, property_id, start_date, end_date, min_nights, max_nights,
    starting_price, current_highest_bid, bid_increment, minimum_bid,
    auction_start_time, auction_end_time, objective, status, winner_user_id, total_bids
) VALUES (
    '88888888-8888-8888-8888-888888888888', 11798, '2025-08-25', '2025-08-31',
    1, 5, 55.00, NULL, 5.00, 55.00,
    '2025-08-18 07:00:00', '2025-08-24 18:00:00', 'HIGHEST_PER_NIGHT', 'ACTIVE', NULL, 0
);
INSERT INTO auctions (
    id, property_id, start_date, end_date, min_nights, max_nights,
    starting_price, current_highest_bid, bid_increment, minimum_bid,
    auction_start_time, auction_end_time, objective, status, winner_user_id, total_bids
) VALUES (
    '99999999-9999-9999-9999-999999999999', 11798, '2025-09-16', '2025-09-30',
    1, 5, 55.00, NULL, 5.00, 55.00,
    '2025-08-18 07:00:00', '2025-08-18 12:50:00', 'HIGHEST_PER_NIGHT', 'ACTIVE', NULL, 0
);

-- ===================================================================
-- BOOKINGS TABLE INSERTS
-- ===================================================================