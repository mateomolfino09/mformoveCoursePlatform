# Remediation de secretos (GitGuardian)

## Estado del código actual
- `src/app/api/payments/createManualSubscription/route.js` **no contiene secretos**.
- MongoDB URI y IDs/tokens de producción se leen de variables de entorno:
  - `MONGODB_URI_PRODUCTION`
  - `MANUAL_SUB_PROD_TEMPLATE_SUB_ID`, `MANUAL_SUB_PROD_TEMPLATE_PLAN_ID`, etc.
- Ver `.env.example` para la lista completa.

## Por qué GitGuardian sigue fallando
GitGuardian escanea **todos los commits** del PR. El commit `d1256d7` en la rama todavía contiene una versión antigua del archivo con credenciales hardcodeadas. Aunque el archivo actual esté limpio, el secreto sigue en el historial.

## Pasos obligatorios
1. **Rotar credenciales expuestas**
   - Cambiar contraseña del usuario de MongoDB de producción.
   - En Stripe: revocar/regenerar cualquier token o ID que haya estado en el código (si aplica).
2. **Configurar las variables en el entorno de despliegue** (Vercel, etc.) con los nuevos valores.

## Opcional: reescribir historial para que el PR pase
Si quieres que GitGuardian deje de marcar el PR, puedes reescribir la rama para que el commit problemático nunca introduzca el secreto.

**Atención:** Esto reescribe historia. Cualquiera que tenga la rama `feature/fase-2` tendrá que hacer `git fetch origin && git reset --hard origin/feature/fase-2` o re-clonar.

```bash
cd mformoveCoursePlatform

# 1. Ver el hash del commit anterior a d1256d7 (el padre)
git log --oneline d1256d7^..d1256d7

# 2. Iniciar rebase interactivo desde antes del commit problemático
# Sustituir <HASH_PADRE_DE_D1256D7> por el hash del commit anterior a d1256d7
git rebase -i d1256d7^

# 3. En el editor: para la línea del commit d1256d7, cambiar "pick" por "edit". Guardar y salir.

# 4. Cuando el rebase se detenga en ese commit:
# Reemplazar el archivo con la versión actual (limpia)
git checkout HEAD -- src/app/api/payments/createManualSubscription/route.js
# O si la versión limpia está en main/develop:
# git checkout origin/develop -- src/app/api/payments/createManualSubscription/route.js

git add src/app/api/payments/createManualSubscription/route.js
git commit --amend --no-edit
git rebase --continue

# 5. Si hay más commits y el rebase pide resolver conflictos, resolver y seguir con git rebase --continue.

# 6. Force push de la rama (solo si esta es tu rama de PR)
git push --force-with-lease origin feature/fase-2
```

Después de esto, el PR ya no tendrá ningún commit con el archivo que contenía secretos y GitGuardian debería pasar (tras rotar las credenciales como en los pasos obligatorios).
