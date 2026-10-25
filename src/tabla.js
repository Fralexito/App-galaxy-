// Lógica pura (con test): tabla de posiciones y goleadores. 3 pts victoria, 1 empate.
export function calcularTabla(partidos) {
  const m = new Map();
  const f = (n) => { if (!m.has(n)) m.set(n, { nombre: n, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 }); return m.get(n); };
  for (const p of partidos) {
    if (p.goles_local == null || p.goles_visita == null) continue;
    const a = f(p.local), b = f(p.visitante);
    a.pj++; b.pj++; a.gf += p.goles_local; a.gc += p.goles_visita; b.gf += p.goles_visita; b.gc += p.goles_local;
    if (p.goles_local > p.goles_visita) { a.g++; b.p++; a.pts += 3; }
    else if (p.goles_local < p.goles_visita) { b.g++; a.p++; b.pts += 3; }
    else { a.e++; b.e++; a.pts++; b.pts++; }
  }
  for (const r of m.values()) r.dg = r.gf - r.gc;
  return [...m.values()].sort((x, y) => y.pts - x.pts || y.dg - x.dg || y.gf - x.gf || x.nombre.localeCompare(y.nombre, 'es'));
}
export function goleadores(goles) {
  const m = new Map();
  for (const g of goles) { if (!g.goleador || g.tipo === 'propia') continue; m.set(g.goleador, (m.get(g.goleador) ?? 0) + 1); }
  return [...m].map(([nombre, goles]) => ({ nombre, goles })).sort((a, b) => b.goles - a.goles || a.nombre.localeCompare(b.nombre, 'es'));
}
