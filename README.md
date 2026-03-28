# Movie-NaPi

App web para compartir una lista de películas por ver, puntuar (1–10), dejar opiniones y ver el panel con las notas de cada uno y el promedio.

**Stack:** React, TypeScript, Vite, Tailwind, Firebase (Auth + Firestore).

## Desarrollo local

```bash
npm install
```

Copiá la configuración de Firebase:

```bash
copy src\config\firebase.example.ts src\config\firebase.ts
```

Editá `src/config/firebase.ts` con los datos de tu proyecto (Console → Configuración del proyecto → app web).

```bash
npm run dev
```

Abre `http://localhost:5173`.

En Windows también podés usar `local.bat`.

## Firebase

1. Authentication: correo y contraseña activado.  
2. Firestore creado; publicá las reglas de `firestore.rules`.  
3. Colección **`allowedUsers`**: un documento por usuario con **ID = UID** (Authentication) o campo **`email`** en minúsculas.

## Publicar (Hosting)

Requiere [Firebase CLI](https://firebase.google.com/docs/cli) y `firebase login`. El archivo `.firebaserc` no va al repo (está en `.gitignore`); en cada máquina: `firebase use movie-napi` o creá `.firebaserc` con tu `projectId`.

```bash
npm run build
firebase deploy --only hosting,firestore:rules
```

O ejecutá `publicar.bat`.

## Licencia

Uso personal / privado.
