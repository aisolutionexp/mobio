-- Sprint 8 — Realtime publication for messaging + attachments

-- messages: check if already in publication before adding
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages'
  ) THEN
    ALTER TABLE public.messages REPLICA IDENTITY FULL;
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;

-- message_attachments: new table, add to publication
ALTER TABLE public.message_attachments REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_attachments;

-- showroom_bookings: realtime for booking status updates
ALTER TABLE public.showroom_bookings REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.showroom_bookings;
