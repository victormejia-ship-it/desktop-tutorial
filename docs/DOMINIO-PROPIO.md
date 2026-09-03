# Poner el tablero en forguardfacilities.com.mx

> **03-sep-2026**: Victor compró el dominio `forguardfacilities.com.mx`. Ya
> quedó todo listo del lado del código (el archivo `CNAME` de este repo, que
> es lo que le dice a GitHub Pages qué dominio propio usar). Lo que sigue son
> 3 pasos afuera del código, en 3 paneles distintos, que solo Victor puede
> hacer porque requieren entrar con sus cuentas — igual que pasó con las
> reglas de Firestore y con crear la cuenta de Owner.

Son unos 15-20 minutos de trabajo + tiempo de espera de DNS (de unos minutos
hasta 24-48 horas, casi siempre es rápido).

---

## Paso 1 — Apuntar el dominio a GitHub (en el panel del dominio)

Entra al panel donde compraste `forguardfacilities.com.mx` (registrador:
Namecheap, GoDaddy, Akky/NIC México, Cloudflare, etc. — busca la sección
**DNS** o **Administrar DNS**) y agrega estos registros. Si ya hay registros
`A` o `CNAME` puestos por el registrador para el dominio raíz (`@`), bórralos
primero — no puede haber dos apuntando al mismo nombre.

| Tipo | Nombre / Host | Valor / Apunta a           |
|------|---------------|-----------------------------|
| A    | `@`           | `185.199.108.153`            |
| A    | `@`           | `185.199.109.153`            |
| A    | `@`           | `185.199.110.153`            |
| A    | `@`           | `185.199.111.153`            |
| CNAME| `www`         | `victormejia-ship-it.github.io` |

Las 4 líneas `A` son las IPs fijas de GitHub Pages — van igual para cualquier
sitio de GitHub Pages con dominio propio, no son específicas de este
proyecto. El `CNAME` de `www` es opcional, pero recomendable: hace que si
alguien escribe `www.forguardfacilities.com.mx` también llegue al tablero
(GitHub lo redirige solo al dominio principal).

> Si tu panel no acepta 4 registros `A` con el mismo nombre `@`, agrégalos
> uno por uno con "Agregar otro registro" — es normal tener varios `A` con
> el mismo nombre.

## Paso 2 — Confirmarlo en GitHub y activar el candado (HTTPS)

1. Entra al repo → **Settings → Pages**.
2. En **Custom domain** debería aparecer ya `forguardfacilities.com.mx`
   (viene del archivo `CNAME` que ya está en el repo). Si no aparece,
   escríbelo ahí y dale **Save**.
3. Espera a que GitHub diga que el DNS quedó bien (un ✅ verde junto al
   dominio). Puede tardar desde minutos hasta un día mientras el cambio del
   Paso 1 se propaga por internet.
4. En cuanto aparezca el ✅, activa la casilla **Enforce HTTPS**. Con esto
   `https://forguardfacilities.com.mx` ya trae candado — es el certificado
   gratis que explicamos antes, GitHub lo emite solo.

Mientras tanto, el link viejo (`victormejia-ship-it.github.io/desktop-tutorial`)
sigue funcionando exactamente igual — no hay que avisarle a nadie de golpe,
se puede ir pasando la gente al dominio nuevo con calma.

## Paso 3 — Avisarle a Firebase del dominio nuevo

Esto es el paso que **si se salta, rompe el login** con el error *"Requests
from referer … are blocked"* en cuanto alguien entre desde el dominio nuevo.
Son dos lugares distintos dentro de Google/Firebase:

### 3a. Permitir el dominio en la `apiKey` (Google Cloud Console)

1. Entra a **https://console.cloud.google.com/apis/credentials**, con la
   cuenta de Google del proyecto `forguard-soft-services` (selecciónalo
   arriba si no es el proyecto activo).
2. En la lista de **Claves de API**, entra a la que usa este tablero (la
   misma `apiKey` que está en `CONFIG_NUBE` dentro de `index.html`).
3. En **Restricciones de sitios web (HTTP referrers)**, agrega estas dos
   líneas (sin borrar la que ya había, hasta confirmar que todo funciona):
   - `https://forguardfacilities.com.mx/*`
   - `https://www.forguardfacilities.com.mx/*`
4. **Guardar**. El cambio queda activo casi al instante.

### 3b. Autorizar el dominio en Firebase Authentication

1. **https://console.firebase.google.com** → proyecto `forguard-soft-services`
   → **Authentication → Settings (Configuración) → Authorized domains
   (Dominios autorizados)**.
2. **Add domain** → escribe `forguardfacilities.com.mx` → Agregar.
3. Repite con `www.forguardfacilities.com.mx` si vas a usar el `www`.

No usamos hoy ningún inicio de sesión que dependa estrictamente de esta
lista (es más para métodos con redirección/enlaces de correo), pero
mantenerla al día evita sorpresas si más adelante se agrega, por ejemplo,
"Iniciar sesión con Google".

---

## Cómo saber que ya quedó

1. Abre `https://forguardfacilities.com.mx` en el navegador — debe cargar el
   tablero, con candado.
2. Entra con tu cuenta normal. Si ves el error de *"referer are blocked"*,
   es que el Paso 3a todavía no se guardó o no ha hecho efecto — espera un
   par de minutos y reintenta.
3. Ábrelo también desde el celular, con datos móviles, para confirmar que no
   es solo tu computadora/red.

Una vez que todo el equipo esté usando `forguardfacilities.com.mx` sin
problema, se puede (opcional, no urgente):
- Quitar `https://victormejia-ship-it.github.io/*` de los referrers
  permitidos del Paso 3a.
- Actualizar cualquier acceso directo o favorito guardado al link viejo.
