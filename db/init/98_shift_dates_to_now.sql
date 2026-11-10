-- Keep the demo "current": the seed data was written around 2025-08-12 (3 auctions ACTIVE,
-- some PENDING, history COMPLETED). Shift every seeded date/timestamp by (today - 2025-08-12)
-- so that, after each (nightly) init, ACTIVE auctions are open for a few more days, PENDING
-- ones are upcoming and bookings/payments form the host-dashboard history up to now.
--
-- * Only values before 2026-06-01 move (seed-authored data); timestamps generated during
--   init (DEFAULT CURRENT_TIMESTAMP) are left alone.
-- * One UPDATE per table moves all its date columns together, so row CHECKs such as
--   check_out >= check_in hold.
-- * Two passes (+36500 days, then back) so a shifted value never collides with a
--   not-yet-shifted one under UNIQUE constraints.
-- * session_replication_role=replica: triggers (bid_events, calendar sync) and FK triggers
--   do not fire while dates move; the data is consistent before and after.
DO $$
DECLARE
	ref_day   constant date := date '2025-08-12';
	cutoff    constant timestamp := timestamp '2026-06-01';
	far       constant int := 36500;
	delta     int := current_date - ref_day;
	r         record;
	set_far   text;
	set_back  text;
BEGIN
	IF delta <= 0 THEN
		RAISE NOTICE 'shift_dates: nothing to do (delta=%)', delta;
		RETURN;
	END IF;
	SET LOCAL session_replication_role = replica;

	FOR r IN
		SELECT c.table_name, array_agg(c.column_name::text ORDER BY c.column_name) AS cols
		FROM information_schema.columns c
		JOIN information_schema.tables t ON t.table_schema = c.table_schema AND t.table_name = c.table_name
		WHERE c.table_schema = 'public' AND t.table_type = 'BASE TABLE'
		  AND c.data_type IN ('date', 'timestamp without time zone', 'timestamp with time zone')
		  AND c.is_generated = 'NEVER'
		GROUP BY c.table_name
	LOOP
		SELECT string_agg(format('%1$I = CASE WHEN %1$I < %2$L THEN %1$I + make_interval(days => %3$s) ELSE %1$I END', col, cutoff, far), ', ')
		  INTO set_far FROM unnest(r.cols) AS col;
		SELECT string_agg(format('%1$I = CASE WHEN %1$I >= %2$L THEN %1$I - make_interval(days => %3$s) ELSE %1$I END', col, timestamp '2100-01-01', far - delta), ', ')
		  INTO set_back FROM unnest(r.cols) AS col;
		EXECUTE format('UPDATE public.%I SET %s', r.table_name, set_far);
		EXECUTE format('UPDATE public.%I SET %s', r.table_name, set_back);
	END LOOP;
	RAISE NOTICE 'shift_dates: moved seed dates by % days (2025-08-12 -> %)', delta, current_date;
END $$;
