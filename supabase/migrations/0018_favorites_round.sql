-- Ties each favorite to the round it was created in, so future logic can
-- distinguish "still relevant this round" from "left over from a past
-- round" once a teacher's data/favorites need to be reconsidered across
-- rounds (see lib/favorites.ts's addFavorite). Nullable since older rows
-- predate this column; backfilled to the only round that has ever
-- existed, since every current favorite was necessarily created during it.
alter table favorites add column round_id uuid references rounds(id);

update favorites set round_id = (select id from rounds where is_active = true)
where round_id is null;
