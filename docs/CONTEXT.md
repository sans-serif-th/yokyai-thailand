# Teacher Position Swap (ย้ายสับเปลี่ยนตำแหน่งครู)

A matching system for Thai government teachers (ข้าราชการครู) who want to mutually swap teaching positions. Teachers describe their current location and desired destination province, the system finds reciprocal swaps, and teachers can contact one another to coordinate the offline approval process (ก.ค.ศ./school/district sign-off).

## Language

**Teacher (ครู)**:
An ข้าราชการครู (civil-service teacher) using the system to request a position swap.
_Avoid_: Officer, government officer, user

**Origin (ต้นทาง)**:
The teacher's current province/location where they are employed.
_Avoid_: Current position, source

**Destination (ปลายทาง)**:
One or more provinces the teacher wants to move to (e.g., "Ayutthaya or Ang Thong"). Matching requires reciprocal destinations: Teacher A's origin must be in Teacher B's destination list, and vice versa.
_Avoid_: Target, desired position

**Province**:
The primary geographic unit for matching. Each teacher specifies a single Origin province and one or more Destination provinces. Districts (อำเภอ) within a province are optional/informational and do not affect matching.
_Avoid_: Region, zone (too broad)

**District (อำเภอ/เขตพื้นที่)**:
Optional detail within a province. Teachers may specify a preferred district to help narrow results, but district matching is not required for a valid match.

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

Matching requires both teachers to belong to the same teaching group. Within a group, teachers may have different exact subjects (เอก), but search can be filtered by exact subject afterward.
_Avoid_: Subject group, discipline

**Subject/Major (เอก)**:
A specific subject within a teaching group (e.g., Mathematics = group, "Algebra specialization" = exact subject). Matching happens at the teaching-group level; filtering by exact subject is optional.
_Avoid_: Branch, discipline

**Match / Mutual Match**:
Two teachers qualify as a match if:
1. Both belong to the same Teaching Group
2. Teacher A's Origin province is in Teacher B's Destination list
3. Teacher B's Origin province is in Teacher A's Destination list

A match is ranked by quality: (1) Perfect = both exact subjects match AND both districts match; (2) High = exact subjects match; (3) Partial = teaching-group match only.
_Avoid_: Pairing, swap agreement

**Mutual Transfer (ย้ายสับเปลี่ยน)**:
The specific transfer type this system facilitates: two teachers each want to swap positions and jointly submit to ก.ค.ศ./school/district for approval. This system only handles matching; approval is offline.
_Avoid_: Transfer, relocation (too generic)
