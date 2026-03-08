'use client';

import { useState } from 'react';
import { colors } from '../../constants/colors';

export default function TestEmailTemplates() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [singleTestLoading, setSingleTestLoading] = useState<string | null>(null);
  const [singleTestMessage, setSingleTestMessage] = useState('');

  const handleTest = async () => {
    if (!email) {
      setMessage('Por favor ingresa un email de prueba');
      return;
    }

    setLoading(true);
    setMessage('');
    setResults([]);

    try {
      const response = await fetch('/api/test/email-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testEmail: email }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message);
        setResults(data.results || []);
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      setMessage('Error al ejecutar la prueba');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSingleTest = async (type: 'weekly_logbook_release' | 'move_crew_event_reminder' | 'move_crew_event_reminder_15m') => {
    if (!email) {
      setSingleTestMessage('Por favor ingresa un email de prueba');
      return;
    }
    setSingleTestLoading(type);
    setSingleTestMessage('');
    try {
      const response = await fetch('/api/test/email-templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testEmail: email, type }),
      });
      const data = await response.json();
      if (data.success) {
        setSingleTestMessage(`Enviado a ${data.to}: ${data.message || 'OK'}`);
      } else {
        setSingleTestMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      setSingleTestMessage('Error al enviar');
      console.error('Error:', error);
    } finally {
      setSingleTestLoading(null);
    }
  };

  return (
    <div style={{ 
      fontFamily: 'Montserrat, Arial, sans-serif',
      backgroundColor: colors.background.secondary,
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: colors.background.primary,
        padding: '30px',
        borderRadius: '12px',
        boxShadow: colors.shadow.lg
      }}>
        <h1 style={{
          color: colors.primary.blue,
          textAlign: 'center',
          fontSize: '28px',
          marginBottom: '30px'
        }}>
          Prueba de Templates de Email
        </h1>

        <p style={{
          color: colors.text.secondary,
          textAlign: 'center',
          marginBottom: '30px',
          lineHeight: '1.6'
        }}>
          Esta página envía todos los tipos de email disponibles para verificar que funcionan correctamente con la nueva paleta de colores estandarizada.
        </p>

        <div style={{
          backgroundColor: colors.background.tertiary,
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <label style={{
            display: 'block',
            color: colors.text.primary,
            marginBottom: '10px',
            fontWeight: 'bold'
          }}>
            Email de prueba:
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu-email@ejemplo.com"
            style={{
              width: '100%',
              padding: '12px',
              border: `1px solid ${colors.border.medium}`,
              borderRadius: '6px',
              fontSize: '16px',
              fontFamily: 'Montserrat, Arial, sans-serif'
            }}
          />
        </div>

        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <button
            onClick={handleTest}
            disabled={loading}
            style={{
              backgroundColor: colors.primary.blue,
              color: colors.text.inverse,
              padding: '15px 30px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              fontFamily: 'Montserrat, Arial, sans-serif'
            }}
          >
            {loading ? 'Enviando emails...' : 'Probar Todos los Templates'}
          </button>
        </div>

        <div style={{
          backgroundColor: colors.background.tertiary,
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px'
        }}>
          <div style={{
            color: colors.text.primary,
            marginBottom: '12px',
            fontWeight: 'bold',
            fontSize: '14px'
          }}>
            Probar un template específico
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <button
              onClick={() => handleSingleTest('weekly_logbook_release')}
              disabled={!!singleTestLoading || !email}
              style={{
                backgroundColor: colors.primary.blue,
                color: colors.text.inverse,
                padding: '10px 18px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: singleTestLoading || !email ? 'not-allowed' : 'pointer',
                opacity: singleTestLoading || !email ? 0.7 : 1,
                fontFamily: 'Montserrat, Arial, sans-serif'
              }}
            >
              {singleTestLoading === 'weekly_logbook_release' ? 'Enviando...' : 'Mail del martes (contenidos de la semana)'}
            </button>
            <button
              onClick={() => handleSingleTest('move_crew_event_reminder')}
              disabled={!!singleTestLoading || !email}
              style={{
                backgroundColor: colors.primary.blue,
                color: colors.text.inverse,
                padding: '10px 18px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: singleTestLoading || !email ? 'not-allowed' : 'pointer',
                opacity: singleTestLoading || !email ? 0.7 : 1,
                fontFamily: 'Montserrat, Arial, sans-serif'
              }}
            >
              {singleTestLoading === 'move_crew_event_reminder' ? 'Enviando...' : 'Recordatorio 1h antes (Zoom)'}
            </button>
            <button
              onClick={() => handleSingleTest('move_crew_event_reminder_15m')}
              disabled={!!singleTestLoading || !email}
              style={{
                backgroundColor: colors.primary.blue,
                color: colors.text.inverse,
                padding: '10px 18px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: singleTestLoading || !email ? 'not-allowed' : 'pointer',
                opacity: singleTestLoading || !email ? 0.7 : 1,
                fontFamily: 'Montserrat, Arial, sans-serif'
              }}
            >
              {singleTestLoading === 'move_crew_event_reminder_15m' ? 'Enviando...' : 'Recordatorio 15 min antes (Zoom)'}
            </button>
          </div>
          {singleTestMessage && (
            <div style={{
              marginTop: '12px',
              padding: '10px',
              borderRadius: '6px',
              backgroundColor: singleTestMessage.includes('Error') ? colors.status.errorLight : colors.status.successLight,
              color: singleTestMessage.includes('Error') ? colors.status.error : colors.status.success,
              fontSize: '14px'
            }}>
              {singleTestMessage}
            </div>
          )}
        </div>

        {message && (
          <div style={{
            backgroundColor: message.includes('Error') ? colors.status.errorLight : colors.status.successLight,
            color: message.includes('Error') ? colors.status.error : colors.status.success,
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            textAlign: 'center',
            fontWeight: 'bold'
          }}>
            {message}
          </div>
        )}

        {results.length > 0 && (
          <div>
            <h2 style={{
              color: colors.text.primary,
              fontSize: '20px',
              marginBottom: '20px'
            }}>
              Resultados de la Prueba:
            </h2>
            
            <div style={{
              display: 'grid',
              gap: '10px'
            }}>
              {results.map((result, index) => (
                <div key={index} style={{
                  backgroundColor: result.success ? colors.status.successLight : colors.status.errorLight,
                  padding: '15px',
                  borderRadius: '8px',
                  border: `1px solid ${result.success ? colors.status.success : colors.status.error}`
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '5px'
                  }}>
                    <strong style={{
                      color: result.success ? colors.status.success : colors.status.error
                    }}>
                      {result.emailType}
                    </strong>
                    <span style={{
                      color: result.success ? colors.status.success : colors.status.error,
                      fontWeight: 'bold'
                    }}>
                      {result.success ? '✅' : '❌'}
                    </span>
                  </div>
                  <p style={{
                    color: colors.text.secondary,
                    fontSize: '14px',
                    margin: '5px 0'
                  }}>
                    {result.message}
                  </p>
                  {result.error && (
                    <p style={{
                      color: colors.status.error,
                      fontSize: '12px',
                      margin: '5px 0'
                    }}>
                      Error: {result.error}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{
          marginTop: '40px',
          padding: '20px',
          backgroundColor: colors.background.tertiary,
          borderRadius: '8px'
        }}>
          <h3 style={{
            color: colors.text.primary,
            marginBottom: '15px'
          }}>
            Tipos de Email Incluidos:
          </h3>
          <ul style={{
            color: colors.text.secondary,
            lineHeight: '1.6',
            paddingLeft: '20px'
          }}>
            <li><strong>Mentoría:</strong> Solicitud, Aprobación, Bienvenida</li>
            <li><strong>Membresía:</strong> Bienvenida, Cancelación, Actualización</li>
            <li><strong>Pagos:</strong> Exitoso, Fallido</li>
            <li><strong>Autenticación:</strong> Reset de contraseña</li>
            <li><strong>Contenido:</strong> Nueva clase, Completación de curso, Recordatorio</li>
            <li><strong>Mails del cron:</strong> Contenido semanal (martes), Recordatorio 1h antes (Zoom), Recordatorio 15 min antes (Zoom)</li>
            <li><strong>General:</strong> Formulario de contacto, Bienvenida general</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 