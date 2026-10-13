-- The teacher's own searchable LINE ID (the @handle shown in LINE settings),
-- entered by the user. Shared only with a teacher whose contact request they
-- accepted (see contact_requests, 0023). Not the internal line_user_id.
alter table teachers add column if not exists line_id text;
