# Configuración del Webhook de Stripe

## Descripción
Este documento explica cómo configurar el webhook de Stripe para recibir eventos de pago exitoso y enviar emails automáticos de confirmación.

## Endpoint del Webhook
```
POST /api/webhooks/stripe
```

## Eventos Soportados
- `checkout.session.completed` - Cuando se completa un pago exitoso
- `payment_intent.succeeded` - Cuando se procesa un pago exitoso (backup)

## Configuración en Stripe Dashboard

### 1. Crear el Webhook
1. Ve a [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Haz clic en "Add endpoint"
3. Configura:
   - **Endpoint URL**: `https://tu-dominio.com/api/webhooks/stripe`
   - **Events to send**: Selecciona:
     - `checkout.session.completed`
     - `payment_intent.succeeded`

### 2. Obtener el Webhook Secret
1. Después de crear el webhook, copia el "Signing secret"
2. Agrega la variable de entorno:
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_tu_webhook_secret_aqui
   ```

## Variables de Entorno Requeridas

```env
# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Base URL
NEXT_PUBLIC_BASE_URL=https://tu-dominio.com

# Email
MAILCHIMP_TRANSACTIONAL_API_KEY=tu_api_key_aqui
```

## Flujo de Funcionamiento

### 1. Creación de Producto/Evento
- Admin crea un evento con precios escalonados
- Se crean payment links en Stripe con:
  - URL de success específica
  - Metadatos con `productId`

### 2. Pago del Cliente
- Cliente hace clic en "Reservar mi lugar"
- Se abre payment link de Stripe
- Cliente completa el pago

### 3. Webhook Recibe Evento
- Stripe envía `checkout.session.completed`
- Webhook verifica la firma
- Extrae `productId` de los metadatos
- Busca el producto en la base de datos

### 4. Envío de Email
- Determina si es evento online o presencial
- Envía email personalizado con:
  - Detalles del evento
  - Instrucciones específicas según modalidad
  - Beneficios incluidos
  - Información de contacto

## Tipos de Email

### Eventos Online
- Link de acceso al evento
- Instrucciones de acceso (15 min antes)
- Información sobre grabación (30 días)

### Eventos Presenciales
- Ubicación y fecha
- Instrucciones de llegada (15 min antes)
- Qué traer (ropa cómoda, agua)

### Productos
- Detalles del producto
- Link para acceder
- Información de soporte

## Estructura de Datos

### Metadatos en Payment Links
```javascript
{
  productId: "64f8a1b2c3d4e5f6a7b8c9d0"
}
```

### Datos del Email de Evento
```javascript
{
  customerName: "Juan Pérez",
  eventName: "Workshop de Movimiento",
  eventDate: "viernes, 15 de diciembre de 2024",
  eventTime: "19:00",
  eventLocation: "Centro de Entrenamiento",
  eventLink: "https://zoom.us/...",
  isOnline: true,
  amount: "$100",
  benefits: ["Acceso completo", "Material de apoyo", "Certificado"],
  cupo: 50,
  sessionId: "cs_test_...",
  eventPageUrl: "https://tu-dominio.com/events/workshop-movimiento",
  supportEmail: "soporte@mateomove.com",
  accessInstructions: "El link estará disponible 15 min antes",
  recordingInfo: "Grabación disponible por 30 días"
}
```

## Testing

### 1. Usar Stripe CLI
```bash
# Instalar Stripe CLI
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# En otra terminal, simular evento
stripe trigger checkout.session.completed
```

### 2. Verificar Logs
Los logs mostrarán:
```
🔄 Procesando checkout.session.completed: cs_test_...
✅ Producto encontrado: { id: ..., nombre: ..., tipo: 'evento', online: true }
✅ Email de confirmación de evento enviado exitosamente a: cliente@email.com
```

## Troubleshooting

### Error: "No signature found"
- Verificar que `STRIPE_WEBHOOK_SECRET` esté configurado
- Verificar que el header `stripe-signature` se esté enviando

### Error: "Invalid signature"
- Verificar que el webhook secret sea correcto
- Verificar que la URL del webhook sea exacta

### Error: "Producto no encontrado"
- Verificar que el `productId` en los metadatos sea correcto
- Verificar que el producto exista en la base de datos

### Error: "Email no enviado"
- Verificar `MAILCHIMP_TRANSACTIONAL_API_KEY`
- Verificar logs de Mailchimp para errores específicos

## Seguridad

- ✅ Verificación de firma de Stripe
- ✅ Validación de datos de entrada
- ✅ Manejo de errores robusto
- ✅ Logs detallados para debugging
- ✅ No exposición de información sensible

## Monitoreo

### Logs a Revisar
- Webhook recibido
- Producto encontrado
- Email enviado exitosamente
- Errores de procesamiento

### Métricas Importantes
- Tasa de éxito de webhooks
- Tiempo de procesamiento
- Tasa de envío de emails
- Errores por tipo 