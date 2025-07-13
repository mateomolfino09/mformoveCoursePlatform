# 🚀 Queries para Producción - MForMove

## 📋 Resumen de Cambios

### Nuevas Funcionalidades Implementadas:
- ✅ Sistema de FAQ categorizado (20 preguntas)
- ✅ Sistema de emails centralizado con Mailchimp
- ✅ Dashboard de solicitudes de mentoría con indicadores
- ✅ Mensajes de aprobación profesionalizados
- ✅ UI components estandarizados
- ✅ Paleta de colores #234C8C aplicada

---

## 🗄️ Queries de Base de Datos

### 1. **Poblar Preguntas Frecuentes**

**Endpoint**: `POST /api/faq/populate`

**Descripción**: Crea las 20 preguntas frecuentes categorizadas

**Comando cURL**:
```bash
curl -X POST https://tu-dominio.vercel.app/api/faq/populate
```

**Resultado esperado**:
```json
{
  "success": true,
  "message": "20 preguntas frecuentes creadas exitosamente"
}
```

---

### 2. **Verificar Variables de Entorno**

**Variables necesarias en Vercel**:

```env
# MongoDB
MONGODB_URI=mongodb+srv://...

# Mailchimp Transactional
MAILCHIMP_TRANSACTIONAL_API_KEY=tu-api-key

# URLs de la aplicación
NEXT_PUBLIC_BASE_URL=https://tu-dominio.vercel.app
```

---

### 3. **Verificar Funcionalidades**

#### A. **Sistema de FAQ**
- ✅ URL: `https://tu-dominio.vercel.app/faq`
- ✅ Categorías: Membresía, Mentoría, Pagos, Técnico, General
- ✅ Filtrado por categorías
- ✅ Contadores dinámicos

#### B. **Sistema de Emails**
- ✅ Endpoint de prueba: `POST /api/test/mentorship-approval`
- ✅ Email de aprobación de mentoría
- ✅ Sistema centralizado en `/services/email/emailService.ts`

#### C. **Dashboard de Mentoría**
- ✅ URL: `https://tu-dominio.vercel.app/admin/mentorship/solicitudes`
- ✅ Indicadores de solicitudes nuevas
- ✅ Marcado como vista
- ✅ Aprobación/rechazo con emails automáticos

---

## 🔧 Pasos de Verificación Post-Deploy

### 1. **Verificar FAQ**
```bash
# Verificar que las preguntas se cargan
curl https://tu-dominio.vercel.app/api/faq/getFAQ
```

### 2. **Probar Sistema de Emails**
```bash
# Enviar email de prueba
curl -X POST https://tu-dominio.vercel.app/api/test/mentorship-approval \
  -H "Content-Type: application/json" \
  -d '{"testEmail": "tu-email@ejemplo.com"}'
```

### 3. **Verificar Dashboard**
- Ir a `/admin/mentorship/solicitudes`
- Verificar que se muestran los indicadores rojos
- Probar marcar como vista

---

## 🎯 Checklist de Producción

### ✅ Código
- [x] Commit realizado: `544d341`
- [x] Push a GitHub completado
- [x] Vercel deploy automático iniciado

### ⏳ Pendiente
- [ ] Ejecutar query de población de FAQ
- [ ] Verificar variables de entorno en Vercel
- [ ] Probar funcionalidades en producción
- [ ] Verificar emails de mentoría
- [ ] Testear dashboard de solicitudes

---

## 🚨 Notas Importantes

### **Base de Datos**
- El modelo FAQ se actualizó con campos `category` y `order`
- Se forzó la recreación del modelo para evitar caché

### **Emails**
- Sistema centralizado con Mailchimp Transactional
- Templates profesionales con paleta de colores
- Mensajes de aprobación sobrios y profesionales

### **UI/UX**
- Paleta de colores #234C8C aplicada consistentemente
- Componentes UI estandarizados
- Responsive design mejorado

---

## 📞 Soporte

Si hay algún problema durante el deploy:
1. Verificar logs en Vercel Dashboard
2. Revisar variables de entorno
3. Probar endpoints individualmente
4. Verificar conexión a MongoDB

**¡Todo listo para producción! 🎉** 