-- Seed bids (3 per auction from the demo guests 500001-500005) and a PAID payment
-- for the top bid of each finished auction, so auction / payment screens are not empty.
-- The bid trigger from 02_ writes bid_events automatically.
INSERT INTO bids (auction_id, user_id, check_in, check_out, total_amount, status, bid_time)
SELECT a.id,
       500001 + ((row_number() OVER (ORDER BY a.id) + k) % 5),
       a.start_date,
       a.start_date + GREATEST(COALESCE(a.min_nights, 1), 1),
       (COALESCE(a.starting_price, 50) + k * COALESCE(NULLIF(a.bid_increment, 0), 5))
           * GREATEST(COALESCE(a.min_nights, 1), 1),
       'ACTIVE',
       COALESCE(a.auction_start_time, now()) + k * interval '1 hour'
FROM auctions a
CROSS JOIN generate_series(1, 3) AS k
WHERE a.end_date > a.start_date;

UPDATE auctions a
SET total_bids = s.n,
    current_highest_bid = s.top_per_night
FROM (SELECT auction_id, count(*) n, max(price_per_night) top_per_night FROM bids GROUP BY auction_id) s
WHERE s.auction_id = a.id;

INSERT INTO payment_sessions (user_id, auction_id, bid_id, app_trans_id, amount, selected_nights, status, order_url)
SELECT DISTINCT ON (b.auction_id)
       b.user_id, b.auction_id, b.id,
       'DEMO_' || replace(b.id::text, '-', ''),
       b.total_amount,
       jsonb_build_array(b.check_in::text),
       'PAID',
       NULL
FROM bids b JOIN auctions a ON a.id = b.auction_id
WHERE a.auction_end_time < now()
ORDER BY b.auction_id, b.total_amount DESC
LIMIT 10;
