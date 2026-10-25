import { createClient } from '@supabase/supabase-js';
// Misma base que la web. La clave publishable es PÚBLICA por diseño; la seguridad la dan las políticas RLS.
const URL = import.meta.env.VITE_SUPABASE_URL || 'https://fiibiyijojkxqlsrhcil.supabase.co';
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_siVYbqB8ehtJAkk_tjy2OQ_CuXWX24u';
export const sb = createClient(URL, KEY, { auth: { persistSession: true, autoRefreshToken: true } });

const ok = ({ data, error }) => { if (error) throw error; return data ?? []; };
export const ediciones = () => sb.from('liga_ediciones').select('*').order('creado', { ascending: false }).then(ok);
export const partidosLiga = (ed) => sb.from('liga_partidos').select('*').eq('edicion_id', ed).eq('estado', 'confirmado').order('fecha').order('id').then(ok);
export const golesLiga = (liga, edicion) => sb.from('partido_goles').select('*').eq('liga', liga).eq('edicion', edicion).then(ok);
export const torneos = () => sb.from('torneos_libres').select('id,nombre,formato,estado,campeon,cupo,inicia').order('id', { ascending: false }).then(ok);
export const partidosTorneo = (id) => sb.from('torneos_libres_partidos').select('*').eq('torneo_id', id).order('orden').then(ok);
export const noticias = () => sb.from('noticias').select('id,titulo,resumen,categoria,imagen,publicada_en,liga').eq('publicada', true).order('publicada_en', { ascending: false }).limit(30).then(ok);
export const avisos = () => sb.from('notificaciones').select('*').order('created_at', { ascending: false }).limit(50).then(ok);
export const marcarLeidos = () => sb.from('notificaciones').update({ leida: true }).eq('leida', false).then(ok);
