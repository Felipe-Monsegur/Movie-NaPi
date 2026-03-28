# Inicio rápido — Movie NaPi

Guía para levantar la app en tu máquina y enlazarla con Firebase.

---

## Requisitos

- **Node.js 18+** — https://nodejs.org/ (versión LTS)
- Cuenta **Google** para Firebase
- Navegador actualizado

Comprobá en terminal:

```bash
node --version
npm --version
```

---

## 1. Dependencias

En la carpeta del proyecto:

```powershell
npm install
```

En Windows, si PowerShell se queja con `npm`, probá `npm.cmd install`.

---

## 2. Proyecto Firebase (Movie NaPi / movie-napi)

1. [Firebase Console](https://console.firebase.google.com/) → **Agregar proyecto** (o usá uno existente, ej. **movie-napi**).
2. **Authentication** → Comenzar → método **Correo electrónico / contraseña** → Habilitar.
3. **Firestore Database** → Crear base de datos → modo que prefieras (producción con reglas del repo).
4. **Reglas** de Firestore: copiá el contenido de **`firestore.rules`** del proyecto y **Publicar**.

### App web y `firebase.ts`

1. Configuración del proyecto (engranaje) → **Tus apps** → **Web** `</>`.
2. Registrá la app y copiá el objeto `firebaseConfig`.

En el código:

```bash
copy src\config\firebase.example.ts src\config\firebase.ts
```

Pegá la config en `src/config/firebase.ts`.

---

## 3. Lista blanca (`allowedUsers`)

Sin esto, tras el login verás **Acceso no autorizado**.

1. Registrate una vez en la app (o creá el usuario en Authentication).
2. En **Authentication** → **Users** copiá el **UID**.
3. **Firestore** → colección **`allowedUsers`** → documento nuevo con **ID = ese UID** (opcional: campo `email` en minúsculas).

Repetí para cada persona. Más detalle: [AGREGAR_USUARIOS.md](./AGREGAR_USUARIOS.md).

---

## 4. Ejecutar en local

```bash
npm run dev
```

Entrá a **http://localhost:5173** (Vite suele usar el puerto 5173).

Alternativa Windows: **`local.bat`**.

---

## 5. Índices de Firestore

Si al usar la lista de películas Firebase muestra un error con enlace para crear un **índice compuesto**, abrí el enlace y creá el índice. Con la consulta actual (`movies` ordenados por `createdAt`) a veces alcanza con el índice que sugiere la consola.

---

## 6. Publicar la web

Ver [PUBLICAR.md](./PUBLICAR.md). Resumen:

```bash
firebase login
firebase use movie-napi
npm run build
firebase deploy --only hosting,firestore:rules
```

O **`publicar.bat`**.

---

## Problemas frecuentes

| Síntoma | Qué revisar |
|--------|-------------|
| Pantalla en blanco al abrir | Consola del navegador (F12); que exista `firebase.ts` bien configurado. |
| No autorizado con login OK | Documento en `allowedUsers` con tu **UID** como ID del documento. |
| Error de permisos en Firestore | Reglas publicadas; usuario en `allowedUsers`. |
| Build falla | `npm install` y mensaje de `npm run build` / TypeScript. |

---

## Qué hace la app

- **Por ver:** lista compartida de películas.
- **Puntuar:** nota 1–10 y opinión por usuario.
- **Panel:** notas de cada uno y promedio.

Más detalle: [COMO_FUNCIONA.md](./COMO_FUNCIONA.md).
