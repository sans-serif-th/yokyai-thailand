-- Favorites belong to a round: the same teacher can be favorited again in a
-- later round without touching the earlier round's list. The key was
-- (teacher_id, favorited_teacher_id); it becomes that plus round_id.
-- Idempotent: safe to run twice. See lib/favorites.ts.

-- Rows still without a round (saved while no round was active) go to the
-- active round of the saving teacher's role.
update favorites f
set round_id = r.id
from teachers t, rounds r
where f.round_id is null
  and t.id = f.teacher_id
  and r.is_active = true
  and r.category = t.category;

alter table favorites
  drop constraint if exists favorites_teacher_id_favorited_teacher_id_key;

create unique index if not exists favorites_teacher_favorited_round_key
  on favorites (teacher_id, favorited_teacher_id, round_id);
