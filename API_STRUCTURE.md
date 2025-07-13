# Estructura de APIs Unificada - MForMove

## 🎯 **Visión General**

La plataforma MForMove utiliza una estructura de APIs unificada para manejar tanto **Memberships** como **Mentorships** de manera escalable y mantenible.

## 📁 **Estructura de Rutas**

```
/api/payments/
├── createPlan/          # Crear planes (membership y mentorship)
├── getPlans/            # Obtener planes (con filtro por tipo)
├── plans/[id]/          # Editar/Eliminar planes específicos
├── editPlan/            # Editar planes (legacy)
├── deletePlan/          # Eliminar planes (legacy)
├── stripe/              # Integración Stripe
├── dlocalConfig.ts      # Configuración DLocal
└── ...                  # Otras rutas de pagos
```

## 🔄 **Rutas Principales**

### 1. **Crear Plan** - `/api/payments/createPlan`
**Método:** POST

**Parámetros:**
- `planType`: `'membership'` | `'mentorship'` (default: 'membership')
- `useStripe`: `boolean` (requerido para mentorship)
- `name`: `string` (requerido)
- `description`: `string`
- `amount`: `number` (precio)
- `currency`: `string` (default: 'USD')

**Parámetros específicos para mentorship:**
- `interval`: `'trimestral'` | `'anual'`
- `level`: `'explorer'` | `'practitioner'` | `'student'`
- `features`: `string[]`
- `stripePriceId`: `string` (requerido)
- `active`: `boolean`

**Ejemplo:**
```javascript
// Crear plan de membership
fetch('/api/payments/createPlan', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Plan Básico',
    description: 'Plan básico de membresía',
    amount: 29.99,
    useStripe: true,
    planType: 'membership'
  })
});

// Crear plan de mentorship
fetch('/api/payments/createPlan', {
  method: 'POST',
  body: JSON.stringify({
    name: 'Mentoría Explorer',
    description: 'Plan de mentoría para exploradores',
    amount: 99.99,
    useStripe: true,
    planType: 'mentorship',
    interval: 'trimestral',
    level: 'explorer',
    features: ['Sesión inicial', '2 sesiones por mes'],
    stripePriceId: 'price_123456789'
  })
});
```

### 2. **Obtener Planes** - `/api/payments/getPlans`
**Método:** GET

**Query Parameters:**
- `type`: `'membership'` | `'mentorship'` (default: 'membership')

**Ejemplo:**
```javascript
// Obtener planes de membership
fetch('/api/payments/getPlans');

// Obtener planes de mentorship
fetch('/api/payments/getPlans?type=mentorship');
```

### 3. **Editar/Eliminar Plan** - `/api/payments/plans/[id]`
**Métodos:** PUT, DELETE

**Query Parameters:**
- `type`: `'membership'` | `'mentorship'` (default: 'membership')

**Ejemplo:**
```javascript
// Editar plan de mentorship
fetch(`/api/payments/plans/${planId}?type=mentorship`, {
  method: 'PUT',
  body: JSON.stringify(updatedData)
});

// Eliminar plan de mentorship
fetch(`/api/payments/plans/${planId}?type=mentorship`, {
  method: 'DELETE'
});
```

## 🗄️ **Modelos de Datos**

### **Plan (Membership)**
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  currency: String,
  amount: Number,
  amountAnual: Number,
  frequency_type: String,
  active: Boolean,
  stripePriceId: String,
  createdAt: Date,
  updatedAt: Date
}
```

### **MentorshipPlan**
```javascript
{
  _id: ObjectId,
  name: String,
  price: Number,
  currency: String,
  interval: String,
  description: String,
  features: [String],
  level: String,
  stripePriceId: String,
  active: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🎨 **Ventajas de la Estructura Unificada**

### ✅ **Escalabilidad**
- Una sola ruta maneja múltiples tipos de planes
- Fácil agregar nuevos tipos de planes en el futuro
- Código reutilizable y mantenible

### ✅ **Consistencia**
- Misma estructura de respuesta para todos los endpoints
- Manejo de errores unificado
- Validaciones consistentes

### ✅ **Mantenibilidad**
- Menos código duplicado
- Cambios centralizados
- Testing más fácil

### ✅ **Performance**
- Menos rutas que mantener
- Caché compartido cuando sea apropiado
- Optimizaciones centralizadas

## 🔧 **Migración**

### **Antes (Rutas Separadas):**
```javascript
// Membership
fetch('/api/payments/createPlan', {...})
fetch('/api/payments/getPlans', {...})

// Mentorship
fetch('/api/mentorship/plans', {...})
fetch('/api/mentorship/plans/[id]', {...})
```

### **Después (Rutas Unificadas):**
```javascript
// Membership
fetch('/api/payments/createPlan', { planType: 'membership', ... })
fetch('/api/payments/getPlans?type=membership')

// Mentorship
fetch('/api/payments/createPlan', { planType: 'mentorship', ... })
fetch('/api/payments/getPlans?type=mentorship')
```

## 🚀 **Próximos Pasos**

1. **Migrar componentes frontend** para usar las nuevas rutas
2. **Actualizar documentación** de la API
3. **Implementar tests** para las rutas unificadas
4. **Optimizar queries** de base de datos
5. **Agregar validaciones** específicas por tipo de plan

## 📝 **Notas Importantes**

- **Backward Compatibility**: Las rutas legacy de membership siguen funcionando
- **Type Safety**: Usar siempre el parámetro `planType` para distinguir entre tipos
- **Error Handling**: Manejar errores específicos por tipo de plan
- **Validation**: Validar campos requeridos según el tipo de plan 