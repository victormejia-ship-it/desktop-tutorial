# Conectar el tablero a un servidor

> **Actualizado 21-ago-2026**: esta copia se conecta a un proyecto de Firebase
> **propio de Victor** (`forguard-soft-services`), no al proyecto real
> compartido de Forguard — se intentó primero compartir la base de datos real,
> pero publicar reglas y editar credenciales requería que alguien más
> otorgara permisos de Google Cloud, así que se decidió tener un proyecto
> 100% propio, sin depender de nadie. `CONFIG_NUBE` en `index.html` ya tiene
> esos datos (apiKey/projectId de `forguard-soft-services`).
>
> Los pasos 1-4 de abajo (crear el proyecto, base de datos, login, copiar
> config) **ya están hechos**. Lo que sigue pendiente, y como es un proyecto
> propio, Victor puede hacerlo él mismo sin pedirle permiso a nadie:
> 1. Paso 5 — publicar las reglas de [config/firestore.rules](../config/firestore.rules)
>    (incluye los bloques de `segmentos`, `parametros`, `cotizaciones`, y
>    desde el 03-sep-2026 el **portal de clientes**: `polizas_cliente`,
>    `cotizaciones_cliente` y las restricciones de `esCliente()` en
>    `clientes`/`sitios`/`reportes`/etc. — **hay que volver a pegar el
>    archivo completo** aunque ya se hubiera publicado antes, o el
>    autorregistro de clientes y su portal no van a funcionar).
> 2. Paso 6 — crear la cuenta de Owner (la de Victor).
> 3. Agregar los dominios desde donde se abre el tablero a los **referrers
>    permitidos** de la `apiKey`, en Google Cloud → Credenciales del proyecto
>    `forguard-soft-services`:
>    - `https://forguardfacilities.com.mx/*` (dominio propio, agregado
>      03-sep-2026 — ver [DOMINIO-PROPIO.md](DOMINIO-PROPIO.md))
>    - `https://victormejia-ship-it.github.io/*` (se puede quitar más
>      adelante, cuando se confirme que el dominio propio ya funciona)
>
>    Sin esto el login rebota con *"Requests from referer … are blocked"*.

---

Hoy la información se guarda **en el navegador** de cada computadora. Siguiendo
estos pasos se guarda en un servidor: todos ven lo mismo, hay cuentas con
permisos, y queda historial de quién cambió qué.

Es gratis. No pide tarjeta. Son unos 10 minutos, **una sola vez**.

Lo único que yo no puedo hacer por ti es crear la cuenta y escribir contraseñas.
Lo demás ya está programado y esperando estos datos.

---

## Paso 1 — Crear el proyecto

1. Entra a **https://console.firebase.google.com** con tu cuenta de Google.
2. **Crear un proyecto** → nombre: el que quieras para tu copia (por ejemplo
   `Control Forpass`) → Continuar. **Tiene que ser un proyecto nuevo y propio**,
   separado de `control-de-forpass` — solo si decides levantar una instancia
   aparte más adelante.
3. Cuando pregunte por Google Analytics, **desactívalo** (no hace falta).
4. Espera a que termine y entra al proyecto.

## Paso 2 — Prender la base de datos

1. Menú de la izquierda → **Compilación → Firestore Database**.
2. **Crear base de datos**.
3. Ubicación: **nam5 (us-central)** o la que te ofrezca por defecto.
4. Elige **Iniciar en modo de producción** (cerrado). Las reglas buenas se pegan
   en el paso 5.

## Paso 3 — Prender el acceso por correo y contraseña

1. Menú → **Compilación → Authentication** → **Comenzar**.
2. Pestaña **Sign-in method** → **Correo electrónico/contraseña** → **Habilitar**
   → Guardar. *(Deja apagado «Vínculo de correo electrónico».)*

## Paso 4 — Copiar los dos datos de configuración

1. Arriba a la izquierda, el engrane ⚙ → **Configuración del proyecto**.
2. Baja hasta **Tus apps** → ícono **`</>`** (Web) → nombre `Control Forpass` →
   **Registrar app**.
3. Te va a mostrar un bloque de código. De ahí solo necesitas dos líneas:
   - `apiKey: "AIza…"`
   - `projectId: "control-forpass-xxxx"`
4. Abre `index.html` y pégalas arriba, en el bloque `CONFIG_NUBE`:

```js
const CONFIG_NUBE = {
  apiKey:    'AIza…',
  projectId: 'control-forpass-xxxx'
};
```

5. Sube el cambio:

```bash
git add -A && git commit -m "Conecta el tablero al servidor" && git push
```

> Estos dos datos **no son secretos**: van dentro de cualquier página web de
> Firebase. Quien los vea no puede entrar sin una cuenta autorizada. Lo que
> protege la información son las reglas del paso 5 y el login.

## Paso 5 — Pegar las reglas de seguridad

**Este paso no se puede saltar.** Sin él, la base de datos queda abierta.

1. **Firestore Database** → pestaña **Reglas**.
2. Borra todo lo que haya y pega el contenido completo del archivo
   [`config/firestore.rules`](../config/firestore.rules) de este repo.
3. **Publicar**.

## Paso 6 — Crear tu cuenta de Owner

Esta es la única cuenta que se crea a mano. Desde ella ya puedes crear todas las
demás desde el tablero.

1. **Authentication** → pestaña **Users** → **Agregar usuario**.
   - Correo: el tuyo (ej. `victor.mejia@platoexpress.com`).
   - Contraseña: la que tú quieras (mínimo 6 caracteres).
2. Copia el **UID** que aparece en la lista (una cadena larga, tipo
   `k3Jd8sPq...`). Lo necesitas en el siguiente punto.
3. **Firestore Database** → pestaña **Datos** → **Iniciar colección**:
   - ID de la colección: `usuarios`
   - ID del documento: **pega el UID** del punto anterior
   - Agrega estos campos, todos de tipo **string** menos `activo`:

   | Campo         | Tipo    | Valor                          |
   |---------------|---------|---------------------------------|
   | `correo`      | string  | tu correo                      |
   | `nombre`      | string  | tu nombre                      |
   | `rol`         | string  | `owner`                         |
   | `activo`      | boolean | `true`                          |
   | `creado`      | string  | la fecha de hoy, `AAAA-MM-DD`   |
   | `creadoPor`   | string  | `consola`                       |
   | `ultimoAcceso`| string  | *(déjalo vacío)*                |

4. Guardar.

## Paso 7 — Entrar

Abre la página publicada de tu copia (el link de GitHub Pages de tu propio
repo) — ahora pide correo y contraseña. Entra con la cuenta del paso 6.

- Arriba a la derecha aparece **Guardado en la nube** y el botón **Admin**.
- Si ya tenías clientes y sitios capturados en esa computadora, **se suben solos**
  al servidor en ese momento. No se pierde nada.
- En **Admin → Crear cuenta** ya puedes dar de alta al resto del equipo.

---

## Los cuatro permisos

| Permiso     | Ve | Modifica | Administra cuentas | Notas |
|-------------|----|----------|--------------------|-------|
| **Owner**   | ✅ | ✅       | ✅                 | Tu cuenta. Nadie la puede bloquear ni bajarle el permiso, y es la única que puede nombrar a otro Owner. |
| **Admin**   | ✅ | ✅       | ✅                 | Puede crear cuentas y dar permisos, menos Owner. |
| **Analyst** | ✅ | ✅       | ❌                 | Captura clientes, sitios y pagos. |
| **Viewer**  | ✅ | ❌       | ❌                 | Solo consulta y descarga el Excel. |

## Sobre las contraseñas

**No se pueden ver, ni tú ni nadie.** Firebase las guarda encriptadas de un solo
sentido; eso es justamente lo que protege las cuentas. En la práctica:

- Al crear una cuenta le pones una **contraseña temporal** y se la pasas. El
  tablero te la muestra una sola vez, con un botón para copiar los datos.
- Si alguien la olvida: **Admin → Mandar correo para cambiarla**, o el enlace de
  «¿Olvidaste tu contraseña?» en la pantalla de entrada.
- Para quitarle el acceso a alguien: **Bloquear**. Es inmediato y la cuenta no se
  borra, la puedes reactivar después.

## Qué pasa si se cae el internet

Los cambios se guardan primero en la computadora y se apuntan en una cola. La
pastilla de arriba dice **Sin conexión · N por guardar**, y en cuanto vuelve la
señal se suben solos. No cierres sesión con cambios pendientes: el tablero te
avisa si lo intentas.

## Respaldos

- Firebase guarda la información en la infraestructura de Google.
- El botón **Respaldo JSON** sigue ahí para tener una copia propia.
- El **Excel** sirve como respaldo legible y para reportar.

## Segmentos y parámetros (nuevo en esta copia)

Al final del panel de **Admin** hay tres bloques que no existen en el
`control-forpass` original de Forguard:

- **Segmentos** — la lista de zonas que se sugieren al capturar un sitio
  (antes era una lista fija en el código, `ZONAS`). Un Admin agrega o quita
  segmentos desde ahí; el campo sigue siendo de texto libre, así que escribir
  cualquier otra cosa también funciona.
- **Parámetros de clientes** y **Parámetros de sitios** — campos extra que un
  Admin define (etiqueta + tipo: texto, número, fecha o Sí/No) y que aparecen
  automáticamente en el formulario de «Agregar/Editar cliente» o
  «Agregar/Editar sitio». Los valores capturados se ven como chips en la
  tarjeta del cliente o del sitio.

Igual que la lista de precios, cada uno vive en **un solo documento**
(`segmentos/lista` y `parametros/lista`), así que las reglas ya vienen
incluidas en `config/firestore.rules` — no hay que agregar nada a mano, solo
pegar el archivo completo en el paso 5. Quitar un segmento o un parámetro no
borra los datos que ya se habían capturado con él, solo deja de sugerirlo o
pedirlo en formularios nuevos.
