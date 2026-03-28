# Publicar Movie NaPi (Firebase Hosting)

Cómo subir la app a internet para usarla desde el celular u otra PC. Los datos siguen en **Firestore** del mismo proyecto Firebase.

---

## 1. Firebase CLI e inicio de sesión

Instalación (si no la tenés): [Firebase CLI](https://firebase.google.com/docs/cli).

```bash
firebase login
```

Usá la misma cuenta de Google del proyecto (ej. **movie-napi**).

Asociá la carpeta del proyecto al proyecto Firebase:

```bash
firebase use movie-napi
```

Si no existe `.firebaserc`, podés crearlo con `firebase init` (solo hosting) o con:

```json
{
  "projects": {
    "default": "movie-napi"
  }
}
```

(Ajustá `movie-napi` si tu `projectId` es otro.)

---

## 2. Primera vez: Hosting

Si nunca configuraste Hosting en este repo:

```bash
firebase init hosting
```

- Directorio público: **`dist`**
- SPA: **Yes** (rewrite a `/index.html`)
- GitHub Actions: **No**
- Si pregunta por sobrescribir `index.html` en `dist`: **No** (generás `dist` con el build)

`firebase.json` del repo ya incluye hosting y `firestore.rules`.

---

## 3. Build

```bash
npm run build
```

Genera la carpeta **`dist`** lista para producción.

---

## 4. Deploy

**Hosting + reglas de Firestore** (recomendado para no olvidar las reglas):

```bash
firebase deploy --only hosting,firestore:rules
```

Solo hosting:

```bash
firebase deploy --only hosting
```

Al terminar verás una URL tipo:

`https://movie-napi.web.app` o `https://movie-napi.firebaseapp.com`

---

## 5. Script en Windows

**`publicar.bat`** hace `npm run build` y luego `firebase deploy --only hosting,firestore:rules`.

---

## 6. Actualizar después de cambiar código

1. `npm run build`
2. `firebase deploy --only hosting,firestore:rules`

Hasta que no hagas **deploy**, la URL pública sigue con la versión anterior. Los datos en Firestore no se borran al publicar.

---

## 7. Quién puede entrar

- La **URL** es pública: cualquiera puede abrir la página.
- Hace falta **cuenta** (email/contraseña) y estar en **`allowedUsers`** para usar la app y tocar datos.
- Las **reglas** de Firestore limitan lectura/escritura a usuarios permitidos.

La lista de películas y las valoraciones son **compartidas** entre quienes estén en la lista blanca (pensado para uso en pareja o grupo pequeño).

---

## 8. Problemas

| Error | Acción |
|-------|--------|
| Firebase project not found | `firebase login`, `firebase projects:list`, `firebase use <id>` |
| Build failed | `npm install`, revisar salida de `npm run build` |
| 404 al recargar una ruta | Comprobar en `firebase.json` el rewrite `**` → `/index.html` |

---

## 9. Celular

Abrí la URL de Hosting en el navegador. Podés **Agregar a inicio** para un acceso directo. Misma URL para todas las personas autorizadas.
