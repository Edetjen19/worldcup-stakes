/* ===================== STATIC REFERENCE ===================== */
const FLAG_ISO = {
  MEX:'MX',RSA:'ZA',KOR:'KR',CZE:'CZ',SUI:'CH',CAN:'CA',BIH:'BA',QAT:'QA',
  BRA:'BR',MAR:'MA',HAI:'HT',USA:'US',AUS:'AU',PAR:'PY',TUR:'TR',GER:'DE',
  CIV:'CI',ECU:'EC',CUW:'CW',NED:'NL',JPN:'JP',SWE:'SE',TUN:'TN',EGY:'EG',
  IRN:'IR',BEL:'BE',NZL:'NZ',ESP:'ES',URU:'UY',CPV:'CV',KSA:'SA',FRA:'FR',
  NOR:'NO',SEN:'SN',IRQ:'IQ',ARG:'AR',AUT:'AT',ALG:'DZ',JOR:'JO',COL:'CO',
  POR:'PT',COD:'CD',UZB:'UZ',GHA:'GH',CRO:'HR',PAN:'PA'
};

function flag(c) {
  if (c === 'ENG') return '🏴󠁧󠁢󠁥󠁮󠁧󠁿';
  if (c === 'SCO') return '🏴󠁧󠁢󠁳󠁣󠁴󠁿';
  const i = FLAG_ISO[c];
  if (!i) return '🏳️';
  return String.fromCodePoint(...[...i].map(x => 0x1F1E6 + x.charCodeAt(0) - 65));
}

const NAME = {
  MEX:'Mexico',RSA:'South Africa',KOR:'South Korea',CZE:'Czechia',SUI:'Switzerland',
  CAN:'Canada',BIH:'Bosnia',QAT:'Qatar',BRA:'Brazil',MAR:'Morocco',SCO:'Scotland',
  HAI:'Haiti',USA:'USA',AUS:'Australia',PAR:'Paraguay',TUR:'Türkiye',GER:'Germany',
  CIV:'Ivory Coast',ECU:'Ecuador',CUW:'Curaçao',NED:'Netherlands',JPN:'Japan',
  SWE:'Sweden',TUN:'Tunisia',EGY:'Egypt',IRN:'Iran',BEL:'Belgium',NZL:'New Zealand',
  ESP:'Spain',URU:'Uruguay',CPV:'Cape Verde',KSA:'Saudi Arabia',FRA:'France',
  NOR:'Norway',SEN:'Senegal',IRQ:'Iraq',ARG:'Argentina',AUT:'Austria',ALG:'Algeria',
  JOR:'Jordan',COL:'Colombia',POR:'Portugal',COD:'DR Congo',UZB:'Uzbekistan',
  ENG:'England',GHA:'Ghana',CRO:'Croatia',PAN:'Panama'
};

const DAYS = {
  'Jun 25': 'Tonight · Thursday 25 June',
  'Jun 26': 'Friday 26 June',
  'Jun 27': 'Saturday 27 June'
};

/* ===================== ENGINE ===================== */
function eff(mm) {
  return { hs: mm[2], as: mm[3], played: !!mm[4] };
}

function isComplete(g) {
  return g.m.every(mm => eff(mm).played);
}

function stats(g) {
  const t = {};
  g.teams.forEach(c => t[c] = { c, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0 });
  g.m.forEach(mm => {
    const e = eff(mm);
    if (!e.played) return;
    const H = t[mm[0]], A = t[mm[1]];
    H.p++; A.p++;
    H.gf += e.hs; H.ga += e.as;
    A.gf += e.as; A.ga += e.hs;
    if (e.hs > e.as) { H.w++; A.l++; H.pts += 3; }
    else if (e.hs < e.as) { A.w++; H.l++; A.pts += 3; }
    else { H.d++; A.d++; H.pts++; A.pts++; }
  });
  Object.values(t).forEach(x => x.gd = x.gf - x.ga);
  return t;
}

function mini(blk, g) {
  const t = {};
  blk.forEach(c => t[c] = { pts: 0, gd: 0, gf: 0 });
  g.m.forEach(mm => {
    const e = eff(mm);
    if (!e.played) return;
    if (blk.includes(mm[0]) && blk.includes(mm[1])) {
      const H = t[mm[0]], A = t[mm[1]];
      H.gf += e.hs; H.gd += e.hs - e.as;
      A.gf += e.as; A.gd += e.as - e.hs;
      if (e.hs > e.as) H.pts += 3;
      else if (e.hs < e.as) A.pts += 3;
      else { H.pts++; A.pts++; }
    }
  });
  return t;
}

function byOverall(s, t, g) {
  return [...s].sort((a, b) => t[b].gd - t[a].gd || t[b].gf - t[a].gf || g.teams.indexOf(a) - g.teams.indexOf(b));
}

function breakTie(blk, t, g) {
  const m = mini(blk, g);
  const sorted = [...blk].sort((a, b) => m[b].pts - m[a].pts || m[b].gd - m[a].gd || m[b].gf - m[a].gf);
  const segs = [];
  let cur = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    const a = sorted[i - 1], b = sorted[i];
    if (m[a].pts === m[b].pts && m[a].gd === m[b].gd && m[a].gf === m[b].gf) cur.push(b);
    else { segs.push(cur); cur = [b]; }
  }
  segs.push(cur);
  let res = [];
  for (const s of segs) {
    if (s.length === 1) res.push(s[0]);
    else if (s.length === blk.length) res = res.concat(byOverall(s, t, g));
    else res = res.concat(breakTie(s, t, g));
  }
  return res;
}

function rank(g) {
  const t = stats(g);
  const byPts = [...g.teams].sort((a, b) => t[b].pts - t[a].pts);
  const segs = [];
  let cur = [byPts[0]];
  for (let i = 1; i < byPts.length; i++) {
    if (t[byPts[i]].pts === t[byPts[i - 1]].pts) cur.push(byPts[i]);
    else { segs.push(cur); cur = [byPts[i]]; }
  }
  segs.push(cur);
  let order = [];
  for (const s of segs) order = order.concat(s.length > 1 ? breakTie(s, t, g) : s);
  return { t, order };
}

function thirdBoard(GROUPS) {
  const arr = GROUPS.map(g => {
    const { t, order } = rank(g);
    const c = order[2];
    return { g: g.id, c, complete: isComplete(g), ...t[c] };
  });
  arr.sort((x, y) => y.pts - x.pts || y.gd - x.gd || y.gf - x.gf || GROUPS.findIndex(z => z.id === x.g) - GROUPS.findIndex(z => z.id === y.g));
  return arr;
}

function status3(c, { GROUPS, WINNERS, LOCK_THROUGH, LOCK_WILD, LOCK_OUT }) {
  if (WINNERS.has(c)) return { k: 'through', label: 'Won group', str: 'str-g' };
  if (LOCK_THROUGH.has(c)) return { k: 'through', label: 'Through', str: 'str-g' };
  if (LOCK_WILD.has(c)) return { k: 'through', label: 'Through', str: 'str-g' };
  if (LOCK_OUT.has(c)) return { k: 'out', label: 'Knocked out', str: 'str-r' };
  const g = GROUPS.find(x => x.teams.includes(c));
  const { order } = rank(g);
  const idx = order.indexOf(c);
  if (isComplete(g)) {
    if (idx === 0) return { k: 'through', label: 'Won group', str: 'str-g' };
    if (idx === 1) return { k: 'through', label: 'Through', str: 'str-g' };
    if (idx === 2) {
      if (GROUPS.every(isComplete)) {
        const pos = thirdBoard(GROUPS).findIndex(x => x.c === c);
        return pos < 8
          ? { k: 'through', label: 'Through', str: 'str-g' }
          : { k: 'out', label: 'Knocked out', str: 'str-r' };
      }
      return { k: 'alive', label: 'Can still make it', str: 'str-a' };
    }
    return { k: 'out', label: 'Knocked out', str: 'str-r' };
  }
  return { k: 'alive', label: 'Can still make it', str: 'str-a' };
}

function ordinal(n) {
  return ['1st', '2nd', '3rd', '4th'][n - 1] || n + 'th';
}

module.exports = {
  FLAG_ISO, flag, NAME, DAYS,
  eff, isComplete, stats, mini, byOverall, breakTie, rank,
  thirdBoard, status3, ordinal
};
