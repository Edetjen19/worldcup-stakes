const {
  FLAG_ISO, flag, NAME, DAYS,
  eff, isComplete, stats, mini, byOverall, breakTie, rank,
  thirdBoard, status3, ordinal
} = require('./engine');

// ---------------------------------------------------------------------------
// Test fixtures
// ---------------------------------------------------------------------------

function makeGroupA() {
  return {
    id: 'A',
    teams: ['MEX', 'RSA', 'KOR', 'CZE'],
    m: [
      ['MEX', 'RSA', 2, 0, 1, '', ''],
      ['KOR', 'CZE', 2, 1, 1, '', ''],
      ['CZE', 'RSA', 1, 1, 1, '', ''],
      ['MEX', 'KOR', 1, 0, 1, '', ''],
      ['CZE', 'MEX', 0, 3, 1, '', ''],
      ['RSA', 'KOR', 1, 0, 1, '', '']
    ]
  };
}

function makeGroupJ() {
  return {
    id: 'J',
    teams: ['ARG', 'AUT', 'ALG', 'JOR'],
    m: [
      ['ARG', 'ALG', 3, 0, 1, '', ''],
      ['AUT', 'JOR', 3, 1, 1, '', ''],
      ['ARG', 'AUT', 2, 0, 1, '', ''],
      ['JOR', 'ALG', 1, 2, 1, '', ''],
      ['ALG', 'AUT', null, null, 0, 'Jun 27', 'Kansas City'],
      ['JOR', 'ARG', null, null, 0, 'Jun 27', 'Dallas']
    ]
  };
}

function makeDrawGroup() {
  return {
    id: 'X',
    teams: ['T1', 'T2', 'T3', 'T4'],
    m: [
      ['T1', 'T2', 1, 1, 1, '', ''],
      ['T3', 'T4', 0, 0, 1, '', ''],
      ['T1', 'T3', 2, 0, 1, '', ''],
      ['T2', 'T4', 3, 1, 1, '', ''],
      ['T1', 'T4', 1, 0, 1, '', ''],
      ['T2', 'T3', 2, 2, 1, '', '']
    ]
  };
}

function makeTiedGroup() {
  return {
    id: 'Y',
    teams: ['T1', 'T2', 'T3', 'T4'],
    m: [
      ['T1', 'T2', 1, 0, 1, '', ''],
      ['T3', 'T4', 2, 0, 1, '', ''],
      ['T1', 'T3', 0, 1, 1, '', ''],
      ['T2', 'T4', 0, 1, 1, '', ''],
      ['T1', 'T4', 2, 1, 1, '', ''],
      ['T2', 'T3', 1, 0, 1, '', '']
    ]
  };
}

function makeAllGroups() {
  const base = (id, teams, results) => ({
    id, teams,
    m: results.map(r => [...r, 1, '', ''])
  });
  return [
    makeGroupA(),
    base('B', ['SUI', 'CAN', 'BIH', 'QAT'], [
      ['CAN', 'BIH', 1, 1], ['QAT', 'SUI', 1, 1], ['SUI', 'BIH', 4, 1],
      ['CAN', 'QAT', 6, 0], ['SUI', 'CAN', 2, 1], ['BIH', 'QAT', 3, 1]
    ]),
    base('C', ['BRA', 'MAR', 'SCO', 'HAI'], [
      ['BRA', 'MAR', 1, 1], ['HAI', 'SCO', 0, 1], ['SCO', 'MAR', 0, 1],
      ['BRA', 'HAI', 3, 0], ['SCO', 'BRA', 0, 3], ['MAR', 'HAI', 4, 2]
    ]),
    base('D', ['USA', 'AUS', 'PAR', 'TUR'], [
      ['USA', 'PAR', 4, 1], ['AUS', 'TUR', 2, 0], ['USA', 'AUS', 2, 0],
      ['TUR', 'PAR', 0, 1], ['TUR', 'USA', 3, 2], ['PAR', 'AUS', 0, 0]
    ]),
    base('E', ['GER', 'CIV', 'ECU', 'CUW'], [
      ['GER', 'CUW', 7, 1], ['CIV', 'ECU', 1, 0], ['GER', 'CIV', 2, 1],
      ['ECU', 'CUW', 0, 0], ['CUW', 'CIV', 0, 2], ['ECU', 'GER', 2, 1]
    ]),
    base('F', ['NED', 'JPN', 'SWE', 'TUN'], [
      ['NED', 'JPN', 2, 2], ['SWE', 'TUN', 5, 1], ['NED', 'SWE', 5, 1],
      ['JPN', 'TUN', 4, 0], ['JPN', 'SWE', 1, 1], ['TUN', 'NED', 1, 3]
    ]),
    base('G', ['EGY', 'IRN', 'BEL', 'NZL'], [
      ['BEL', 'EGY', 1, 1], ['IRN', 'NZL', 2, 2], ['BEL', 'IRN', 0, 0],
      ['NZL', 'EGY', 1, 3], ['EGY', 'IRN', 1, 1], ['NZL', 'BEL', 1, 5]
    ]),
    base('H', ['ESP', 'URU', 'CPV', 'KSA'], [
      ['ESP', 'CPV', 0, 0], ['KSA', 'URU', 1, 1], ['ESP', 'KSA', 4, 0],
      ['URU', 'CPV', 2, 2], ['URU', 'ESP', 0, 1], ['CPV', 'KSA', 0, 0]
    ]),
    base('I', ['FRA', 'NOR', 'SEN', 'IRQ'], [
      ['FRA', 'SEN', 3, 1], ['IRQ', 'NOR', 1, 4], ['FRA', 'IRQ', 3, 0],
      ['NOR', 'SEN', 3, 2], ['NOR', 'FRA', 1, 4], ['SEN', 'IRQ', 5, 0]
    ]),
    base('J', ['ARG', 'AUT', 'ALG', 'JOR'], [
      ['ARG', 'ALG', 3, 0], ['AUT', 'JOR', 3, 1], ['ARG', 'AUT', 2, 0],
      ['JOR', 'ALG', 1, 2], ['ALG', 'AUT', 1, 2], ['JOR', 'ARG', 0, 3]
    ]),
    base('K', ['COL', 'POR', 'COD', 'UZB'], [
      ['POR', 'COD', 1, 1], ['UZB', 'COL', 1, 3], ['POR', 'UZB', 5, 0],
      ['COL', 'COD', 1, 0], ['COL', 'POR', 0, 1], ['COD', 'UZB', 2, 0]
    ]),
    base('L', ['ENG', 'GHA', 'CRO', 'PAN'], [
      ['ENG', 'CRO', 4, 2], ['GHA', 'PAN', 1, 0], ['ENG', 'GHA', 0, 0],
      ['PAN', 'CRO', 0, 1], ['PAN', 'ENG', 0, 2], ['CRO', 'GHA', 1, 2]
    ])
  ];
}

function defaultCtx(groups) {
  return {
    GROUPS: groups,
    WINNERS: new Set(),
    LOCK_THROUGH: new Set(),
    LOCK_WILD: new Set(),
    LOCK_OUT: new Set()
  };
}

// ===========================================================================
// eff
// ===========================================================================
describe('eff', () => {
  test('returns scores and played=true for a completed match', () => {
    expect(eff(['MEX', 'RSA', 2, 0, 1, '', ''])).toEqual({ hs: 2, as: 0, played: true });
  });

  test('returns null scores and played=false for an unplayed match', () => {
    expect(eff(['ALG', 'AUT', null, null, 0, 'Jun 27', 'Kansas City'])).toEqual({ hs: null, as: null, played: false });
  });

  test('handles a 0-0 draw correctly', () => {
    expect(eff(['PAR', 'AUS', 0, 0, 1, '', ''])).toEqual({ hs: 0, as: 0, played: true });
  });
});

// ===========================================================================
// isComplete
// ===========================================================================
describe('isComplete', () => {
  test('returns true when all matches are played', () => {
    expect(isComplete(makeGroupA())).toBe(true);
  });

  test('returns false when some matches are unplayed', () => {
    expect(isComplete(makeGroupJ())).toBe(false);
  });

  test('returns false when no matches are played', () => {
    const g = {
      id: 'Z', teams: ['A', 'B', 'C', 'D'],
      m: [['A', 'B', null, null, 0, '', ''], ['C', 'D', null, null, 0, '', '']]
    };
    expect(isComplete(g)).toBe(false);
  });
});

// ===========================================================================
// stats
// ===========================================================================
describe('stats', () => {
  test('computes correct stats for a completed group (Group A)', () => {
    const t = stats(makeGroupA());
    expect(t.MEX).toMatchObject({ w: 3, d: 0, l: 0, gf: 6, ga: 0, gd: 6, pts: 9, p: 3 });
    expect(t.RSA).toMatchObject({ w: 1, d: 1, l: 1, gf: 2, ga: 3, gd: -1, pts: 4, p: 3 });
    expect(t.KOR).toMatchObject({ w: 1, d: 0, l: 2, gf: 2, ga: 3, gd: -1, pts: 3, p: 3 });
    expect(t.CZE).toMatchObject({ w: 0, d: 1, l: 2, gf: 2, ga: 6, gd: -4, pts: 1, p: 3 });
  });

  test('ignores unplayed matches', () => {
    const t = stats(makeGroupJ());
    expect(t.ARG).toMatchObject({ p: 2, w: 2, d: 0, l: 0, gf: 5, ga: 0, gd: 5, pts: 6 });
    expect(t.JOR).toMatchObject({ p: 2, w: 0, d: 0, l: 2, gf: 2, ga: 5, gd: -3, pts: 0 });
  });

  test('handles draws correctly', () => {
    const t = stats(makeDrawGroup());
    expect(t.T1).toMatchObject({ w: 2, d: 1, l: 0, pts: 7, gf: 4, ga: 1, gd: 3 });
    expect(t.T4).toMatchObject({ w: 0, d: 1, l: 2, pts: 1 });
  });

  test('total goals for and against balance across the group', () => {
    const t = stats(makeGroupA());
    const teams = Object.values(t);
    const totalGF = teams.reduce((s, x) => s + x.gf, 0);
    const totalGA = teams.reduce((s, x) => s + x.ga, 0);
    expect(totalGF).toBe(totalGA);
  });
});

// ===========================================================================
// mini
// ===========================================================================
describe('mini', () => {
  test('computes head-to-head record for a subset of teams', () => {
    const m = mini(['RSA', 'KOR'], makeGroupA());
    expect(m.RSA).toEqual({ pts: 3, gd: 1, gf: 1 });
    expect(m.KOR).toEqual({ pts: 0, gd: -1, gf: 0 });
  });

  test('ignores matches not involving the subset', () => {
    const m = mini(['MEX', 'RSA'], makeGroupA());
    expect(m.MEX).toEqual({ pts: 3, gd: 2, gf: 2 });
    expect(m.RSA).toEqual({ pts: 0, gd: -2, gf: 0 });
  });

  test('handles a draw in head-to-head', () => {
    const g = { id: 'Z', teams: ['A', 'B'], m: [['A', 'B', 1, 1, 1, '', '']] };
    const m = mini(['A', 'B'], g);
    expect(m.A).toEqual({ pts: 1, gd: 0, gf: 1 });
    expect(m.B).toEqual({ pts: 1, gd: 0, gf: 1 });
  });

  test('skips unplayed matches', () => {
    const m = mini(['ALG', 'AUT'], makeGroupJ());
    expect(m.ALG).toEqual({ pts: 0, gd: 0, gf: 0 });
    expect(m.AUT).toEqual({ pts: 0, gd: 0, gf: 0 });
  });
});

// ===========================================================================
// byOverall
// ===========================================================================
describe('byOverall', () => {
  test('sorts by goal difference, then goals scored, then seeding order', () => {
    const g = { teams: ['A', 'B', 'C'] };
    const t = { A: { gd: 2, gf: 5 }, B: { gd: 3, gf: 4 }, C: { gd: 2, gf: 6 } };
    expect(byOverall(['A', 'B', 'C'], t, g)).toEqual(['B', 'C', 'A']);
  });

  test('falls back to seeding order when GD and GF are identical', () => {
    const g = { teams: ['A', 'B', 'C'] };
    const t = { A: { gd: 0, gf: 2 }, B: { gd: 0, gf: 2 }, C: { gd: 0, gf: 2 } };
    expect(byOverall(['A', 'B', 'C'], t, g)).toEqual(['A', 'B', 'C']);
  });
});

// ===========================================================================
// breakTie
// ===========================================================================
describe('breakTie', () => {
  test('breaks a two-team tie using head-to-head result', () => {
    const g = makeTiedGroup();
    const t = stats(g);
    const result = breakTie(['T1', 'T2'], t, g);
    expect(result[0]).toBe('T1');
    expect(result[1]).toBe('T2');
  });

  test('recursive breakTie when h2h splits a 4-way tie into sub-segments', () => {
    // 4 teams all on 4 pts. h2h produces two pairs with distinct gd,
    // triggering recursive breakTie on each pair (size 2 < blk size 4).
    const g = {
      id: 'Z', teams: ['A', 'B', 'C', 'D'],
      m: [
        ['A', 'B', 2, 0, 1, '', ''],
        ['C', 'D', 2, 0, 1, '', ''],
        ['A', 'C', 0, 0, 1, '', ''],
        ['B', 'D', 0, 0, 1, '', ''],
        ['D', 'A', 1, 0, 1, '', ''],
        ['B', 'C', 1, 0, 1, '', '']
      ]
    };
    const { order } = rank(g);
    expect(order).toHaveLength(4);
    expect(order.indexOf('A')).toBeLessThan(order.indexOf('B'));
    expect(order.indexOf('C')).toBeLessThan(order.indexOf('D'));
  });

  test('falls back to overall GD when head-to-head is a draw', () => {
    const g = {
      id: 'Z', teams: ['A', 'B', 'C', 'D'],
      m: [
        ['A', 'B', 1, 1, 1, '', ''],
        ['C', 'D', 0, 0, 1, '', ''],
        ['A', 'C', 3, 0, 1, '', ''],
        ['B', 'D', 1, 0, 1, '', ''],
        ['A', 'D', 2, 0, 1, '', ''],
        ['B', 'C', 2, 0, 1, '', '']
      ]
    };
    const t = stats(g);
    // A: 7pts gd+5, B: 7pts gd+3. h2h: 1-1 draw => equal.
    // Falls to byOverall where A has better GD.
    const result = breakTie(['A', 'B'], t, g);
    expect(result[0]).toBe('A');
    expect(result[1]).toBe('B');
  });
});

// ===========================================================================
// rank
// ===========================================================================
describe('rank', () => {
  test('ranks a completed group correctly (Group A)', () => {
    const { t, order } = rank(makeGroupA());
    expect(order).toEqual(['MEX', 'RSA', 'KOR', 'CZE']);
    expect(t.MEX.pts).toBe(9);
    expect(t.CZE.pts).toBe(1);
  });

  test('ranks a partially completed group correctly (Group J)', () => {
    const { order } = rank(makeGroupJ());
    expect(order[0]).toBe('ARG');
    expect(order[1]).toBe('AUT');
    expect(order[2]).toBe('ALG');
    expect(order[3]).toBe('JOR');
  });

  test('returns stats in descending points order', () => {
    const { t, order } = rank(makeGroupA());
    for (let i = 0; i < order.length - 1; i++) {
      expect(t[order[i]].pts).toBeGreaterThanOrEqual(t[order[i + 1]].pts);
    }
  });

  test('handles a group with clear winner and tiebreakers needed below', () => {
    const { order } = rank(makeDrawGroup());
    expect(order[0]).toBe('T1');
  });
});

// ===========================================================================
// thirdBoard
// ===========================================================================
describe('thirdBoard', () => {
  test('returns 12 entries sorted by pts then GD then GF', () => {
    const bd = thirdBoard(makeAllGroups());
    expect(bd).toHaveLength(12);
    for (let i = 1; i < bd.length; i++) {
      const cmp = bd[i - 1].pts - bd[i].pts || bd[i - 1].gd - bd[i].gd || bd[i - 1].gf - bd[i].gf;
      expect(cmp).toBeGreaterThanOrEqual(0);
    }
  });

  test('each entry has the correct 3rd-place team', () => {
    const groups = makeAllGroups();
    thirdBoard(groups).forEach(entry => {
      const g = groups.find(x => x.id === entry.g);
      expect(entry.c).toBe(rank(g).order[2]);
    });
  });

  test('marks completed groups appropriately', () => {
    thirdBoard(makeAllGroups()).forEach(entry => {
      expect(entry.complete).toBe(true);
    });
  });
});

// ===========================================================================
// status3
// ===========================================================================
describe('status3', () => {
  test('returns "Won group" for teams in WINNERS set', () => {
    const s = status3('MEX', { ...defaultCtx(makeAllGroups()), WINNERS: new Set(['MEX']) });
    expect(s).toEqual({ k: 'through', label: 'Won group', str: 'str-g' });
  });

  test('returns "Through" for teams in LOCK_THROUGH set', () => {
    const s = status3('RSA', { ...defaultCtx(makeAllGroups()), LOCK_THROUGH: new Set(['RSA']) });
    expect(s.k).toBe('through');
    expect(s.label).toBe('Through');
  });

  test('returns "Through" for teams in LOCK_WILD set', () => {
    const s = status3('KOR', { ...defaultCtx(makeAllGroups()), LOCK_WILD: new Set(['KOR']) });
    expect(s.k).toBe('through');
  });

  test('returns "Knocked out" for teams in LOCK_OUT set', () => {
    const s = status3('CZE', { ...defaultCtx(makeAllGroups()), LOCK_OUT: new Set(['CZE']) });
    expect(s.k).toBe('out');
  });

  test('WINNERS takes priority over LOCK_OUT', () => {
    const s = status3('MEX', {
      ...defaultCtx(makeAllGroups()),
      WINNERS: new Set(['MEX']),
      LOCK_OUT: new Set(['MEX'])
    });
    expect(s.k).toBe('through');
  });

  test('computed: group winner is "Won group"', () => {
    expect(status3('MEX', defaultCtx(makeAllGroups())).label).toBe('Won group');
  });

  test('computed: group runner-up is "Through"', () => {
    expect(status3('RSA', defaultCtx(makeAllGroups())).label).toBe('Through');
  });

  test('computed: 4th-place team is "Knocked out"', () => {
    expect(status3('CZE', defaultCtx(makeAllGroups())).k).toBe('out');
  });

  test('3rd-place resolved when all groups complete: top 8 through, bottom 4 out', () => {
    const groups = makeAllGroups();
    const bd = thirdBoard(groups);
    const ctx = defaultCtx(groups);

    expect(status3(bd[0].c, ctx).k).toBe('through');
    expect(status3(bd[11].c, ctx).k).toBe('out');
  });

  test('3rd-place team in completed group returns "alive" when other groups incomplete', () => {
    // Mix: Group A complete, Group J incomplete
    const groups = [makeGroupA(), makeGroupJ()];
    const ctx = defaultCtx(groups);
    // KOR is 3rd in completed Group A, but Group J is incomplete
    const s = status3('KOR', ctx);
    expect(s.k).toBe('alive');
    expect(s.label).toBe('Can still make it');
  });

  test('team in an incomplete group returns "alive"', () => {
    const s = status3('ALG', defaultCtx([makeGroupJ()]));
    expect(s.k).toBe('alive');
  });
});

// ===========================================================================
// flag
// ===========================================================================
describe('flag', () => {
  test('returns England flag emoji for ENG', () => {
    expect(flag('ENG')).toBe('🏴󠁧󠁢󠁥󠁮󠁧󠁿');
  });

  test('returns Scotland flag emoji for SCO', () => {
    expect(flag('SCO')).toBe('🏴󠁧󠁢󠁳󠁣󠁴󠁿');
  });

  test('returns regional indicator pair for USA', () => {
    expect(flag('USA')).toBe('🇺🇸');
  });

  test('returns regional indicator pair for BRA', () => {
    expect(flag('BRA')).toBe('🇧🇷');
  });

  test('returns white flag for unknown code', () => {
    expect(flag('XYZ')).toBe('🏳️');
  });

  test('returns a non-empty, non-fallback flag for every FLAG_ISO entry', () => {
    Object.keys(FLAG_ISO).forEach(code => {
      const f = flag(code);
      expect(f).not.toBe('🏳️');
      expect(f.length).toBeGreaterThan(0);
    });
  });
});

// ===========================================================================
// ordinal
// ===========================================================================
describe('ordinal', () => {
  test.each([
    [1, '1st'], [2, '2nd'], [3, '3rd'], [4, '4th'],
    [5, '5th'], [10, '10th'], [12, '12th']
  ])('ordinal(%i) = %s', (n, expected) => {
    expect(ordinal(n)).toBe(expected);
  });
});

// ===========================================================================
// constants
// ===========================================================================
describe('constants', () => {
  test('FLAG_ISO has entries for all teams except ENG and SCO', () => {
    Object.keys(NAME).filter(c => c !== 'ENG' && c !== 'SCO').forEach(code => {
      expect(FLAG_ISO).toHaveProperty(code);
    });
  });

  test('NAME covers all FLAG_ISO codes plus ENG and SCO', () => {
    Object.keys(FLAG_ISO).forEach(code => expect(NAME).toHaveProperty(code));
    expect(NAME).toHaveProperty('ENG');
    expect(NAME).toHaveProperty('SCO');
  });

  test('DAYS has expected date keys', () => {
    expect(Object.keys(DAYS).sort()).toEqual(['Jun 25', 'Jun 26', 'Jun 27']);
  });
});

// ===========================================================================
// Integration
// ===========================================================================
describe('integration', () => {
  test('all-complete groups: exactly 32 through and 16 out', () => {
    const groups = makeAllGroups();
    const ctx = defaultCtx(groups);
    let through = 0, out = 0;

    groups.forEach(g => g.teams.forEach(c => {
      const k = status3(c, ctx).k;
      if (k === 'through') through++;
      if (k === 'out') out++;
    }));

    expect(through).toBe(32);
    expect(out).toBe(16);
  });

  test('third-placed teams cover all 12 groups', () => {
    const bd = thirdBoard(makeAllGroups());
    expect(new Set(bd.map(x => x.g)).size).toBe(12);
  });
});
