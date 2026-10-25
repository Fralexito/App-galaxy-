import './style.css';
import * as api from './api.js';
import { calcularTabla, goleadores } from './tabla.js';

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const vista = $('#vista');
let actual = 'liga', liga = localStorage.getItem('liga') || 'galaxy';
document.documentElement.dataset.tema = liga === 'sudario' ? 'sudario' : '';
$('#btn-tema').textContent = liga === 'sudario' ? 'Sudario' : 'Galaxy';

const err = (e) => `<div class="card">No se pudo cargar. Revisa tu conexión.<div class="mut">${esc(e?.message)}</div></div>`;
const vacio = (t) => `<div class="card mut">${t}</div>`;

async function vLiga() {
  const eds = (await api.ediciones()).filter((e) => e.liga === liga);
  if (!eds.length) return vacio('Aún no hay ediciones de esta liga.');
  const sel = localStorage.getItem('ed_' + liga);
  const ed = eds.find((e) => e.id === sel) || eds[0];
  const [ps, gs] = await Promise.all([api.partidosLiga(ed.id), api.golesLiga(ed.liga, ed.edicion)]);
  const tabla = calcularTabla(ps), gol = goleadores(gs);
  const fechas = [...new Set(ps.map((p) => p.fecha))].sort((a, b) => b - a);
  return `
  <select id="ed">${eds.map((e) => `<option value="${esc(e.id)}"${e.id === ed.id ? ' selected' : ''}>${esc(e.nombre)}</option>`).join('')}</select>
  <h2>Tabla</h2><div class="card"><table><tr><th>#</th><th>Jugador</th><th>PJ</th><th>DG</th><th>PTS</th></tr>
  ${tabla.map((f, i) => `<tr><td>${i + 1}</td><td>${esc(f.nombre)}</td><td>${f.pj}</td><td>${f.dg > 0 ? '+' : ''}${f.dg}</td><td class="pts">${f.pts}</td></tr>`).join('') || '<tr><td colspan=5 class="mut">Sin partidos</td></tr>'}</table></div>
  <h2>Goleadores</h2><div class="card">${gol.length ? `<table>${gol.slice(0, 10).map((g, i) => `<tr><td>${i + 1}</td><td>${esc(g.nombre)}</td><td class="pts">${g.goles} ⚽</td></tr>`).join('')}</table>` : '<span class="mut">Todavía no hay goles registrados.</span>'}</div>
  <h2>Resultados</h2>${fechas.map((f) => `<div class="mut">Fecha ${f}</div>${ps.filter((p) => p.fecha === f).map((p) => `<div class="card part"><span>${esc(p.local)}</span><b>${p.goles_local}–${p.goles_visita}</b><span>${esc(p.visitante)}</span></div>`).join('')}`).join('') || vacio('Sin resultados todavía.')}`;
}
async function vTorneos() {
  const ts = await api.torneos();
  if (!ts.length) return vacio('No hay torneos por ahora.');
  const det = await Promise.all(ts.map((t) => api.partidosTorneo(t.id)));
  return ts.map((t, i) => {
    const ps = det[i].filter((p) => p.jugado);
    return `<div class="card"><b>${esc(t.nombre)}</b> <span class="chip">${esc(t.estado)}</span><div class="mut">${esc(t.formato)}${t.campeon ? ' · 🏆 ' + esc(t.campeon) : ''}</div>
    ${ps.slice(-6).map((p) => `<div class="part"><span>${esc(p.a_nombre)}</span><b>${p.ga}–${p.gb}</b><span>${esc(p.b_nombre)}</span></div>`).join('')}</div>`;
  }).join('');
}
async function vNoticias() {
  const ns = (await api.noticias()).filter((n) => !n.liga || n.liga === liga || n.liga === 'ambas');
  return ns.map((n) => `<div class="card">${n.imagen ? `<img class="nt" loading="lazy" src="${esc(n.imagen)}" alt="">` : ''}<b>${esc(n.titulo)}</b><div class="mut">${esc(n.categoria)} · ${new Date(n.publicada_en).toLocaleDateString('es')}</div><p>${esc(n.resumen)}</p></div>`).join('') || vacio('Sin noticias.');
}
async function vAvisos() {
  const { data: { session } } = await api.sb.auth.getSession();
  if (!session) return `<div class="card"><b>Entra con tu cuenta de Phoenix</b><div class="mut">La misma de la web. Así te llegan tus avisos.</div>
    <form id="login"><input name="email" type="email" placeholder="Correo" autocomplete="email" required><input name="password" type="password" placeholder="Contraseña" autocomplete="current-password" required><button class="btn">Entrar</button></form><div id="msg" class="mut"></div></div>`;
  const ns = await api.avisos();
  return `<button class="btn" id="perm">Activar avisos en este teléfono</button>${ns.map((n) => `<div class="card noti ${n.leida ? '' : 'nueva'}"><b>${esc(n.titulo)}</b><div>${esc(n.mensaje)}</div><div class="mut">${new Date(n.created_at).toLocaleString('es')}</div></div>`).join('') || vacio('No tienes avisos.')}<button class="chip" id="salir">Cerrar sesión</button>`;
}
const vistas = { liga: vLiga, torneos: vTorneos, noticias: vNoticias, avisos: vAvisos };

async function pintar() {
  vista.innerHTML = '<div class="card mut">Cargando…</div>';
  try { vista.innerHTML = await vistas[actual](); } catch (e) { vista.innerHTML = err(e); return; }
  $('#ed')?.addEventListener('change', (e) => { localStorage.setItem('ed_' + liga, e.target.value); pintar(); });
  $('#login')?.addEventListener('submit', async (e) => {
    e.preventDefault(); const f = new FormData(e.target);
    const { error } = await api.sb.auth.signInWithPassword({ email: f.get('email'), password: f.get('password') });
    if (error) $('#msg').textContent = 'Correo o contraseña incorrectos.'; else { suscribir(); pintar(); }
  });
  $('#salir')?.addEventListener('click', async () => { await api.sb.auth.signOut(); pintar(); });
  $('#perm')?.addEventListener('click', () => 'Notification' in window && Notification.requestPermission());
  if (actual === 'avisos') { $('#punto').hidden = true; api.marcarLeidos().catch(() => {}); }
}
$('#tabs').addEventListener('click', (e) => {
  const b = e.target.closest('button'); if (!b) return;
  actual = b.dataset.v; document.querySelectorAll('.tabs button').forEach((x) => x.classList.toggle('on', x === b)); pintar();
});
$('#btn-tema').addEventListener('click', () => {
  liga = liga === 'galaxy' ? 'sudario' : 'galaxy'; localStorage.setItem('liga', liga);
  document.documentElement.dataset.tema = liga === 'sudario' ? 'sudario' : ''; $('#btn-tema').textContent = liga === 'sudario' ? 'Sudario' : 'Galaxy'; pintar();
});

// Avisos en vivo mientras la app está abierta (push con la app cerrada = siguiente paso).
let canal;
async function suscribir() {
  const { data: { session } } = await api.sb.auth.getSession(); if (!session || canal) return;
  canal = api.sb.channel('avisos').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notificaciones', filter: `usuario_id=eq.${session.user.id}` }, (p) => {
    if (actual === 'avisos') pintar(); else $('#punto').hidden = false;
    if ('Notification' in window && Notification.permission === 'granted') new Notification(p.new.titulo, { body: p.new.mensaje, icon: './icono-192.png' });
  }).subscribe();
}
suscribir();
if ('serviceWorker' in navigator && import.meta.env.PROD) navigator.serviceWorker.register('./sw.js');
pintar();
