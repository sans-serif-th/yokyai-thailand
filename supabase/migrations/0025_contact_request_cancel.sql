-- Requesters can cancel a pending contact request and send it again, at most
-- MAX_CONTACT_SENDS (3) times per person. `send_count` counts how many times
-- the requester has sent it; a cancelled request is hidden from the target.
-- Run once in the Supabase SQL editor after 0023.
alter table contact_requests drop constraint if exists contact_requests_status_check;
alter table contact_requests
  add constraint contact_requests_status_check
  check (status in ('pending', 'accepted', 'declined', 'cancelled'));

alter table contact_requests add column if not exists send_count int not null default 1;
