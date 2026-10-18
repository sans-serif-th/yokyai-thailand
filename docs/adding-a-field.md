# Adding or changing a registration field

Registration fields are defined once, per role, as a `FieldDef` (`lib/roles/fields.ts`).

**Teacher** — `lib/roles/teacher-fields.ts`; **example role** — `lib/roles/demo-fields.ts`.

1. **Migration** — add the column (to `teachers`, or to the role's `<role>_profiles`
   extension table). Mirror it in `supabase/schema.sql`, end with
   `notify pgrst, 'reload schema';`, and run it in Supabase **before** merging.
2. **Definition** — add a `FieldDef` to the role's list. Set:
   - `type`/`required`/`options`/`pattern`/`min`/`max` — validation (API and admin);
   - `public: true` only if other users may see it on a match card (default: private);
   - `adminEditable`, `card` (+ `suffix`/`optionLabels` for display);
   - `table` for an extension-table column (omit for `teachers`).
3. **Types** — add the property to `Teacher` and `ProfilePayload` (`lib/types.ts`) for
   teacher fields; extension fields travel in `profile` and need no type change.
4. **Forms** — non-teacher roles pick the field up automatically. The teacher forms are
   hand-written: add the input to `components/profile-form.tsx`, `criteria-form.tsx`
   and include it in what they send (the profile-edit screen only edits contact
   details, so it cannot wipe new fields).
5. **Matching** — if the field affects who matches whom, change the role's matcher
   **and** its `isMutualPair` together (teacher: `teacher-matching.ts` and
   `isTeacherMutualPair`).

Privacy: a field not marked `public` never reaches another user (`lib/match-sanitize.ts`
is an allow-list).
