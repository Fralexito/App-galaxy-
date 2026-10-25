import test from 'node:test'; import assert from 'node:assert/strict';
import { calcularTabla, goleadores } from '../src/tabla.js';
test('tabla ordena por puntos y diferencia', () => {
  const t = calcularTabla([{ local: 'A', visitante: 'B', goles_local: 2, goles_visita: 1 }, { local: 'B', visitante: 'C', goles_local: 3, goles_visita: 0 }, { local: 'C', visitante: 'A', goles_local: 1, goles_visita: 1 }]);
  assert.deepEqual(t.map((x) => x.nombre), ['A', 'B', 'C']);
  assert.equal(t[0].pts, 4);
});
test('ignora partidos sin marcador', () => assert.equal(calcularTabla([{ local: 'A', visitante: 'B', goles_local: null, goles_visita: null }]).length, 0));
test('goleadores cuenta y excluye propias', () => {
  const g = goleadores([{ goleador: 'X' }, { goleador: 'X' }, { goleador: 'Y' }, { goleador: 'Z', tipo: 'propia' }]);
  assert.deepEqual(g, [{ nombre: 'X', goles: 2 }, { nombre: 'Y', goles: 1 }]);
});
