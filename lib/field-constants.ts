// Format rules shared by the field definitions (lib/roles) and the hand-written
// forms.
export const BENEFIT_NOTE_MAX_LENGTH = 500
export const PHONE_PATTERN = /^[0-9+\-\s]{6,20}$/
// LINE IDs are 4-20 characters: letters, digits, '.', '-' and '_' (an official
// account's leading '@' is tolerated).
export const LINE_ID_PATTERN = /^@?[A-Za-z0-9._-]{4,20}$/
