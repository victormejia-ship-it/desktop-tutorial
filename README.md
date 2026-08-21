# Control de Forpass (copia propia)

Tablero para administrar kioskos Forpass instalados: por cliente, por sitio,
con su mensualidad, vigencia y estatus de pago. Además de pólizas de
mantenimiento preventivo como segundo módulo.

Es una sola página (`index.html`), sin servidor: las fuentes, el logo y el
generador de Excel van embebidos en el archivo. Se conecta a **tu propio**
proyecto de Firebase (no al de Forguard) para guardarlo en la nube con
cuentas y permisos.

Esta copia agrega, sobre la base original:

- **Admin → Segmentos y parámetros**: dar de alta segmentos (zonas sugeridas)
  y campos personalizados de clientes/sitios sin tocar código — ver el
  detalle al final de [docs/CONECTAR-SERVIDOR.md](docs/CONECTAR-SERVIDOR.md).
- **Módulo Cotizaciones**: cotizar un trabajo de mantenimiento (correctivo,
  preventivo, revisión…) sobre un sitio ya dado de alta, con dos caras del
  mismo documento — el **costo interno** (para saber qué cargarle al sitio o
  al cliente) y la **cotización cliente** (costo + margen, con instalación /
  mano de obra opcional) — más un documento imprimible para cada lado. El
  margen y la fórmula de instalación son editables por cotización, no un
  valor fijo de la app.

## Cómo se usa

1. **Agregar cliente** en la portada.
2. Entrar al cliente y **Agregar sitio** (por ejemplo `MXCD13`) con:
   - Forpass instalados (módulos) y estado del sitio.
   - Si se fue como *Software + Hardware* o *Solo Software*.
   - Mensualidad del sitio, y si incluyó **onboarding** y/o **viáticos**.
   - Fecha de inicio y número de mensualidades (la vigencia se calcula sola).
3. Marcar las mensualidades pagadas con las casillas numeradas de cada sitio,
   o con el botón **Marcar pagada**.

La portada muestra Forpass activos, mensualidad total, sitios atrasados,
mensualidades por vencer en 7 días y vigencias que terminan en 45 días.

## Dónde se guarda la información

Funciona de dos maneras según si `CONFIG_NUBE` (arriba de `index.html`) está
lleno o vacío:

**Modo local** (por defecto en esta copia) — en el navegador de la
computadora que la captura. Para moverla: **Respaldo JSON** descarga todo y
**Restaurar** lo abre en otra máquina.

**Modo servidor** — con tu propio Firebase configurado: pide correo y
contraseña, guarda en el servidor, todos ven lo mismo, hay cuatro permisos
(Owner, Admin, Analyst, Viewer) y queda historial de quién cambió qué. Los
pasos están en [docs/CONECTAR-SERVIDOR.md](docs/CONECTAR-SERVIDOR.md) y las
reglas de seguridad en [config/firestore.rules](config/firestore.rules).

En los dos modos, **Descargar Excel** genera un `.xlsx` con el formato de
*Control de Kioskos Forpass*, con las columnas calculadas como fórmulas vivas.

## Publicar

Está pensado para GitHub Pages sobre la rama `main`, carpeta raíz.

```bash
git add -A && git commit -m "Actualiza el control de Forpass" && git push
```
