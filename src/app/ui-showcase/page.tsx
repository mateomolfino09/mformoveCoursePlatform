'use client';

import React, { useState } from 'react';
import { colors } from '../../constants/colors';
import { Button, Input, Modal, Card, Badge } from '../../components/ui';

export default function UIShowcase() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);

  const handleBadgeToggle = (badge: string) => {
    setSelectedBadges(prev => 
      prev.includes(badge) 
        ? prev.filter(b => b !== badge)
        : [...prev, badge]
    );
  };

  return (
    <div style={{
      fontFamily: 'Montserrat, Arial, sans-serif',
      backgroundColor: colors.background.secondary,
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: colors.background.primary,
        padding: '30px',
        borderRadius: '12px',
        boxShadow: colors.shadow.lg
      }}>
        <h1 style={{
          color: colors.primary.blue,
          textAlign: 'center',
          fontSize: '32px',
          marginBottom: '40px'
        }}>
          Componentes UI Estandarizados
        </h1>

        {/* Botones */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{
            color: colors.text.primary,
            fontSize: '24px',
            marginBottom: '20px',
            borderBottom: `2px solid ${colors.border.light}`,
            paddingBottom: '10px'
          }}>
            Botones
          </h2>
          
          <div style={{ display: 'grid', gap: '20px' }}>
            {/* Variantes */}
            <div>
              <h3 style={{ color: colors.text.secondary, marginBottom: '12px' }}>Variantes</h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Button variant="primary">Primario</Button>
                <Button variant="secondary">Secundario</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Peligro</Button>
                <Button variant="success">Éxito</Button>
              </div>
            </div>

            {/* Tamaños */}
            <div>
              <h3 style={{ color: colors.text.secondary, marginBottom: '12px' }}>Tamaños</h3>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Button size="sm">Pequeño</Button>
                <Button size="md">Mediano</Button>
                <Button size="lg">Grande</Button>
              </div>
            </div>

            {/* Estados */}
            <div>
              <h3 style={{ color: colors.text.secondary, marginBottom: '12px' }}>Estados</h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Button>Normal</Button>
                <Button disabled>Deshabilitado</Button>
                <Button loading>Cargando</Button>
                <Button fullWidth>Ancho Completo</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Inputs */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{
            color: colors.text.primary,
            fontSize: '24px',
            marginBottom: '20px',
            borderBottom: `2px solid ${colors.border.light}`,
            paddingBottom: '10px'
          }}>
            Inputs
          </h2>
          
          <div style={{ display: 'grid', gap: '20px' }}>
            {/* Tipos básicos */}
            <div>
              <h3 style={{ color: colors.text.secondary, marginBottom: '12px' }}>Tipos Básicos</h3>
              <div style={{ display: 'grid', gap: '16px', maxWidth: '400px' }}>
                <Input 
                  label="Texto" 
                  placeholder="Escribe algo..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <Input 
                  type="email" 
                  label="Email" 
                  placeholder="tu@email.com"
                  helperText="Ingresa tu dirección de email"
                />
                <Input 
                  type="password" 
                  label="Contraseña" 
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Estados */}
            <div>
              <h3 style={{ color: colors.text.secondary, marginBottom: '12px' }}>Estados</h3>
              <div style={{ display: 'grid', gap: '16px', maxWidth: '400px' }}>
                <Input 
                  label="Normal" 
                  placeholder="Input normal"
                />
                <Input 
                  label="Con error" 
                  placeholder="Input con error"
                  error="Este campo es requerido"
                />
                <Input 
                  label="Éxito" 
                  placeholder="Input exitoso"
                  variant="success"
                />
                <Input 
                  label="Deshabilitado" 
                  placeholder="Input deshabilitado"
                  disabled
                />
                <Input 
                  label="Con ícono" 
                  placeholder="Buscar..."
                  clearable
                />
              </div>
            </div>
          </div>
        </section>

        {/* Cards */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{
            color: colors.text.primary,
            fontSize: '24px',
            marginBottom: '20px',
            borderBottom: `2px solid ${colors.border.light}`,
            paddingBottom: '10px'
          }}>
            Cards
          </h2>
          
          <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            <Card 
              title="Card Básica"
              subtitle="Una card simple con título y contenido"
            >
              <p style={{ color: colors.text.secondary, margin: 0 }}>
                Este es el contenido de la card. Puede contener cualquier elemento.
              </p>
            </Card>

            <Card 
              title="Card Elevada"
              variant="elevated"
              hoverable
            >
              <p style={{ color: colors.text.secondary, margin: 0 }}>
                Esta card tiene elevación y efecto hover.
              </p>
            </Card>

            <Card 
              title="Card con Acciones"
              actions={
                <>
                  <Button variant="outline" size="sm">Cancelar</Button>
                  <Button size="sm">Guardar</Button>
                </>
              }
            >
              <p style={{ color: colors.text.secondary, margin: 0 }}>
                Card con botones de acción en el footer.
              </p>
            </Card>

            <Card 
              title="Card con Imagen"
              image={{
                src: 'https://via.placeholder.com/300x200/234C8C/FFFFFF?text=Imagen',
                alt: 'Imagen de ejemplo'
              }}
            >
              <p style={{ color: colors.text.secondary, margin: 0 }}>
                Card con imagen en la parte superior.
              </p>
            </Card>
          </div>
        </section>

        {/* Badges */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{
            color: colors.text.primary,
            fontSize: '24px',
            marginBottom: '20px',
            borderBottom: `2px solid ${colors.border.light}`,
            paddingBottom: '10px'
          }}>
            Badges
          </h2>
          
          <div style={{ display: 'grid', gap: '20px' }}>
            {/* Variantes */}
            <div>
              <h3 style={{ color: colors.text.secondary, marginBottom: '12px' }}>Variantes</h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Badge variant="default">Default</Badge>
                <Badge variant="primary">Primario</Badge>
                <Badge variant="success">Éxito</Badge>
                <Badge variant="warning">Advertencia</Badge>
                <Badge variant="error">Error</Badge>
                <Badge variant="info">Info</Badge>
              </div>
            </div>

            {/* Tamaños */}
            <div>
              <h3 style={{ color: colors.text.secondary, marginBottom: '12px' }}>Tamaños</h3>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <Badge size="sm">Pequeño</Badge>
                <Badge size="md">Mediano</Badge>
                <Badge size="lg">Grande</Badge>
              </div>
            </div>

            {/* Interactivos */}
            <div>
              <h3 style={{ color: colors.text.secondary, marginBottom: '12px' }}>Interactivos</h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Badge 
                  variant="primary" 
                  onClick={() => handleBadgeToggle('clickable')}
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
                  onRemove={() => console.log('Badge removido')}
                >
                  Removible
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Modal */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{
            color: colors.text.primary,
            fontSize: '24px',
            marginBottom: '20px',
            borderBottom: `2px solid ${colors.border.light}`,
            paddingBottom: '10px'
          }}>
            Modal
          </h2>
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button onClick={() => setIsModalOpen(true)}>
              Abrir Modal
            </Button>
          </div>

          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Ejemplo de Modal"
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
            <p style={{ color: colors.text.secondary, marginBottom: '16px' }}>
              Este es un ejemplo de modal estandarizado con la paleta de colores centralizada.
            </p>
            <p style={{ color: colors.text.secondary }}>
              Incluye header, contenido y footer personalizables.
            </p>
          </Modal>
        </section>

        {/* Paleta de Colores */}
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{
            color: colors.text.primary,
            fontSize: '24px',
            marginBottom: '20px',
            borderBottom: `2px solid ${colors.border.light}`,
            paddingBottom: '10px'
          }}>
            Paleta de Colores
          </h2>
          
          <div style={{ display: 'grid', gap: '20px' }}>
            {/* Colores principales */}
            <div>
              <h3 style={{ color: colors.text.secondary, marginBottom: '12px' }}>Colores Principales</h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: colors.primary.blue,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.text.inverse,
                  fontSize: '12px',
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}>
                  Azul<br />#234C8C
                </div>
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: colors.neutral.black,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.text.inverse,
                  fontSize: '12px',
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}>
                  Negro<br />#000000
                </div>
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: colors.neutral.white,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.text.primary,
                  fontSize: '12px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  border: `1px solid ${colors.border.light}`
                }}>
                  Blanco<br />#FFFFFF
                </div>
              </div>
            </div>

            {/* Estados */}
            <div>
              <h3 style={{ color: colors.text.secondary, marginBottom: '12px' }}>Colores de Estado</h3>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: colors.status.success,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.text.inverse,
                  fontSize: '12px',
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}>
                  Éxito<br />#10B981
                </div>
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: colors.status.error,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.text.inverse,
                  fontSize: '12px',
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}>
                  Error<br />#EF4444
                </div>
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: colors.status.warning,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.text.inverse,
                  fontSize: '12px',
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}>
                  Advertencia<br />#F59E0B
                </div>
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: colors.status.info,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: colors.text.inverse,
                  fontSize: '12px',
                  textAlign: 'center',
                  fontWeight: 'bold'
                }}>
                  Info<br />#3B82F6
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Información */}
        <section style={{
          backgroundColor: colors.background.tertiary,
          padding: '20px',
          borderRadius: '8px',
          marginTop: '40px'
        }}>
          <h3 style={{
            color: colors.text.primary,
            marginBottom: '12px'
          }}>
            Información del Sistema
          </h3>
          <p style={{
            color: colors.text.secondary,
            margin: 0,
            lineHeight: '1.6'
          }}>
            Todos los componentes utilizan la paleta de colores centralizada definida en{' '}
            <code style={{
              backgroundColor: colors.background.primary,
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '14px',
              color: colors.primary.blue
            }}>
              src/constants/colors.ts
            </code>
            . Esto asegura consistencia visual en toda la aplicación.
          </p>
        </section>
      </div>
    </div>
  );
} 