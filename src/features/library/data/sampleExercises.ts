import type { Exercise } from '../../../types';

export const SAMPLE_EXERCISES: Exercise[] = [
  {
    id: 'scale-c-major',
    title: 'C Major Scale Warmup',
    category: 'Scales',
    difficulty: 'Beginner',
    defaultBpm: 90,
    beatsPerMeasure: 4,
    description: 'Basic 1-octave C Major scale ascending and descending with quarter notes and piano accompaniment.',
    xmlData: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work><work-title>C Major Scale Warmup</work-title></work>
  <part-list>
    <score-part id="P1"><part-name>Solo</part-name></score-part>
    <score-part id="P2"><part-name>Piano</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note><pitch><step>C</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>E</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
    </measure>
    <measure number="2">
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>B</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>C</step><octave>5</octave></pitch><duration>1</duration><type>quarter</type></note>
    </measure>
    <measure number="3">
      <note><pitch><step>B</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
    </measure>
    <measure number="4">
      <note><pitch><step>E</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>C</step><octave>4</octave></pitch><duration>2</duration><type>half</type></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
  <part id="P2">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>F</sign><line>4</line></clef>
      </attributes>
      <note><pitch><step>C</step><octave>3</octave></pitch><duration>2</duration><type>half</type></note>
      <note><chord/><pitch><step>E</step><octave>3</octave></pitch><duration>2</duration><type>half</type></note>
      <note><chord/><pitch><step>G</step><octave>3</octave></pitch><duration>2</duration><type>half</type></note>
      <note><pitch><step>F</step><octave>2</octave></pitch><duration>2</duration><type>half</type></note>
      <note><chord/><pitch><step>C</step><octave>3</octave></pitch><duration>2</duration><type>half</type></note>
      <note><chord/><pitch><step>F</step><octave>3</octave></pitch><duration>2</duration><type>half</type></note>
    </measure>
    <measure number="2">
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>2</duration><type>half</type></note>
      <note><chord/><pitch><step>D</step><octave>3</octave></pitch><duration>2</duration><type>half</type></note>
      <note><chord/><pitch><step>G</step><octave>3</octave></pitch><duration>2</duration><type>half</type></note>
      <note><pitch><step>C</step><octave>3</octave></pitch><duration>2</duration><type>half</type></note>
      <note><chord/><pitch><step>E</step><octave>3</octave></pitch><duration>2</duration><type>half</type></note>
      <note><chord/><pitch><step>G</step><octave>3</octave></pitch><duration>2</duration><type>half</type></note>
    </measure>
    <measure number="3">
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>D</step><octave>3</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>F</step><octave>3</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>B</step><octave>3</octave></pitch><duration>4</duration><type>whole</type></note>
    </measure>
    <measure number="4">
      <note><pitch><step>C</step><octave>2</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>G</step><octave>2</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>C</step><octave>3</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>E</step><octave>3</octave></pitch><duration>4</duration><type>whole</type></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>`
  },
  {
    id: 'scale-c-major-whole-notes',
    title: 'C Major Scale (Whole Notes)',
    category: 'Scales',
    difficulty: 'Beginner',
    defaultBpm: 75,
    beatsPerMeasure: 4,
    description: '1-octave C Major scale ascending and descending with sustained whole notes and rich piano chord harmony.',
    xmlData: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work><work-title>C Major Scale (Whole Notes)</work-title></work>
  <part-list>
    <score-part id="P1"><part-name>Solo</part-name></score-part>
    <score-part id="P2"><part-name>Piano</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note><pitch><step>C</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
    </measure>
    <measure number="2"><note><pitch><step>D</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note></measure>
    <measure number="3"><note><pitch><step>E</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note></measure>
    <measure number="4"><note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note></measure>
    <measure number="5"><note><pitch><step>G</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note></measure>
    <measure number="6"><note><pitch><step>A</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note></measure>
    <measure number="7"><note><pitch><step>B</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note></measure>
    <measure number="8"><note><pitch><step>C</step><octave>5</octave></pitch><duration>4</duration><type>whole</type></note></measure>
    <measure number="9"><note><pitch><step>B</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note></measure>
    <measure number="10"><note><pitch><step>A</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note></measure>
    <measure number="11"><note><pitch><step>G</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note></measure>
    <measure number="12"><note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note></measure>
    <measure number="13"><note><pitch><step>E</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note></measure>
    <measure number="14"><note><pitch><step>D</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note></measure>
    <measure number="15">
      <note><pitch><step>C</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
  <part id="P2">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>F</sign><line>4</line></clef>
      </attributes>
      <note><pitch><step>C</step><octave>3</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>G</step><octave>3</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>E</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
    </measure>
    <measure number="2">
      <note><pitch><step>D</step><octave>3</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>A</step><octave>3</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
    </measure>
    <measure number="3">
      <note><pitch><step>E</step><octave>3</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>B</step><octave>3</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>G</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
    </measure>
    <measure number="4">
      <note><pitch><step>F</step><octave>2</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>C</step><octave>3</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>A</step><octave>3</octave></pitch><duration>4</duration><type>whole</type></note>
    </measure>
    <measure number="5">
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>D</step><octave>3</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>B</step><octave>3</octave></pitch><duration>4</duration><type>whole</type></note>
    </measure>
    <measure number="6">
      <note><pitch><step>A</step><octave>2</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>E</step><octave>3</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>C</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
    </measure>
    <measure number="7">
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>D</step><octave>3</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>F</step><octave>3</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>B</step><octave>3</octave></pitch><duration>4</duration><type>whole</type></note>
    </measure>
    <measure number="8">
      <note><pitch><step>C</step><octave>3</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>G</step><octave>3</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>E</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
    </measure>
    <measure number="9">
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>D</step><octave>3</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>F</step><octave>3</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>B</step><octave>3</octave></pitch><duration>4</duration><type>whole</type></note>
    </measure>
    <measure number="10">
      <note><pitch><step>A</step><octave>2</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>E</step><octave>3</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>C</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
    </measure>
    <measure number="11">
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>D</step><octave>3</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>B</step><octave>3</octave></pitch><duration>4</duration><type>whole</type></note>
    </measure>
    <measure number="12">
      <note><pitch><step>F</step><octave>2</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>C</step><octave>3</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>A</step><octave>3</octave></pitch><duration>4</duration><type>whole</type></note>
    </measure>
    <measure number="13">
      <note><pitch><step>E</step><octave>3</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>G</step><octave>3</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>C</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
    </measure>
    <measure number="14">
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>D</step><octave>3</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>F</step><octave>3</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>B</step><octave>3</octave></pitch><duration>4</duration><type>whole</type></note>
    </measure>
    <measure number="15">
      <note><pitch><step>C</step><octave>2</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>G</step><octave>2</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>C</step><octave>3</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>E</step><octave>3</octave></pitch><duration>4</duration><type>whole</type></note>
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
    description: 'Triad broken arpeggio exercise in G Major key signature with 3/4 waltz accompaniment.',
    xmlData: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work><work-title>G Major Triad Arpeggio</work-title></work>
  <part-list>
    <score-part id="P1"><part-name>Violin</part-name></score-part>
    <score-part id="P2"><part-name>Piano</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>2</divisions>
        <key><fifths>1</fifths></key>
        <time><beats>3</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>B</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>5</octave></pitch><duration>2</duration><type>quarter</type></note>
    </measure>
    <measure number="2">
      <note><pitch><step>G</step><octave>5</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>5</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>B</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
    </measure>
    <measure number="3">
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>6</duration><type>half</type><dot/></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
  <part id="P2">
    <measure number="1">
      <attributes>
        <divisions>2</divisions>
        <key><fifths>1</fifths></key>
        <time><beats>3</beats><beat-type>4</beat-type></time>
        <clef><sign>F</sign><line>4</line></clef>
      </attributes>
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>B</step><octave>3</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><chord/><pitch><step>D</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>B</step><octave>3</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><chord/><pitch><step>D</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
    </measure>
    <measure number="2">
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>B</step><octave>3</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><chord/><pitch><step>D</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>B</step><octave>3</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><chord/><pitch><step>D</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
    </measure>
    <measure number="3">
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>6</duration><type>half</type><dot/></note>
      <note><chord/><pitch><step>D</step><octave>3</octave></pitch><duration>6</duration><type>half</type><dot/></note>
      <note><chord/><pitch><step>B</step><octave>3</octave></pitch><duration>6</duration><type>half</type><dot/></note>
      <note><chord/><pitch><step>G</step><octave>4</octave></pitch><duration>6</duration><type>half</type><dot/></note>
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
    description: 'Famous opening melody of J.S. Bach Minuet in G Major with original Baroque basso continuo accompaniment.',
    xmlData: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work><work-title>Bach Minuet in G Major Theme</work-title></work>
  <part-list>
    <score-part id="P1"><part-name>Flute</part-name></score-part>
    <score-part id="P2"><part-name>Continuo</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>2</divisions>
        <key><fifths>1</fifths></key>
        <time><beats>3</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note><pitch><step>D</step><octave>5</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>B</step><octave>4</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>C</step><octave>5</octave></pitch><duration>1</duration><type>eighth</type></note>
    </measure>
    <measure number="2">
      <note><pitch><step>D</step><octave>5</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
    </measure>
    <measure number="3">
      <note><pitch><step>E</step><octave>5</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>C</step><octave>5</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>D</step><octave>5</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>E</step><octave>5</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>F</step><alter>1</alter><octave>5</octave></pitch><duration>1</duration><type>eighth</type></note>
    </measure>
    <measure number="4">
      <note><pitch><step>G</step><octave>5</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
  <part id="P2">
    <measure number="1">
      <attributes>
        <divisions>2</divisions>
        <key><fifths>1</fifths></key>
        <time><beats>3</beats><beat-type>4</beat-type></time>
        <clef><sign>F</sign><line>4</line></clef>
      </attributes>
      <note><pitch><step>G</step><octave>3</octave></pitch><duration>4</duration><type>half</type></note>
      <note><pitch><step>F</step><alter>1</alter><octave>3</octave></pitch><duration>2</duration><type>quarter</type></note>
    </measure>
    <measure number="2">
      <note><pitch><step>E</step><octave>3</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>3</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>C</step><octave>3</octave></pitch><duration>2</duration><type>quarter</type></note>
    </measure>
    <measure number="3">
      <note><pitch><step>C</step><octave>3</octave></pitch><duration>4</duration><type>half</type></note>
      <note><pitch><step>B</step><octave>2</octave></pitch><duration>2</duration><type>quarter</type></note>
    </measure>
    <measure number="4">
      <note><pitch><step>B</step><octave>2</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>A</step><octave>2</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>2</duration><type>quarter</type></note>
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
    description: 'Syncopated rhythm drill introducing off-beat accent patterns with steady harmonic piano comping.',
    xmlData: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work><work-title>Syncopated Rhythm Drill</work-title></work>
  <part-list>
    <score-part id="P1"><part-name>Percussion</part-name></score-part>
    <score-part id="P2"><part-name>Piano</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note><rest/><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>C</step><octave>5</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>2</duration><type>eighth</type></note>
      <note><pitch><step>E</step><octave>4</octave></pitch><duration>4</duration><type>quarter</type></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
  <part id="P2">
    <measure number="1">
      <attributes>
        <divisions>4</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>F</sign><line>4</line></clef>
      </attributes>
      <note><pitch><step>A</step><octave>2</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><chord/><pitch><step>E</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><chord/><pitch><step>A</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>C</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><chord/><pitch><step>E</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><chord/><pitch><step>G</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><chord/><pitch><step>D</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><chord/><pitch><step>G</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><pitch><step>C</step><octave>2</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><chord/><pitch><step>G</step><octave>2</octave></pitch><duration>4</duration><type>quarter</type></note>
      <note><chord/><pitch><step>C</step><octave>3</octave></pitch><duration>4</duration><type>quarter</type></note>
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
    description: 'Single sustained whole note D4 in treble clef with sustained D minor piano harmony.',
    xmlData: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work><work-title>Whole Note D Test</work-title></work>
  <part-list>
    <score-part id="P1"><part-name>Test</part-name></score-part>
    <score-part id="P2"><part-name>Piano</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
  <part id="P2">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>F</sign><line>4</line></clef>
      </attributes>
      <note><pitch><step>D</step><octave>3</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>A</step><octave>3</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>D</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>`
  },
  {
    id: 'hymn-amazing-grace',
    title: 'Amazing Grace (Traditional Hymn)',
    category: 'Classical',
    difficulty: 'Beginner',
    defaultBpm: 80,
    beatsPerMeasure: 3,
    description: 'Traditional public domain hymn "Amazing Grace" (New Britain melody in G Major) with choral piano harmonization.',
    xmlData: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work><work-title>Amazing Grace</work-title></work>
  <part-list>
    <score-part id="P1"><part-name>Melody</part-name></score-part>
    <score-part id="P2"><part-name>Piano</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>2</divisions>
        <key><fifths>1</fifths></key>
        <time><beats>3</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
    </measure>
    <measure number="2">
      <note><pitch><step>B</step><octave>4</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>B</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
    </measure>
    <measure number="3">
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
    </measure>
    <measure number="4">
      <note><pitch><step>E</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
    </measure>
    <measure number="5">
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
    </measure>
    <measure number="6">
      <note><pitch><step>B</step><octave>4</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>B</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
    </measure>
    <measure number="7">
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>5</octave></pitch><duration>6</duration><type>half</type><dot/></note>
    </measure>
    <measure number="8">
      <note><pitch><step>B</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>5</octave></pitch><duration>3</duration><type>quarter</type><dot/></note>
      <note><pitch><step>B</step><octave>4</octave></pitch><duration>1</duration><type>eighth</type></note>
    </measure>
    <measure number="9">
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
    </measure>
    <measure number="10">
      <note><pitch><step>E</step><octave>4</octave></pitch><duration>3</duration><type>quarter</type><dot/></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
    </measure>
    <measure number="11">
      <note><pitch><step>E</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
    </measure>
    <measure number="12">
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
    </measure>
    <measure number="13">
      <note><pitch><step>B</step><octave>4</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>B</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
    </measure>
    <measure number="14">
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>6</duration><type>half</type><dot/></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
  <part id="P2">
    <measure number="1">
      <attributes>
        <divisions>2</divisions>
        <key><fifths>1</fifths></key>
        <time><beats>3</beats><beat-type>4</beat-type></time>
        <clef><sign>F</sign><line>4</line></clef>
      </attributes>
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>3</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>B</step><octave>3</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>D</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
    </measure>
    <measure number="2">
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>3</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>B</step><octave>3</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>D</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
    </measure>
    <measure number="3">
      <note><pitch><step>C</step><octave>3</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>3</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>C</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>E</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
    </measure>
    <measure number="4">
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>3</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>B</step><octave>3</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>D</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
    </measure>
    <measure number="5">
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>3</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>B</step><octave>3</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>D</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
    </measure>
    <measure number="6">
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>3</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>B</step><octave>3</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>D</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
    </measure>
    <measure number="7">
      <note><pitch><step>D</step><octave>3</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>F</step><alter>1</alter><octave>3</octave></pitch><duration>6</duration><type>half</type><dot/></note>
      <note><chord/><pitch><step>A</step><octave>3</octave></pitch><duration>6</duration><type>half</type><dot/></note>
      <note><chord/><pitch><step>D</step><octave>4</octave></pitch><duration>6</duration><type>half</type><dot/></note>
    </measure>
    <measure number="8">
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>3</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>B</step><octave>3</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>D</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
    </measure>
    <measure number="9">
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>3</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>B</step><octave>3</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>D</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
    </measure>
    <measure number="10">
      <note><pitch><step>C</step><octave>3</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>3</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>C</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>E</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
    </measure>
    <measure number="11">
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>3</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>B</step><octave>3</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>D</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
    </measure>
    <measure number="12">
      <note><pitch><step>E</step><octave>3</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>3</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>B</step><octave>3</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>E</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
    </measure>
    <measure number="13">
      <note><pitch><step>D</step><octave>3</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>F</step><alter>1</alter><octave>3</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>A</step><octave>3</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>C</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
    </measure>
    <measure number="14">
      <note><pitch><step>D</step><octave>3</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>6</duration><type>half</type><dot/></note>
      <note><chord/><pitch><step>D</step><octave>3</octave></pitch><duration>6</duration><type>half</type><dot/></note>
      <note><chord/><pitch><step>B</step><octave>3</octave></pitch><duration>6</duration><type>half</type><dot/></note>
      <note><chord/><pitch><step>G</step><octave>4</octave></pitch><duration>6</duration><type>half</type><dot/></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>`
  },
  {
    id: 'hymn-doxology',
    title: 'Doxology (Praise God from Whom All Blessings Flow)',
    category: 'Classical',
    difficulty: 'Beginner',
    defaultBpm: 85,
    beatsPerMeasure: 4,
    description: 'Traditional public domain hymn "Doxology" (Old 100th tune in G Major) with 4-part choir organ/piano harmonization.',
    xmlData: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work><work-title>Doxology (Old 100th)</work-title></work>
  <part-list>
    <score-part id="P1"><part-name>Melody</part-name></score-part>
    <score-part id="P2"><part-name>Organ</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <key><fifths>1</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>F</step><alter>1</alter><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>E</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
    </measure>
    <measure number="2">
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>B</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
    </measure>
    <measure number="3">
      <note><pitch><step>B</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>B</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
    </measure>
    <measure number="4">
      <note><pitch><step>C</step><octave>5</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>B</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>2</duration><type>half</type></note>
    </measure>
    <measure number="5">
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>B</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
    </measure>
    <measure number="6">
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>E</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>F</step><alter>1</alter><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
    </measure>
    <measure number="7">
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>E</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
    </measure>
    <measure number="8">
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>A</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>2</duration><type>half</type></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
  <part id="P2">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <key><fifths>1</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>F</sign><line>4</line></clef>
      </attributes>
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>B</step><octave>2</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>3</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>E</step><octave>3</octave></pitch><duration>1</duration><type>quarter</type></note>
    </measure>
    <measure number="2">
      <note><pitch><step>D</step><octave>3</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>B</step><octave>2</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>A</step><octave>2</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>1</duration><type>quarter</type></note>
    </measure>
    <measure number="3">
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>E</step><octave>2</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>F</step><alter>1</alter><octave>2</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>1</duration><type>quarter</type></note>
    </measure>
    <measure number="4">
      <note><pitch><step>C</step><octave>3</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>3</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>2</octave></pitch><duration>2</duration><type>half</type></note>
    </measure>
    <measure number="5">
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>3</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>3</octave></pitch><duration>1</duration><type>quarter</type></note>
    </measure>
    <measure number="6">
      <note><pitch><step>E</step><octave>2</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>C</step><octave>3</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>3</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>1</duration><type>quarter</type></note>
    </measure>
    <measure number="7">
      <note><pitch><step>D</step><octave>3</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>B</step><octave>2</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>C</step><octave>3</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>3</octave></pitch><duration>1</duration><type>quarter</type></note>
    </measure>
    <measure number="8">
      <note><pitch><step>C</step><octave>3</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>3</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>2</octave></pitch><duration>2</duration><type>half</type></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>`
  },
  {
    id: 'tuba-low-long-tones',
    title: 'Low Register Long Tones',
    category: 'Custom',
    difficulty: 'Beginner',
    defaultBpm: 60,
    beatsPerMeasure: 4,
    description:
      "Sustained whole notes through the tuba's low register (C2–G2) with gentle midrange piano harmony chords. Treble clef.",
    xmlData: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work><work-title>Low Register Long Tones</work-title></work>
  <part-list>
    <score-part id="P1"><part-name>Tuba</part-name></score-part>
    <score-part id="P2"><part-name>Piano</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note><pitch><step>C</step><octave>2</octave></pitch><duration>4</duration><type>whole</type></note>
    </measure>
    <measure number="2"><note><pitch><step>D</step><octave>2</octave></pitch><duration>4</duration><type>whole</type></note></measure>
    <measure number="3"><note><pitch><step>E</step><octave>2</octave></pitch><duration>4</duration><type>whole</type></note></measure>
    <measure number="4"><note><pitch><step>F</step><octave>2</octave></pitch><duration>4</duration><type>whole</type></note></measure>
    <measure number="5"><note><pitch><step>G</step><octave>2</octave></pitch><duration>4</duration><type>whole</type></note></measure>
    <measure number="6"><note><pitch><step>F</step><octave>2</octave></pitch><duration>4</duration><type>whole</type></note></measure>
    <measure number="7"><note><pitch><step>E</step><octave>2</octave></pitch><duration>4</duration><type>whole</type></note></measure>
    <measure number="8"><note><pitch><step>D</step><octave>2</octave></pitch><duration>4</duration><type>whole</type></note></measure>
    <measure number="9">
      <note><pitch><step>C</step><octave>2</octave></pitch><duration>4</duration><type>whole</type></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
  <part id="P2">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note><pitch><step>C</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>E</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>G</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
    </measure>
    <measure number="2">
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>A</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
    </measure>
    <measure number="3">
      <note><pitch><step>E</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>G</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>C</step><octave>5</octave></pitch><duration>4</duration><type>whole</type></note>
    </measure>
    <measure number="4">
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>A</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>C</step><octave>5</octave></pitch><duration>4</duration><type>whole</type></note>
    </measure>
    <measure number="5">
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>B</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>D</step><octave>5</octave></pitch><duration>4</duration><type>whole</type></note>
    </measure>
    <measure number="6">
      <note><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>A</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>C</step><octave>5</octave></pitch><duration>4</duration><type>whole</type></note>
    </measure>
    <measure number="7">
      <note><pitch><step>E</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>G</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>C</step><octave>5</octave></pitch><duration>4</duration><type>whole</type></note>
    </measure>
    <measure number="8">
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>G</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>B</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
    </measure>
    <measure number="9">
      <note><pitch><step>C</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>E</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>G</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>C</step><octave>5</octave></pitch><duration>4</duration><type>whole</type></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>`
  },
  {
    id: 'tuba-bb-concert-scale',
    title: 'B♭ Concert Scale (Tuba Range)',
    category: 'Scales',
    difficulty: 'Beginner',
    defaultBpm: 80,
    beatsPerMeasure: 4,
    description:
      "One-octave B♭ major scale in the tuba's core range (B♭2–B♭3) with harmonic piano accompaniment. Treble clef.",
    xmlData: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work><work-title>B♭ Concert Scale (Tuba Range)</work-title></work>
  <part-list>
    <score-part id="P1"><part-name>Tuba</part-name></score-part>
    <score-part id="P2"><part-name>Piano</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <key><fifths>-2</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note><pitch><step>B</step><alter>-1</alter><octave>2</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>C</step><octave>3</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>3</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>E</step><alter>-1</alter><octave>3</octave></pitch><duration>1</duration><type>quarter</type></note>
    </measure>
    <measure number="2">
      <note><pitch><step>F</step><octave>3</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>3</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>A</step><octave>3</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>B</step><alter>-1</alter><octave>3</octave></pitch><duration>1</duration><type>quarter</type></note>
    </measure>
    <measure number="3">
      <note><pitch><step>A</step><octave>3</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>3</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>3</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>E</step><alter>-1</alter><octave>3</octave></pitch><duration>1</duration><type>quarter</type></note>
    </measure>
    <measure number="4">
      <note><pitch><step>D</step><octave>3</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>C</step><octave>3</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>B</step><alter>-1</alter><octave>2</octave></pitch><duration>2</duration><type>half</type></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
  <part id="P2">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <key><fifths>-2</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note><pitch><step>B</step><alter>-1</alter><octave>3</octave></pitch><duration>2</duration><type>half</type></note>
      <note><chord/><pitch><step>D</step><octave>4</octave></pitch><duration>2</duration><type>half</type></note>
      <note><chord/><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>half</type></note>
      <note><pitch><step>B</step><alter>-1</alter><octave>3</octave></pitch><duration>2</duration><type>half</type></note>
      <note><chord/><pitch><step>E</step><alter>-1</alter><octave>4</octave></pitch><duration>2</duration><type>half</type></note>
      <note><chord/><pitch><step>G</step><octave>4</octave></pitch><duration>2</duration><type>half</type></note>
    </measure>
    <measure number="2">
      <note><pitch><step>A</step><octave>3</octave></pitch><duration>2</duration><type>half</type></note>
      <note><chord/><pitch><step>C</step><octave>4</octave></pitch><duration>2</duration><type>half</type></note>
      <note><chord/><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>half</type></note>
      <note><pitch><step>B</step><alter>-1</alter><octave>3</octave></pitch><duration>2</duration><type>half</type></note>
      <note><chord/><pitch><step>D</step><octave>4</octave></pitch><duration>2</duration><type>half</type></note>
      <note><chord/><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>half</type></note>
    </measure>
    <measure number="3">
      <note><pitch><step>A</step><octave>3</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>C</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>E</step><alter>-1</alter><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
    </measure>
    <measure number="4">
      <note><pitch><step>B</step><alter>-1</alter><octave>3</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>D</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
      <note><chord/><pitch><step>B</step><alter>-1</alter><octave>4</octave></pitch><duration>4</duration><type>whole</type></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>`
  },
  {
    id: 'tuba-f-major-arpeggio',
    title: 'F Major Arpeggio (Low Brass)',
    category: 'Arpeggios',
    difficulty: 'Intermediate',
    defaultBpm: 100,
    beatsPerMeasure: 3,
    description:
      "Broken F Major triad across two octaves of the tuba's range with lively piano chord accompaniment. Treble clef.",
    xmlData: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work><work-title>F Major Arpeggio (Low Brass)</work-title></work>
  <part-list>
    <score-part id="P1"><part-name>Tuba</part-name></score-part>
    <score-part id="P2"><part-name>Piano</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <key><fifths>-1</fifths></key>
        <time><beats>3</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note><pitch><step>F</step><octave>2</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>A</step><octave>2</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>C</step><octave>3</octave></pitch><duration>1</duration><type>quarter</type></note>
    </measure>
    <measure number="2">
      <note><pitch><step>F</step><octave>3</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>C</step><octave>3</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>A</step><octave>2</octave></pitch><duration>1</duration><type>quarter</type></note>
    </measure>
    <measure number="3">
      <note><pitch><step>F</step><octave>2</octave></pitch><duration>3</duration><type>half</type><dot/></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
  <part id="P2">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <key><fifths>-1</fifths></key>
        <time><beats>3</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note><pitch><step>A</step><octave>3</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><chord/><pitch><step>C</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><chord/><pitch><step>F</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>A</step><octave>3</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><chord/><pitch><step>C</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><chord/><pitch><step>F</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>A</step><octave>3</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><chord/><pitch><step>C</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><chord/><pitch><step>F</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
    </measure>
    <measure number="2">
      <note><pitch><step>B</step><alter>-1</alter><octave>3</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><chord/><pitch><step>C</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><chord/><pitch><step>E</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>B</step><alter>-1</alter><octave>3</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><chord/><pitch><step>C</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><chord/><pitch><step>E</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><pitch><step>B</step><alter>-1</alter><octave>3</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><chord/><pitch><step>C</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
      <note><chord/><pitch><step>E</step><octave>4</octave></pitch><duration>1</duration><type>quarter</type></note>
    </measure>
    <measure number="3">
      <note><pitch><step>A</step><octave>3</octave></pitch><duration>3</duration><type>half</type><dot/></note>
      <note><chord/><pitch><step>C</step><octave>4</octave></pitch><duration>3</duration><type>half</type><dot/></note>
      <note><chord/><pitch><step>F</step><octave>4</octave></pitch><duration>3</duration><type>half</type><dot/></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>`
  },
  {
    id: 'tuba-bass-line-groove',
    title: 'Oom-Pah Bass Line Groove',
    category: 'Rhythm',
    difficulty: 'Intermediate',
    defaultBpm: 110,
    beatsPerMeasure: 4,
    description:
      "Root-fifth 'oom-pah' bass line with syncopated off-beat entries and punchy brass/piano comping chords. Treble clef, concert B♭ major.",
    xmlData: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work><work-title>Oom-Pah Bass Line Groove</work-title></work>
  <part-list>
    <score-part id="P1"><part-name>Tuba</part-name></score-part>
    <score-part id="P2"><part-name>Piano</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>2</divisions>
        <key><fifths>-2</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note><pitch><step>B</step><alter>-1</alter><octave>2</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>3</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>3</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>B</step><alter>-1</alter><octave>2</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><rest/><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>3</octave></pitch><duration>1</duration><type>eighth</type></note>
    </measure>
    <measure number="2">
      <note><pitch><step>B</step><alter>-1</alter><octave>2</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>3</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>3</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>B</step><alter>-1</alter><octave>2</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><rest/><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>3</octave></pitch><duration>1</duration><type>eighth</type></note>
    </measure>
    <measure number="3">
      <note><pitch><step>B</step><alter>-1</alter><octave>2</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>3</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>D</step><octave>3</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>F</step><octave>3</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><rest/><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>D</step><octave>3</octave></pitch><duration>1</duration><type>eighth</type></note>
    </measure>
    <measure number="4">
      <note><pitch><step>B</step><alter>-1</alter><octave>2</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><rest/><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>B</step><alter>-1</alter><octave>2</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>B</step><alter>-1</alter><octave>2</octave></pitch><duration>4</duration><type>half</type></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
  <part id="P2">
    <measure number="1">
      <attributes>
        <divisions>2</divisions>
        <key><fifths>-2</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note><rest/><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><chord/><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><chord/><pitch><step>B</step><alter>-1</alter><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><rest/><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><chord/><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><chord/><pitch><step>B</step><alter>-1</alter><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
    </measure>
    <measure number="2">
      <note><rest/><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><chord/><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><chord/><pitch><step>B</step><alter>-1</alter><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><rest/><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><chord/><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><chord/><pitch><step>B</step><alter>-1</alter><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
    </measure>
    <measure number="3">
      <note><rest/><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><chord/><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><chord/><pitch><step>B</step><alter>-1</alter><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><rest/><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>C</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><chord/><pitch><step>E</step><alter>-1</alter><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><chord/><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><chord/><pitch><step>A</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
    </measure>
    <measure number="4">
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><chord/><pitch><step>F</step><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><chord/><pitch><step>B</step><alter>-1</alter><octave>4</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><rest/><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>B</step><alter>-1</alter><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>`
  },
  {
    id: 'ode-to-joy-bass-register',
    title: 'Ode to Joy (Bass Register)',
    category: 'Classical',
    difficulty: 'Beginner',
    defaultBpm: 100,
    beatsPerMeasure: 4,
    description:
      "Beethoven's Ode to Joy theme set in the tuba's comfortable low-mid register with classical orchestra piano harmony. Treble clef.",
    xmlData: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">
<score-partwise version="3.1">
  <work><work-title>Ode to Joy (Bass Register)</work-title></work>
  <part-list>
    <score-part id="P1"><part-name>Tuba</part-name></score-part>
    <score-part id="P2"><part-name>Piano</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>2</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note><pitch><step>E</step><octave>3</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>E</step><octave>3</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>3</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>G</step><octave>3</octave></pitch><duration>2</duration><type>quarter</type></note>
    </measure>
    <measure number="2">
      <note><pitch><step>G</step><octave>3</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>F</step><octave>3</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>E</step><octave>3</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>3</octave></pitch><duration>2</duration><type>quarter</type></note>
    </measure>
    <measure number="3">
      <note><pitch><step>C</step><octave>3</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>C</step><octave>3</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>D</step><octave>3</octave></pitch><duration>2</duration><type>quarter</type></note>
      <note><pitch><step>E</step><octave>3</octave></pitch><duration>2</duration><type>quarter</type></note>
    </measure>
    <measure number="4">
      <note><pitch><step>E</step><octave>3</octave></pitch><duration>3</duration><type>quarter</type><dot/></note>
      <note><pitch><step>D</step><octave>3</octave></pitch><duration>1</duration><type>eighth</type></note>
      <note><pitch><step>D</step><octave>3</octave></pitch><duration>4</duration><type>half</type></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
  <part id="P2">
    <measure number="1">
      <attributes>
        <divisions>2</divisions>
        <key><fifths>0</fifths></key>
        <time><beats>4</beats><beat-type>4</beat-type></time>
        <clef><sign>G</sign><line>2</line></clef>
      </attributes>
      <note><pitch><step>C</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>E</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>G</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
      <note><pitch><step>B</step><octave>3</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>D</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>G</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
    </measure>
    <measure number="2">
      <note><pitch><step>C</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>E</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>G</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
      <note><pitch><step>B</step><octave>3</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>D</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>G</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
    </measure>
    <measure number="3">
      <note><pitch><step>C</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>E</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>G</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
      <note><pitch><step>B</step><octave>3</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>D</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>G</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
    </measure>
    <measure number="4">
      <note><pitch><step>B</step><octave>3</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>D</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>F</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>G</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
      <note><pitch><step>C</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>E</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
      <note><chord/><pitch><step>G</step><octave>4</octave></pitch><duration>4</duration><type>half</type></note>
      <barline location="right"><bar-style>light-heavy</bar-style></barline>
    </measure>
  </part>
</score-partwise>`
  }
];
