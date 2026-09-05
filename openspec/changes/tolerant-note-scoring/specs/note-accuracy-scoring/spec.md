## ADDED Requirements

### Requirement: Per-Note Majority Vote
The system SHALL evaluate note accuracy per note instance rather than per sample: a note instance counts as correct when at least `majorityThreshold` (default 70%) of its eligible samples were pitch-class-correct, and counts as incorrect otherwise.

#### Scenario: Note passes despite a brief wrong-detection burst
- **WHEN** a note instance has 10 samples and 8 are pitch-class-correct while 2 are misdetected as a different pitch
- **THEN** the note instance is counted as correct toward note accuracy

#### Scenario: Note fails when most of it was genuinely wrong
- **WHEN** a note instance has 10 samples and only 5 are pitch-class-correct
- **THEN** the note instance is counted as incorrect toward note accuracy (below the default 70% threshold)

#### Scenario: Repeated same-pitch notes are voted independently
- **WHEN** the piece contains two consecutive note instances at the same pitch, and only the first is played correctly
- **THEN** the first note instance counts as correct and the second counts as incorrect, independently of each other

### Requirement: Note-Boundary Samples Excluded From the Vote
The system SHALL exclude samples falling within `voteBoundaryMarginFraction` of a note instance's start or end from that note's majority vote, so a note started slightly early/late or released slightly early is not judged on its transitional samples. If excluding boundary samples would leave zero eligible samples for a note instance, the system SHALL fall back to voting over all of that instance's samples.

#### Scenario: Early release doesn't fail an otherwise-correct note
- **WHEN** a note instance is played correctly except for silence in the final samples that fall within the trailing boundary margin
- **THEN** those trailing samples are excluded from the vote and the note instance is counted as correct

#### Scenario: A very short note still gets a vote
- **WHEN** a note instance is so short that its boundary margins would exclude every one of its samples
- **THEN** the system votes over all of that instance's samples instead of excluding them

### Requirement: Intonation Accuracy Independent of the Majority Vote
The system SHALL compute intonation accuracy from each sample's own raw pitch-class-correctness and cents-offset, unaffected by the per-note majority vote outcome. A sample that individually mismatched the target pitch SHALL NOT be counted toward intonation accuracy merely because its note instance passed the majority vote overall.

#### Scenario: A misdetected sample inside a passing note doesn't skew intonation accuracy
- **WHEN** a note instance passes its majority vote but contains one sample that was individually pitch-class-incorrect
- **THEN** that sample's cents-offset is not included in the intonation accuracy calculation

### Requirement: Configurable Scoring Thresholds
The system SHALL expose `majorityThreshold` and `voteBoundaryMarginFraction` as live-tunable values through the existing scoring tuning panel, following the same pattern as the existing release-window, stale-pitch, and intonation-tolerance controls.

#### Scenario: Adjusting the majority threshold changes future evaluations
- **WHEN** a user changes the majority threshold in the scoring tuning panel during a practice session
- **THEN** subsequent note-accuracy evaluations use the updated threshold
