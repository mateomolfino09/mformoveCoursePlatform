# InfoModal Components

Conjunto de componentes reutilizables para crear modales informativos con estilo consistente.

## Componentes

### InfoModal
Modal principal con header con gradiente y área de contenido scrolleable.

**Props:**
- `isOpen: boolean` - Controla si el modal está abierto
- `onClose: () => void` - Función para cerrar el modal
- `title: string` - Título del modal
- `subtitle?: string` - Subtítulo opcional
- `children: React.ReactNode` - Contenido del modal
- `maxWidth?: string` - Ancho máximo del modal (default: "max-w-2xl")

### InfoModalSection
Sección de contenido con fondo gris y título.

**Props:**
- `title: string` - Título de la sección
- `children: React.ReactNode` - Contenido de la sección
- `className?: string` - Clases CSS adicionales

### InfoModalField
Campo de información con label y valor.

**Props:**
- `label: string` - Etiqueta del campo
- `value: string | React.ReactNode` - Valor del campo
- `className?: string` - Clases CSS adicionales
- `showBorder?: boolean` - Mostrar borde azul izquierdo (default: true)

## Ejemplo de uso

```tsx
import InfoModal from '../components/InfoModal';
import InfoModalSection from '../components/InfoModalSection';
import InfoModalField from '../components/InfoModalField';

function MyComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <InfoModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      title="Detalle del Usuario"
      subtitle="Información completa del usuario"
    >
      <InfoModalSection title="Información Personal">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoModalField 
            label="Nombre" 
            value="Juan Pérez" 
            showBorder={false}
          />
          <InfoModalField 
            label="Email" 
            value="juan@ejemplo.com" 
            showBorder={false}
          />
        </div>
      </InfoModalSection>

      <InfoModalSection title="Detalles">
        <InfoModalField 
          label="Descripción" 
          value="Usuario activo con experiencia en desarrollo web" 
        />
      </InfoModalSection>
    </InfoModal>
  );
}
```

## Características

- **Diseño consistente** con la paleta de colores del proyecto (#234C8C)
- **Responsivo** y adaptable a diferentes tamaños de pantalla
- **Scrolleable** para contenido extenso
- **Tipografía Montserrat** para consistencia visual
- **Gradientes y sombras** para un aspecto profesional
- **Fácil de usar** con props intuitivas 