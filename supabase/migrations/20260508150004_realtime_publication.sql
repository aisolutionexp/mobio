-- Sprint 7 — Realtime Publication for cross-pontas tables

-- Set REPLICA IDENTITY FULL to capture OLD values on UPDATEs
ALTER TABLE orders REPLICA IDENTITY FULL;
ALTER TABLE order_status_history REPLICA IDENTITY FULL;
ALTER TABLE quote_messages REPLICA IDENTITY FULL;
ALTER TABLE payment_records REPLICA IDENTITY FULL;

-- Add tables to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE order_status_history;
ALTER PUBLICATION supabase_realtime ADD TABLE quote_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE payment_records;
