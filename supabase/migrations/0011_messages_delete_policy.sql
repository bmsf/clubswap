-- La en deltaker slette meldinger i en samtale (for «Slett samtale»).
-- Merk: meldinger er delte rader → sletter for begge parter.
drop policy if exists "Participants can delete their messages" on messages;
create policy "Participants can delete their messages"
  on messages for delete
  using (auth.uid() = sender_id or auth.uid() = recipient_id);
