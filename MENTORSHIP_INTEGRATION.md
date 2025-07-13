# Integración de Mentoría con Stripe

## 📋 Resumen

Se ha implementado un sistema completo de mentoría personalizada integrado con Stripe para MForMove. El sistema incluye:

- ✅ **Frontend completo** con páginas de mentoría
- ✅ **Backend con API endpoints** para gestión de planes
- ✅ **Integración con Stripe** para procesamiento de pagos
- ✅ **Sistema de webhooks** para manejo de eventos
- ✅ **Panel de administración** para gestión de planes
- ✅ **Página de éxito** post-pago

## 🏗️ Arquitectura

### Frontend
- `/mentorship` - Página principal de mentoría
- `/mentorship/success` - Página de éxito post-pago
- `/admin/mentorship/plans` - Panel de administración

### Backend
- `/api/mentorship/plans` - CRUD de planes de mentoría
- `/api/mentorship/stripe/createCheckoutSession` - Crear sesión de Stripe
- `/api/mentorship/stripe/webhook` - Webhook para eventos de Stripe

## 🚀 Configuración

### 1. Variables de Entorno

Asegúrate de tener configuradas las siguientes variables:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
MONGO_URI=mongodb://...
```

### 2. Crear Planes de Mentoría

Ejecuta el script para crear planes de ejemplo:

```bash
npm run create-mentorship-plans
```

### 3. Configurar Webhook de Stripe

En el dashboard de Stripe, configura el webhook para:
- URL: `https://tu-dominio.com/api/mentorship/stripe/webhook`
- Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

## 💳 Flujo de Pago

1. **Usuario selecciona plan** en `/mentorship`
2. **Se crea sesión de Stripe** con metadata específica
3. **Usuario completa pago** en Stripe Checkout
4. **Webhook procesa evento** y actualiza usuario
5. **Usuario es redirigido** a página de éxito

## 📊 Modelo de Datos

### MentorshipPlan
```javascript
{
  name: String,
  price: Number,
  currency: String,
  interval: String,
  description: String,
  features: [String],
  level: String,
  stripePriceId: String,
  active: Boolean
}
```

### User (campo mentorship agregado)
```javascript
{
  mentorship: {
    active: Boolean,
    planId: String,
    planName: String,
    planLevel: String,
    subscriptionId: String,
    startDate: Date,
    lastPaymentDate: Date,
    status: String
  }
}
```

## 🔧 Endpoints

### GET `/api/mentorship/plans`
Obtiene todos los planes de mentoría activos.

### POST `/api/mentorship/plans`
Crea un nuevo plan de mentoría (solo admin).

### PUT `/api/mentorship/plans`
Actualiza un plan existente (solo admin).

### DELETE `/api/mentorship/plans`
Elimina un plan (solo admin).

### POST `/api/mentorship/stripe/createCheckoutSession`
Crea una sesión de checkout de Stripe para mentoría.

### GET `/api/mentorship/plans/[id]`
Obtiene detalles de un plan específico.

## 🎨 Componentes

### MentorshipPlans
Componente principal que muestra los planes disponibles y maneja la selección.

### MentorshipSuccess
Página de éxito que se muestra después del pago exitoso.

### AdminMentorshipPlansPage
Panel de administración para gestionar planes.

## 🔒 Seguridad

- ✅ **Autenticación requerida** para acceder a mentoría
- ✅ **Verificación de rol admin** para panel de administración
- ✅ **Validación de webhooks** con firma de Stripe
- ✅ **Filtrado de planes activos** en frontend

## 📈 Analytics

El sistema incluye tracking de:
- Visualización de planes
- Clicks en planes
- Profundidad de scroll
- Conversiones

## 🐛 Troubleshooting

### Error: "Plan de mentoría no encontrado"
- Verificar que el plan existe en la base de datos
- Confirmar que el `stripePriceId` es válido

### Error: "Usuario no encontrado"
- Verificar que el usuario está autenticado
- Confirmar que el email existe en la base de datos

### Webhook no funciona
- Verificar la URL del webhook en Stripe
- Confirmar que el `STRIPE_WEBHOOK_SECRET` es correcto
- Revisar logs del servidor para errores

## 🔄 Próximos Pasos

1. **Configurar precios reales** en Stripe
2. **Implementar emails** de bienvenida
3. **Agregar dashboard** de mentoría para usuarios
4. **Integrar con sistema** de notificaciones
5. **Implementar cancelación** de suscripciones

## 📞 Soporte

Para problemas técnicos, contactar al equipo de desarrollo. 