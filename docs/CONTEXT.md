# Teacher Position Swap (ย้ายสับเปลี่ยนตำแหน่งครู)

A matching system for Thai government teachers (ข้าราชการครู) who want to mutually swap teaching positions. Teachers describe their current location and desired destination province, the system finds reciprocal swaps, and teachers can contact one another to coordinate the offline approval process (ก.ค.ศ./school/district sign-off).

## Language

**Teacher (ครู)**:
The app's term for anyone using the system to request a position swap — kept as the name for continuity, but it no longer means only ข้าราชการครู. See Position below: a "Teacher" record can hold a non-teaching Position (e.g. นักจัดการงานทั่วไป), which is a distinct civil-service classification, not ข้าราชการครู. Where precision matters (e.g. explaining eligibility rules), say "applicant" or name the Position instead of assuming ครู.
_Avoid_: Officer, government officer, user (as UI copy — "Teacher" is still fine for internal/code naming)

**Position (ตำแหน่ง)**:
The applicant's job classification. MVP supports 2: ครูผู้สอน (teaching staff) and นักจัดการงานทั่วไป (general administrative staff) — both are school-based civil-service roles eligible for mutual transfer, but they are different classifications with different quotas/approval paths. Only ครูผู้สอน has a Teaching Group and Subject; นักจัดการงานทั่วไป has neither. Matching requires both sides to hold the same Position.
_Avoid_: Role, job title, rank

**Origin (ต้นทาง)**:
The teacher's current province/location where they are employed.
_Avoid_: Current position, source

**Destination (ปลายทาง)**:
One or more provinces the teacher wants to move to (e.g., "Ayutthaya or Ang Thong"). Matching requires reciprocal destinations: Teacher A's origin must be in Teacher B's destination list, and vice versa.
_Avoid_: Target, desired position

**Service Type (หน่วยงานต้นสังกัด)**:
The administrative system a teacher's position belongs to: สพป. (Primary Education Service Area), สพม. (Secondary Education Service Area), or สอศ. (Vocational Education Commission). Matching requires both teachers to belong to the same Service Type — a สพป. position and a สพม. position are governed by different administrative systems and cannot be mutually transferred, even if the teaching group matches.
_Avoid_: Department, agency, sector

**Province**:
The primary geographic unit for matching. Each teacher specifies a single Origin province and one or more Destination provinces. District and Zone within a province are optional/informational and do not affect matching.
_Avoid_: Region

**District (อำเภอ)**:
Optional detail within a province — Thailand's standard administrative subdivision. Teachers may specify a preferred district to help narrow results, but district matching is not required for a valid match.
_Avoid_: Zone (this is a different concept — see Zone below)

**Zone (เขตพื้นที่การศึกษา)**:
Optional detail identifying which numbered education service area (e.g. "เขต 1") a position falls under, within a Service Type + Province. Distinct from District: a province typically has multiple zones (numbered, not named), and zone numbering is not standardized nationally — so it is stored as free text, informational only, and never used for matching.
_Avoid_: District, sector

**Teaching Group (กลุ่มสาระการเรียนรู้)**:
One of 8 official learning-area categories defined by the 2008 Basic Education Core Curriculum:
1. Thai Language (ภาษาไทย)
2. Mathematics (คณิตศาสตร์)
3. Science (วิทยาศาสตร์)
4. Social Studies, Religion and Culture (สังคมศึกษา ศาสนา และวัฒนธรรม)
5. Health and Physical Education (สุขศึกษาและพลศึกษา)
6. Art (ศิลปะ)
7. Occupations and Technology (การงานและเทคโนโลยี)
8. Foreign Languages (ภาษาต่างประเทศ)

Matching requires both teachers to belong to the same teaching group — but only applies when Position is ครูผู้สอน. Within a group, teachers may have different exact subjects (เอก), but search can be filtered by exact subject afterward.
_Avoid_: Subject group, discipline

**Subject/Major (เอก)**:
A specific subject within a teaching group (e.g., Mathematics = group, "Algebra specialization" = exact subject). Matching happens at the teaching-group level; filtering by exact subject is optional. Only applies when Position is ครูผู้สอน.
_Avoid_: Branch, discipline

**Benefit Note (ข้อมูลสวัสดิการ)**:
Optional free-text field (max 500 characters) where an applicant can mention perks tied to the origin position (e.g. "มีบ้านพักครู" — teacher housing available). Informational only, shown to matches, never used for matching.
_Avoid_: Description, notes (too generic — this is specifically about position perks)

**Transfer Round (รอบที่ต้องการย้าย)**:
Optional field naming the year (e.g. 2027) of the annual transfer cycle the applicant wants to move in. Informational only, shown to matches, never used for matching. Replaces an earlier "service start date" field that tried to compute tenure — the applicant's actual eligibility (e.g. a minimum-tenure rule) is verified offline by their school/district, not by this system.
_Avoid_: Start date, tenure, service date

**Match / Mutual Match**:
Two teachers qualify as a match if:
1. Both hold the same Position
2. Both belong to the same Service Type
3. If Position is ครูผู้สอน, both belong to the same Teaching Group
4. Teacher A's Origin province is in Teacher B's Destination list
5. Teacher B's Origin province is in Teacher A's Destination list

A match is ranked by quality: (1) Perfect = both exact subjects match AND both districts match; (2) High = exact subjects match; (3) Partial = base match only (no subject comparison — the only tier reachable when Position is นักจัดการงานทั่วไป, since that position has no Subject).
_Avoid_: Pairing, swap agreement

**Mutual Transfer (ย้ายสับเปลี่ยน)**:
The specific transfer type this system facilitates: two teachers each want to swap positions and jointly submit to ก.ค.ศ./school/district for approval. This system only handles matching; approval is offline.
_Avoid_: Transfer, relocation (too generic)
