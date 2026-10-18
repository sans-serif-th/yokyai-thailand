# Adding a role (ประเภทผู้ใช้)

A *role* is a type of user (ครู, พยาบาล, เภสัชกร, …). Today only `teacher` has
code behind it. `/admin/roles` manages a role's **metadata** — Thai/English
name, status, order, user count. A role's **behaviour** (what registration
collects, who matches whom) is code, so a new role needs a developer:

1. **Row** — add it at `/admin/roles` (or in the `categories` table). It starts
   as `coming_soon`, which lists it as "เร็วๆนี้" on the welcome screen.
2. **Implementation** — create `lib/roles/<code>.ts` exporting a
   `RoleImplementation` (`lib/roles/types.ts`): `validateProfile`,
   `profileToRow`, `findMatches(requester)` and `isMutualPair(a, b)`. Model it
   on `lib/roles/teacher.ts` (+ `teacher-matching.ts`) and register it in
   `ROLE_IMPLEMENTATIONS` in `lib/roles/index.ts`.
   - Candidate queries must filter `.eq('category', requester.category)`.
   - Stats and the admin coverage views pick the role's `isMutualPair` up
     automatically (`lib/roles/pairs.ts`).
3. **Registration form** — `components/profile-form.tsx` is the teacher form.
   The welcome screen already lets the user pick among *active* roles and sends
   `category` with the first registration, but the numbered steps after it are
   still teacher-only: a second role needs its own form (or the form needs to
   branch on the chosen role), plus a payload type for it.
4. **Activate** — set the status to `active` at `/admin/roles`. The API refuses
   this while step 2 is missing.

Notes
- `category` is written only when a profile is first created
  (`PUT /api/teachers`); editing a profile never changes it.
- Invite claims (`/join/<code>`) update an existing imported row, which already
  has its category (the Facebook import is teacher-only).
- Moving a user to another role from the admin edit modal is limited to roles
  with an implementation.
- Matching is scoped per role; roles never match each other. Rounds
  (`rounds`, `round_subscriptions`) are still global, not per role.
