# Agregar usuarios permitidos — Movie NaPi

Movie NaPi usa una **lista blanca** en Firestore: solo quien figure en **`allowedUsers`** puede usar la app después de iniciar sesión. Si no, verás **Acceso no autorizado**.

---

## Desde Firebase Console

### 1. Firestore

1. [Firebase Console](https://console.firebase.google.com/) → tu proyecto (ej. **movie-napi**).
2. **Firestore Database** → **Datos**.

### 2. Colección `allowedUsers`

- Si no existe: **Iniciar colección** → ID: **`allowedUsers`**.
- **Agregar documento**.

### 3. ID del documento (recomendado)

Usá el **UID** del usuario:

1. **Authentication** → pestaña **Users**.
2. Elegí el usuario → copiá **User UID**.
3. En Firestore, **ID del documento** = pegá ese UID (sin espacios).

Campos opcionales útiles:

| Campo     | Tipo      | Valor                          |
|-----------|-----------|--------------------------------|
| `email`   | string    | email en **minúsculas**        |
| `addedAt` | timestamp | fecha (o lo agregás después)   |

### 4. Alternativa: solo email

- **ID del documento:** automático.
- Campo **`email`**: string en **minúsculas**, igual que en Authentication.

La app busca por UID o por email según cómo estén tus reglas y el código.

---

## Orden recomendado

1. Dar de alta **tu usuario** en `allowedUsers` (por UID).
2. Publicar **reglas** (`firestore.rules`).
3. Probar login en la app.
4. Repetir para **tu pareja** u otros (cada uno con su UID o email).

---

## Quitar acceso

Firestore → `allowedUsers` → abrí el documento → **Eliminar**.

---

## Notas

- Los usuarios pueden **registrarse** solos en la pantalla de login; igual necesitan un documento en `allowedUsers` para entrar.
- Los datos de películas y puntuaciones son **compartidos** entre todos los permitidos.
- Las reglas de escritura en `allowedUsers` suelen estar en **solo consola** (`write: false` desde el cliente), por eso se gestiona desde la Console.
