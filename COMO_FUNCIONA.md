# Cómo funciona Movie NaPi

Descripción de pantallas, datos y flujo para la app de lista de películas compartida.

---

## Idea general

- Dos o más personas con **cuenta propia** (email/contraseña).
- Una **lista común** de películas para ver.
- Cada uno **puntúa** (1–10) y escribe una **opinión** por película.
- El **panel** muestra las notas de cada uno y el **promedio**.

Solo entran quienes estén en la colección **`allowedUsers`** en Firestore.

---

## Tecnologías

- **React 18** + **TypeScript**
- **Vite** — desarrollo y build
- **Tailwind CSS** — estilos
- **React Router** — rutas
- **Firebase Authentication** — login/registro
- **Cloud Firestore** — datos

---

## Rutas

| Ruta        | Pantalla        | Descripción |
|------------|-----------------|-------------|
| `/login`   | Login / registro | Email y contraseña. |
| `/not-authorized` | Sin acceso | Usuario logueado pero fuera de `allowedUsers`. |
| `/`        | Por ver         | Lista compartida; añadir/quitar películas; enlace a puntuar. |
| `/puntuar` | Puntuar         | Elegir película, nota, opinión; guarda por usuario. Query `?pelicula=<id>` preselecciona. |
| `/panel`   | Panel           | Por película: tabla por persona + promedio. |

El **layout** común: header (título Movie NaPi / personalizado), tema claro/oscuro, perfil, cerrar sesión, navegación.

---

## Firestore — colecciones

### `allowedUsers`

Lista blanca. Documento típico:

- **ID** = UID de Authentication (recomendado), u otro ID con campo **`email`** en minúsculas.

No se escribe desde la app (reglas `write: false`); se gestiona en la Console.

### `movies`

Películas de la lista compartida. Campos usados por la app:

- `title` (string)
- `year` (número o null)
- `createdByUid`, `createdByEmail`
- `createdAt` (timestamp)

Todos los permitidos pueden leer y crear/eliminar según `firestore.rules`.

### `movieRatings`

Valoraciones por usuario. ID de documento: **`{movieId}_{userId}`**.

- `movieId`, `userId`, `userEmail`
- `score` (1–10)
- `opinion` (string)
- `updatedAt`

Cada usuario actualiza **su** documento para esa película.

### `userSettings`

Por usuario (ID = UID): tema, colores de header, título del header opcional.

---

## Flujo de acceso

1. Usuario se registra o inicia sesión → Firebase Auth.
2. La app comprueba **`allowedUsers`** (por UID o email).
3. Si no está permitido → redirección a **no autorizado**.
4. Si está permitido → entra a la app y las reglas de Firestore permiten leer/escribir `movies`, `movieRatings` y su `userSettings`.

---

## Seguridad (resumen)

- Reglas en **`firestore.rules`**: operaciones solo si el usuario está en la lista blanca (según la función `isUserAllowed` del archivo).
- Las valoraciones nuevas/actualizadas deben llevar el **`userId`** del usuario autenticado (reglas).
- La **API key** de Firebase en el cliente es normal en apps web; la protección real viene de Auth + reglas.

---

## Scripts útiles

- **`local.bat` / `local.cmd`** — `npm run dev`.
- **`publicar.bat`** — `npm run build` + deploy hosting y reglas.

---

## Repositorio

Código: https://github.com/Felipe-Monsegur/Movie-NaPi  

`src/config/firebase.ts` no se sube al repo; usá `firebase.example.ts` como plantilla.
