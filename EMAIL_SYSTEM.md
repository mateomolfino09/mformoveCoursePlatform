# Sistema de Emails MForMove

## Descripción
Sistema centralizado de emails para MForMove que utiliza Mailchimp Transactional y una paleta de colores estandarizada.

## Paleta de Colores
Todos los emails utilizan la paleta de colores definida en `src/constants/colors.ts`:
- **Azul principal**: `#234C8C`
- **Azul claro**: `#3A5A9E` 
- **Azul oscuro**: `#1A3A6B`
- **Texto principal**: `#111827`
- **Texto secundario**: `#6B7280`
- **Texto terciario**: `#9CA3AF`
- **Fondo principal**: `#FFFFFF`
- **Fondo secundario**: `#F9FAFB`
- **Fondo terciario**: `#F3F4F6`

## Tipos de Email Disponibles

### 1. Mentoría

#### `MENTORSHIP_REQUEST_NOTIFICATION`
**Propósito**: Notificar al admin sobre una nueva solicitud de mentoría
**Método**: `sendMentorshipRequestNotification(data, adminEmail)`

**Datos requeridos**:
```typescript
{
  nombre: string,
  email: string,
  paisCiudad: string,
  whatsapp: string,
  interesadoEn: string[],
  dondeEntrena: string,
  nivelActual: string,
  principalFreno: string,
  presupuesto: string,
  porQueElegirme: string,
  comentarios?: string,
  adminUrl?: string
}
```

#### `MENTORSHIP_APPROVAL`
**Propósito**: Notificar al usuario que su solicitud de mentoría fue aprobada
**Método**: `sendMentorshipApproval(data)`

**Datos requeridos**:
```typescript
{
  nombre: string,
  email: string,
  calendlyLink?: string
}
```

#### `WELCOME_MENTORSHIP`
**Propósito**: Email de bienvenida específico para usuarios de mentoría
**Método**: `sendWelcomeMentorship(data)`

**Datos requeridos**:
```typescript
{
  name: string,
  email: string,
  calendlyLink?: string
}
```

### 2. Membresía

#### `WELCOME_MEMBERSHIP`
**Propósito**: Email de bienvenida para nuevos miembros
**Método**: `sendWelcomeMembership(data)`

**Datos requeridos**:
```typescript
{
  name: string,
  email: string,
  dashboardUrl?: string
}
```

#### `SUBSCRIPTION_UPDATE`
**Propósito**: Notificar cambios en la suscripción
**Método**: `sendEmail()` con tipo `SUBSCRIPTION_UPDATE`

**Datos requeridos**:
```typescript
{
  title: string,
  message: string,
  buttonText: string,
  buttonLink: string
}
```

#### `SUBSCRIPTION_CANCELLED`
**Propósito**: Notificar cancelación de suscripción
**Método**: `sendSubscriptionCancelled(data)`

**Datos requeridos**:
```typescript
{
  name: string,
  email: string,
  planName: string,
  cancellationDate: string,
  accessUntil: string,
  reactivateUrl?: string
}
```

### 3. Pagos

#### `PAYMENT_SUCCESS`
**Propósito**: Confirmar pago exitoso
**Método**: `sendPaymentSuccess(data)`

**Datos requeridos**:
```typescript
{
  name: string,
  email: string,
  productName: string,
  amount: number,
  paymentDate: string,
  transactionId: string,
  accessUrl?: string
}
```

#### `PAYMENT_FAILED`
**Propósito**: Notificar pago fallido
**Método**: `sendPaymentFailed(data)`

**Datos requeridos**:
```typescript
{
  name: string,
  email: string,
  productName: string,
  amount: number,
  paymentDate: string,
  errorMessage: string,
  retryUrl?: string
}
```

### 4. Autenticación

#### `PASSWORD_RESET`
**Propósito**: Enviar enlace para restablecer contraseña
**Método**: `sendPasswordReset(data)`

**Datos requeridos**:
```typescript
{
  email: string,
  resetLink: string
}
```

### 5. Contenido

#### `NEW_CLASS_NOTIFICATION`
**Propósito**: Notificar nueva clase disponible
**Método**: `sendNewClassNotification(data, users)`

**Datos requeridos**:
```typescript
{
  className: string,
  classDescription: string,
  classUrl: string
}
```

#### `COURSE_COMPLETION`
**Propósito**: Felicitar por completar un curso
**Método**: `sendCourseCompletion(data)`

**Datos requeridos**:
```typescript
{
  name: string,
  email: string,
  courseName: string,
  completionDate: string,
  grade?: string,
  nextCourseUrl?: string
}
```

#### `REMINDER_EMAIL`
**Propósito**: Recordar contenido pendiente
**Método**: `sendReminderEmail(data)`

**Datos requeridos**:
```typescript
{
  name: string,
  email: string,
  courseName: string,
  className: string,
  duration: string,
  classUrl: string
}
```

### 6. General

#### `CONTACT_FORM`
**Propósito**: Notificar formulario de contacto
**Método**: `sendContactForm(data)`

**Datos requeridos**:
```typescript
{
  name: string,
  email: string,
  subject: string,
  message: string
}
```

#### `WELCOME_EMAIL`
**Propósito**: Email de bienvenida general
**Método**: `sendWelcomeEmail(data)`

**Datos requeridos**:
```typescript
{
  name: string,
  email: string,
  dashboardUrl?: string
}
```

## Uso Básico

### Importar el servicio
```typescript
import { emailService } from '@/services/email/emailService';
```

### Ejemplo de uso
```typescript
// Enviar email de bienvenida
await emailService.sendWelcomeEmail({
  name: 'Juan Pérez',
  email: 'juan@ejemplo.com'
});

// Enviar notificación de pago exitoso
await emailService.sendPaymentSuccess({
  name: 'Juan Pérez',
  email: 'juan@ejemplo.com',
  productName: 'Membresía Premium',
  amount: 99.99,
  paymentDate: '2025-01-15',
  transactionId: 'txn_123456789'
});
```

## Características del Sistema

### ✅ Implementado
- [x] Paleta de colores estandarizada
- [x] Fuente Montserrat en todos los emails
- [x] Templates responsivos
- [x] Botones con estilo consistente
- [x] Manejo de errores
- [x] Tipado TypeScript completo
- [x] Métodos específicos para cada tipo de email
- [x] Documentación completa

### 🎨 Diseño
- **Fuente**: Montserrat (fallback a Arial)
- **Ancho máximo**: 600px
- **Padding**: 20px
- **Border radius**: 8px
- **Sombras**: Sombra media para contenedor principal
- **Botones**: Padding 15px 30px, border-radius 8px

### 🔧 Configuración
- **From email**: noreply@mateomove.com
- **Servicio**: Mailchimp Transactional
- **API Key**: MAILCHIMP_TRANSACTIONAL_API_KEY

## Próximos Pasos
1. Integrar con endpoints de pago (Stripe)
2. Configurar emails automáticos para eventos del sistema
3. Implementar plantillas de email en diferentes idiomas
4. Agregar tracking de apertura de emails
5. Crear sistema de plantillas personalizables por el admin 