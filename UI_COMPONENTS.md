# Componentes UI Estandarizados

## Descripción
Sistema de componentes UI reutilizables para MForMove que utilizan la paleta de colores centralizada y siguen las mejores prácticas de diseño.

## Paleta de Colores
Todos los componentes utilizan la paleta definida en `src/constants/colors.ts`:
- **Azul principal**: `#234C8C`
- **Azul claro**: `#3A5A9E` 
- **Azul oscuro**: `#1A3A6B`
- **Texto principal**: `#111827`
- **Texto secundario**: `#6B7280`
- **Texto terciario**: `#9CA3AF`
- **Fondo principal**: `#FFFFFF`
- **Fondo secundario**: `#F9FAFB`
- **Fondo terciario**: `#F3F4F6`

## Componentes Disponibles

### 1. Button

Componente de botón con múltiples variantes, tamaños y estados.

#### Props
```typescript
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}
```

#### Ejemplos
```tsx
import { Button } from '@/components/ui';

// Variantes
<Button variant="primary">Primario</Button>
<Button variant="secondary">Secundario</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Peligro</Button>
<Button variant="success">Éxito</Button>

// Tamaños
<Button size="sm">Pequeño</Button>
<Button size="md">Mediano</Button>
<Button size="lg">Grande</Button>

// Estados
<Button disabled>Deshabilitado</Button>
<Button loading>Cargando</Button>
<Button fullWidth>Ancho Completo</Button>

// Con íconos
<Button icon={<Icon />} iconPosition="left">
  Con Ícono
</Button>
```

### 2. Input

Componente de entrada de texto con validación y estados.

#### Props
```typescript
interface InputProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  autoComplete?: string;
  autoFocus?: boolean;
  name?: string;
  id?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'error' | 'success' | 'warning';
  fullWidth?: boolean;
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  clearable?: boolean;
  onClear?: () => void;
}
```

#### Ejemplos
```tsx
import { Input } from '@/components/ui';

// Básico
<Input 
  label="Email" 
  placeholder="tu@email.com"
  type="email"
/>

// Con validación
<Input 
  label="Contraseña"
  type="password"
  error="La contraseña es requerida"
/>

// Con ícono y limpiable
<Input 
  label="Buscar"
  placeholder="Buscar..."
  icon={<SearchIcon />}
  clearable
/>

// Estados
<Input 
  label="Éxito"
  variant="success"
  helperText="Campo válido"
/>
<Input 
  label="Deshabilitado"
  disabled
/>
```

### 3. Modal

Componente modal con overlay y diferentes tamaños.

#### Props
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showOverlay?: boolean;
  className?: string;
  footer?: React.ReactNode;
  header?: React.ReactNode;
}
```

#### Ejemplos
```tsx
import { Modal, Button } from '@/components/ui';

const [isOpen, setIsOpen] = useState(false);

// Básico
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Título del Modal"
>
  <p>Contenido del modal</p>
</Modal>

// Con footer personalizado
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirmar Acción"
  footer={
    <>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancelar
      </Button>
      <Button onClick={handleConfirm}>
        Confirmar
      </Button>
    </>
  }
>
  <p>¿Estás seguro de que quieres continuar?</p>
</Modal>

// Diferentes tamaños
<Modal size="sm">Modal pequeño</Modal>
<Modal size="lg">Modal grande</Modal>
<Modal size="full">Modal pantalla completa</Modal>
```

### 4. Card

Componente de tarjeta con múltiples variantes y funcionalidades.

#### Props
```typescript
interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  image?: {
    src: string;
    alt: string;
    height?: string;
  };
  actions?: React.ReactNode;
}
```

#### Ejemplos
```tsx
import { Card, Button } from '@/components/ui';

// Básica
<Card title="Título" subtitle="Subtítulo">
  <p>Contenido de la card</p>
</Card>

// Con imagen
<Card 
  title="Card con Imagen"
  image={{
    src: '/image.jpg',
    alt: 'Descripción',
    height: '200px'
  }}
>
  <p>Contenido</p>
</Card>

// Con acciones
<Card 
  title="Card con Acciones"
  actions={
    <>
      <Button variant="outline" size="sm">Cancelar</Button>
      <Button size="sm">Guardar</Button>
    </>
  }
>
  <p>Contenido</p>
</Card>

// Variantes
<Card variant="elevated" hoverable>
  Card elevada con hover
</Card>
<Card variant="outlined">
  Card con borde
</Card>
<Card variant="filled">
  Card con fondo
</Card>
```

### 5. Badge

Componente de etiqueta para mostrar estados o categorías.

#### Props
```typescript
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  className?: string;
  onClick?: () => void;
  removable?: boolean;
  onRemove?: () => void;
}
```

#### Ejemplos
```tsx
import { Badge } from '@/components/ui';

// Variantes
<Badge variant="primary">Primario</Badge>
<Badge variant="success">Éxito</Badge>
<Badge variant="warning">Advertencia</Badge>
<Badge variant="error">Error</Badge>
<Badge variant="info">Info</Badge>

// Tamaños
<Badge size="sm">Pequeño</Badge>
<Badge size="md">Mediano</Badge>
<Badge size="lg">Grande</Badge>

// Interactivos
<Badge 
  variant="primary" 
  onClick={() => console.log('clicked')}
>
  Clickable
</Badge>

<Badge 
  variant="success" 
  rounded
>
  Redondeado
</Badge>

<Badge 
  variant="warning" 
  removable
  onRemove={() => console.log('removed')}
>
  Removible
</Badge>
```

## Uso Básico

### Importar componentes
```tsx
import { Button, Input, Modal, Card, Badge } from '@/components/ui';
```

### Ejemplo completo
```tsx
import React, { useState } from 'react';
import { Button, Input, Modal, Card, Badge } from '@/components/ui';

export default function MyComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  return (
    <div>
      <Card title="Mi Componente" hoverable>
        <Input
          label="Nombre"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ingresa tu nombre"
        />
        
        <div style={{ marginTop: '16px' }}>
          <Badge variant="primary">Nuevo</Badge>
          <Button onClick={() => setIsModalOpen(true)}>
            Abrir Modal
          </Button>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Confirmar"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>
              Confirmar
            </Button>
          </>
        }
      >
        <p>¿Estás seguro?</p>
      </Modal>
    </div>
  );
}
```

## Características del Sistema

### ✅ Implementado
- [x] Paleta de colores estandarizada
- [x] Fuente Montserrat en todos los componentes
- [x] Tipado TypeScript completo
- [x] Estados interactivos (hover, focus, active)
- [x] Responsive design
- [x] Accesibilidad básica
- [x] Animaciones suaves
- [x] Documentación completa

### 🎨 Diseño
- **Fuente**: Montserrat (fallback a Arial)
- **Border radius**: 6px-12px según componente
- **Sombras**: Sistema de sombras escalado
- **Transiciones**: 0.2s ease-in-out
- **Espaciado**: Sistema de padding/margin consistente

### 🔧 Configuración
- **Archivo de colores**: `src/constants/colors.ts`
- **Carpeta de componentes**: `src/components/ui/`
- **Exportación centralizada**: `src/components/ui/index.ts`

## Página de Demostración

Visita `/ui-showcase` para ver todos los componentes en acción con ejemplos interactivos.

## Próximos Pasos
1. Agregar más componentes (Select, Checkbox, Radio, etc.)
2. Implementar temas oscuro/claro
3. Agregar más animaciones y micro-interacciones
4. Mejorar accesibilidad (ARIA labels, keyboard navigation)
5. Crear sistema de iconos estandarizado 