# Phoenix Galaxy (app móvil)

PWA instalable (Vite + JS vanilla + Supabase) que usa la misma base que la web de Phoenix Evolution Series.
Muestra: tabla, resultados y goleadores de la liga (Galaxy / Sudario), torneos, noticias y avisos de la cuenta.

**Por qué PWA y no Expo:** reutiliza el stack y el código de la web, se abre con un enlace (sin tiendas ni APK), se instala en la pantalla de inicio y se actualiza sola. Si luego se quieren push con la app cerrada o tiendas, se envuelve con Capacitor sin reescribir.

## Usar
`npm install` · `npm run dev` · `npm test` · `npm run build`
Variables opcionales: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (por defecto, el proyecto de la web; la clave publishable es pública).

## Datos (solo lectura pública por RLS)
`liga_ediciones`, `liga_partidos` (estado confirmado), `partido_goles`, `torneos_libres(+_partidos)`, `noticias`; con sesión: `notificaciones` (tiempo real).

## Pendiente
Push con la app cerrada (Web Push + función en Supabase), registro de cuenta, perfil/mercado, tabla por torneo.
