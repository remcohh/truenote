import type { Exercise } from '../../../types';

export const SAMPLE_EXERCISES: Exercise[] = [
  {
    id: 'scale-c-major',
    title: 'C Major Scale Warmup',
    category: 'Scales',
    difficulty: 'Beginner',
    defaultBpm: 90,
    beatsPerMeasure: 4,
    description: 'Basic 1-octave C Major scale ascending and descending with quarter notes.',
    xmlData: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work><work-title>C Major Scale Warmup</work-title></work>
  <part-list>
    <score-part id="P1"><part-name>Piano</part-name></score-part>
  </part-list>
  <part id="P1">
    <!-- Measure 1 -->
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note>
        <pitch><step>C</step><octave>4</octave></pitch>
        <duration>1</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>D</step><octave>4</octave></pitch>
        <duration>1</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>E</step><octave>4</octave></pitch>
        <duration>1</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>F</step><octave>4</octave></pitch>
        <duration>1</duration>
        <type>quarter</type>
      </note>
    </measure>
    <!-- Measure 2 -->
    <measure number="2">
      <note>
        <pitch><step>G</step><octave>4</octave></pitch>
        <duration>1</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>A</step><octave>4</octave></pitch>
        <duration>1</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>B</step><octave>4</octave></pitch>
        <duration>1</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>C</step><octave>5</octave></pitch>
        <duration>1</duration>
        <type>quarter</type>
      </note>
    </measure>
    <!-- Measure 3 -->
    <measure number="3">
      <note>
        <pitch><step>B</step><octave>4</octave></pitch>
        <duration>1</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>A</step><octave>4</octave></pitch>
        <duration>1</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>G</step><octave>4</octave></pitch>
        <duration>1</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>F</step><octave>4</octave></pitch>
        <duration>1</duration>
        <type>quarter</type>
      </note>
    </measure>
    <!-- Measure 4 -->
    <measure number="4">
      <note>
        <pitch><step>E</step><octave>4</octave></pitch>
        <duration>1</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>D</step><octave>4</octave></pitch>
        <duration>1</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>C</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>half</type>
      </note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>`
  },
  {
    id: 'arpeggio-g-major',
    title: 'G Major Triad Arpeggio',
    category: 'Arpeggios',
    difficulty: 'Intermediate',
    defaultBpm: 105,
    beatsPerMeasure: 3,
    description: 'Triad broken arpeggio exercise in G Major key signature.',
    xmlData: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work><work-title>G Major Triad Arpeggio</work-title></work>
  <part-list><score-part id="P1"><part-name>Violin</part-name></score-part></part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>2</divisions>
        <key><fifths>1</fifths></key>
        <time><beats>3</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note>
        <pitch><step>G</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>B</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>D</step><octave>5</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
    </measure>
    <measure number="2">
      <note>
        <pitch><step>G</step><octave>5</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>D</step><octave>5</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>B</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
    </measure>
    <measure number="3">
      <note>
        <pitch><step>G</step><octave>4</octave></pitch>
        <duration>6</duration>
        <type>half</type>
        <dot/>
      </note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>`
  },
  {
    id: 'bach-minuet',
    title: 'Bach Minuet Theme Snippet',
    category: 'Classical',
    difficulty: 'Intermediate',
    defaultBpm: 110,
    beatsPerMeasure: 3,
    description: 'Famous opening melody of J.S. Bach Minuet in G Major.',
    xmlData: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work><work-title>Bach Minuet in G Major Theme</work-title></work>
  <part-list><score-part id="P1"><part-name>Flute</part-name></score-part></part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>2</divisions>
        <key><fifths>1</fifths></key>
        <time><beats>3</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note>
        <pitch><step>D</step><octave>5</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>G</step><octave>4</octave></pitch>
        <duration>1</duration>
        <type>eighth</type>
      </note>
      <note>
        <pitch><step>A</step><octave>4</octave></pitch>
        <duration>1</duration>
        <type>eighth</type>
      </note>
      <note>
        <pitch><step>B</step><octave>4</octave></pitch>
        <duration>1</duration>
        <type>eighth</type>
      </note>
      <note>
        <pitch><step>C</step><octave>5</octave></pitch>
        <duration>1</duration>
        <type>eighth</type>
      </note>
    </measure>
    <measure number="2">
      <note>
        <pitch><step>D</step><octave>5</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>G</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>G</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
    </measure>
    <measure number="3">
      <note>
        <pitch><step>E</step><octave>5</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>C</step><octave>5</octave></pitch>
        <duration>1</duration>
        <type>eighth</type>
      </note>
      <note>
        <pitch><step>D</step><octave>5</octave></pitch>
        <duration>1</duration>
        <type>eighth</type>
      </note>
      <note>
        <pitch><step>E</step><octave>5</octave></pitch>
        <duration>1</duration>
        <type>eighth</type>
      </note>
      <note>
        <pitch><step>F</step><alter>1</alter><octave>5</octave></pitch>
        <duration>1</duration>
        <type>eighth</type>
      </note>
    </measure>
    <measure number="4">
      <note>
        <pitch><step>G</step><octave>5</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>G</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>G</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>quarter</type>
      </note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>`
  },
  {
    id: 'rhythm-syncopation',
    title: 'Syncopated Rhythm Drill',
    category: 'Rhythm',
    difficulty: 'Advanced',
    defaultBpm: 100,
    beatsPerMeasure: 4,
    description: 'Syncopated rhythm drill introducing off-beat accent patterns.',
    xmlData: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work><work-title>Syncopated Rhythm Drill</work-title></work>
  <part-list><score-part id="P1"><part-name>Percussion</part-name></score-part></part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note>
        <rest/>
        <duration>2</duration>
        <type>eighth</type>
      </note>
      <note>
        <pitch><step>A</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>eighth</type>
      </note>
      <note>
        <pitch><step>C</step><octave>5</octave></pitch>
        <duration>4</duration>
        <type>quarter</type>
      </note>
      <note>
        <pitch><step>A</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>eighth</type>
      </note>
      <note>
        <pitch><step>G</step><octave>4</octave></pitch>
        <duration>2</duration>
        <type>eighth</type>
      </note>
      <note>
        <pitch><step>E</step><octave>4</octave></pitch>
        <duration>4</duration>
        <type>quarter</type>
      </note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>`
  },
  {
    id: 'test-whole-note-d',
    title: 'Whole Note D Test',
    category: 'Custom',
    difficulty: 'Beginner',
    defaultBpm: 60,
    beatsPerMeasure: 4,
    description: 'Single sustained whole note D4 in treble clef — for testing pitch detection against a known, steady pitch.',
    xmlData: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work><work-title>Whole Note D Test</work-title></work>
  <part-list>
    <score-part id="P1"><part-name>Test</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note>
        <pitch><step>D</step><octave>4</octave></pitch>
        <duration>4</duration>
        <type>whole</type>
      </note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>`
  }
];
