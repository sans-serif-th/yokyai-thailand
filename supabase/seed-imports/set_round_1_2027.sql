-- Flag all teachers missing a transfer round to round 1/2027
UPDATE teachers
SET transfer_round = '1', transfer_year = 2027
WHERE transfer_round IS NULL AND transfer_year IS NULL;
