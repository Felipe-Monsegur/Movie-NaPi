# Movie NaPi

App web para compartir una **lista de películas/series por ver**, **puntuar** (1–10), **opinar** y ver un **panel** con la nota de cada persona y el **promedio**.

**Stack:** React 18, TypeScript, Vite, Tailwind CSS, Firebase (Auth + Firestore + Hosting).

**Repo:** https://github.com/Felipe-Monsegur/Movie-NaPi  
**Proyecto Firebase de referencia:** `movie-napi`  
Uso personal / privado (pareja o grupo chico).

---

## Qué hace la app

| Ruta | Pantalla | Descripción |
|------|----------|-------------|
| `/login` | Login / registro | Email y contraseña; **olvidé mi contraseña**. |
| `/not-authorized` | Sin acceso | Logueado pero fuera de `allowedUsers`. |
| `/` | Por ver | Lista compartida; añadir/quitar; enlace a puntuar. |
| `/puntuar` | Puntuar | Nota 1–10 y opinión; `?pelicula=<id>` preselecciona. |
| `/lista` | Lista | Títulos ya puntuados, con promedio y ordenamiento. |
| `/panel` | Panel | Por título: tabla por persona + promedio. |

**Extras:** tema claro/oscuro, colores de header personalizables, nombre en la lista, color de barrita, logo/PWA (Agregar a inicio en iPhone).

---

## Requisitos

- Node.js 18+ ([nodejs.org](https://nodejs.org/) LTS)
- Cuenta Google (Firebase)
- Navegador actualizado

```bash
node --version
npm --version
```

---

## Inicio rápido

```bash
npm install
copy src\config\firebase.example.ts src\config\firebase.ts
```

Pegá en `src/config/firebase.ts` la config de tu app web (Firebase Console → Configuración → Tus apps → Web).

```bash
npm run dev
```

Abrí http://localhost:5173 o ejecutá `local.bat` (Windows).

### Firebase (una vez)

1. [Firebase Console](https://console.firebase.google.com/) → proyecto (ej. **movie-napi**).
2. **Authentication** → Correo/contraseña → habilitar.
3. **Firestore** → crear base → publicar reglas de `firestore.rules`.
4. Dar de alta usuarios en **`allowedUsers`** (abajo).

Si Firestore pide un **índice compuesto** (enlace en el error), crealo desde ahí.

---

## Usuarios permitidos (`allowedUsers`)

Sin esto, tras el login verás **Acceso no autorizado**.

1. Registrate en la app (o creá el usuario en Authentication).
2. **Authentication** → Users → copiá el **UID**.
3. **Firestore** → colección `allowedUsers` → documento con **ID = UID**.

| Campo opcional | Valor |
|----------------|--------|
| `email` | email en minúsculas |
| `addedAt` | timestamp |

**Alternativa:** documento con ID automático y campo `email` en minúsculas.

La app busca por UID o email. `allowedUsers` no se escribe desde el cliente (`write: false`); se gestiona en la Console.

Para quitar acceso: eliminá el documento en `allowedUsers`.

---

## Publicar

```bash
firebase login
firebase use movie-napi
npm run build
firebase deploy --only hosting,firestore:rules
```

O `publicar.bat` (Windows).

URL típica: `https://movie-napi.web.app`

- Primera vez de Hosting: `firebase init hosting` → público `dist`, SPA rewrite a `/index.html`.
- `.firebaserc` y `firebase.ts` no se versionan; cada entorno configura el suyo.
- Hasta que no hagas **deploy**, la URL pública no cambia. Firestore no se borra al publicar.

En el celular: abrí la URL y **Agregar a inicio** si querés icono en la pantalla.

---

## Cómo funciona (datos)

### Colecciones Firestore

**`allowedUsers`** — lista blanca (ID = UID recomendado).

**`movies`** — lista compartida: `title`, `year`, `createdByUid`, `createdByEmail`, `createdByName`, `createdAt`.

**`movieRatings`** — ID `{movieId}_{userId}`: `score` (1–10), `opinion`, `userDisplayName`, `updatedAt`. Cada uno edita solo su documento.

**`userSettings`** — ID = UID: tema, colores de header, título, nombre en lista, color de barrita.

### Flujo de acceso

1. Login / registro → Firebase Auth.
2. Chequeo de `allowedUsers` (UID o email).
3. Si no → `/not-authorized`.
4. Si sí → app + reglas permiten `movies`, `movieRatings` y su `userSettings`.

### Seguridad

- Reglas en `firestore.rules` (`isUserAllowed`).
- La API key de Firebase en el cliente es normal; la protección es Auth + reglas.

---

## Scripts

| Comando / archivo | Qué hace |
|-------------------|----------|
| `npm run dev` / `local.bat` | Desarrollo local |
| `npm run build` | Build a `dist/` |
| `publicar.bat` | Build + deploy hosting y reglas |

---

## Problemas frecuentes

| Síntoma | Qué revisar |
|---------|-------------|
| Pantalla en blanco | Consola (F12); `firebase.ts` configurado |
| No autorizado con login OK | Documento en `allowedUsers` con tu UID |
| Error de permisos Firestore | Reglas publicadas; usuario en lista blanca |
| Build falla | `npm install` + salida de TypeScript |
| Project not found (CLI) | `firebase login`, `firebase use <id>` |
| 404 al recargar una ruta | Rewrite `**` → `/index.html` en `firebase.json` |

---

`firebase.ts` y `.firebaserc` están en `.gitignore`. Plantilla: `src/config/firebase.example.ts`.
