# Adding a role (ประเภทผู้ใช้)

A *role* is a type of user (ครู, พยาบาล, เภสัชกร, …). Today only `teacher` has
code behind it. `/admin/roles` manages a role's **metadata** — Thai/English
name, status, order, user count. A role's **behaviour** (what registration
collects, who matches whom) is code, so a new role needs a developer:

1. **Row** — add it at `/admin/roles` (or in the `categories` table). It starts
   as `coming_soon`, which lists it as "เร็วๆนี้" on the welcome screen.
2. **Fields** — list the registration fields as a `FieldDef[]` (`lib/roles/fields.ts`),
   in a pure file like `lib/roles/teacher-fields.ts` / `demo-fields.ts`. Each field
   says its type, validation, whether other users may see it (`public`), whether
   admins can edit it, and whether it goes on the match card (`card`). Fields with
   `table: '<role>_profiles'` live in the role's extension table; the rest on
   `teachers`. Add the list to `lib/roles/field-registry.ts`.
3. **Table** — a migration creating `<role>_profiles (teacher_id uuid primary key
   references teachers(id) on delete cascade, ...)` with RLS enabled (model:
   `0031_role_profile_tables.sql`). Mirror it in `supabase/schema.sql`.
4. **Implementation** — create `lib/roles/<code>.ts` exporting a
   `RoleImplementation` (`lib/roles/types.ts`): `fields`, `extensionTable`,
   `validateProfile`, `profileToRow`, `findMatches(requester)` and
   `isMutualPair(a, b)`. Model it on `lib/roles/demo.ts` (small) or
   `teacher.ts` + `teacher-matching.ts`, and register it in `ROLE_IMPLEMENTATIONS`
   in `lib/roles/index.ts`.
   - Candidate queries must filter `.eq('category', requester.category)`, and
     must pass candidates through `sanitizeForMatch` (allow-list from `public`).
   - The extension row is saved/loaded by `lib/roles/extension.ts` from
     `PUT/GET /api/teachers`; the payload carries it as `profile: { <key>: value }`.
   - Stats and the admin coverage views pick the role's `isMutualPair` up
     automatically (`lib/roles/pairs.ts`).
5. **Forms** — roles other than teacher use `components/dynamic-profile-form.tsx`
   for registration and for editing (rendered from `fields`); no new form is
   needed. The match card shows the `card` fields. Only the teacher keeps its
   hand-written wizard.
6. **Row + activate** — add the role at `/admin/roles` (or in `categories`); it
   starts `coming_soon`. Set it `active` there once step 4 exists (the API
   refuses otherwise), then create its first round (below).

The example role `demo` follows exactly these steps. It is registered only when
`NEXT_PUBLIC_DEV_TOOLS=1`; its `categories` row comes from
`supabase/seed-dev/demo-role.sql` (run by hand, dev only), so production never
shows it.

Notes
- `category` is written only when a profile is first created
  (`PUT /api/teachers`); editing a profile never changes it.
- Invite claims (`/join/<code>`) update an existing imported row, which already
  has its category (the Facebook import is teacher-only).
- Moving a user to another role from the admin edit modal is limited to roles
  with an implementation.
- Matching is scoped per role; roles never match each other. Rounds
  are per role too: each role has its own `rounds` (`category`), one active at
  a time, with its own matching open/close dates. Create the new role's first
  round at `/admin?role=<code>` → Round tab, otherwise its matching stays closed.
