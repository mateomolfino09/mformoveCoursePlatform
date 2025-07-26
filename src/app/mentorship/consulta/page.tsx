"use client";
import React, { useState, useEffect } from "react";
import { CldImage } from 'next-cloudinary';
import { motion, AnimatePresence } from 'framer-motion';

interface FormState {
  nombre: string;
  email: string;
  paisCiudad: string;
  interesadoEn: string[];
  dondeEntrena: string;
  nivelActual: string;
  principalFreno: string;
  porQueElegirme: string;
  whatsapp: string;
  presupuesto: string;
  comentarios: string;
}

interface FormErrors {
  [key: string]: string;
}

interface RadioOption {
  value: string;
  label: string;
  description: string;
}

interface Pregunta {
  name: string;
  label: string;
  type: "text" | "email" | "textarea" | "select" | "checkbox" | "radio";
  required: boolean;
  options?: any[];
}

interface PlanPrice {
  interval: 'trimestral' | 'anual';
  price: number;
  currency: string;
  stripePriceId: string;
}

interface MentorshipPlan {
  _id: string;
  name: string;
  description: string;
  features: string[];
  level: string;
  active: boolean;
  prices: PlanPrice[];
}

const preguntas = [
  {
    name: "nombre",
    label: "Nombre completo",
    type: "text",
    required: true,
  },
  {
    name: "email",
    label: "Correo electrónico",
    type: "email",
    required: true,
  },
  {
    name: "paisCiudad",
    label: "¿País y ciudad de residencia?",
    type: "text",
    required: true,
  },
  {
    name: "interesadoEn",
    label: "¿En qué estás interesad@?",
    type: "checkbox",
    options: [
      "Mentoria"
    ],
    required: true,
  },
  {
    name: "dondeEntrena",
    label: "¿Dónde sueles entrenar?",
    type: "select",
    options: [
      "Entreno en el parque de calistenia",
      "Entreno en casa",
      "Entreno en el gimnasio",
      "Otro"
    ],
    required: true,
  },
  {
    name: "nivelActual",
    label: "¿En qué punto te encuentras?",
    type: "select",
    options: [
      "Quiero entrenar pero me falta adherencia",
      "Entreno pero soy poco constante",
      "Entreno 2-3 días a la semana",
      "Entreno 4-5 días a la semana",
      "Otro"
    ],
    required: true,
  },
  {
    name: "principalFreno",
    label: "¿Cuál es tu principal freno para conseguir tus objetivos? ¿Cómo te sentirás una vez los hayas alcanzado?",
    type: "textarea",
    required: true,
  },
  {
    name: "porQueElegirme",
    label: "¿Por qué te gustaría entrenar/aprender conmigo? ¿Cuáles crees que son las cosas más importantes que puedo hacer yo como entrenador para que logres alcanzar estos objetivos?",
    type: "textarea",
    required: true,
  },
  {
    name: "whatsapp",
    label: "Facilítame tu WhatsApp para ponerme en contacto contigo (recuerda poner el prefijo)",
    type: "text",
    required: true,
  },
  {
    name: "presupuesto",
    label: "¿Qué servicios te interesan más según tu situación financiera actual?",
    type: "radio",
    options: [], // Se llenará dinámicamente con los planes de la base de datos
    required: true,
  },
  {
    name: "comentarios",
    label: "Comentarios adicionales (opcional)",
    type: "textarea",
    required: false,
  },
];

const initialState: FormState = {
  nombre: "",
  email: "",
  paisCiudad: "",
  interesadoEn: [],
  dondeEntrena: "",
  nivelActual: "",
  principalFreno: "",
  porQueElegirme: "",
  whatsapp: "",
  presupuesto: "",
  comentarios: ""
};

const boxVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
};
const preguntaVariants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, x: -40, transition: { duration: 0.3, ease: 'easeIn' } },
};

// Type guard para radio options
function isRadioOptions(options: any[]): options is RadioOption[] {
  return options.length > 0 && typeof options[0] === 'object' && 'value' in options[0];
}

function isStringOptions(options: any[]): options is string[] {
  return options.length > 0 && typeof options[0] === 'string';
}

// Funciones de validación
const validators = {
  nombre: (value: string): string => {
    if (!value.trim()) return 'El nombre es requerido';
    if (value.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
    if (value.trim().length > 50) return 'El nombre no puede exceder 50 caracteres';
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value.trim())) {
      return 'El nombre solo puede contener letras y espacios';
    }
    return '';
  },

  email: (value: string): string => {
    if (!value.trim()) return 'El email es requerido';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value.trim())) {
      return 'Ingresa un email válido';
    }
    return '';
  },

  paisCiudad: (value: string): string => {
    if (!value.trim()) return 'El país y ciudad son requeridos';
    if (value.trim().length < 5) return 'Ingresa país y ciudad completos';
    if (value.trim().length > 100) return 'El texto es demasiado largo';
    return '';
  },

  interesadoEn: (value: string[]): string => {
    if (!value || value.length === 0) return 'Debes seleccionar al menos una opción';
    return '';
  },

  dondeEntrena: (value: string): string => {
    if (!value.trim()) return 'Debes seleccionar dónde entrenas';
    return '';
  },

  nivelActual: (value: string): string => {
    if (!value.trim()) return 'Debes seleccionar tu nivel actual';
    return '';
  },

  principalFreno: (value: string): string => {
    if (!value.trim()) return 'Este campo es requerido';
    if (value.trim().length < 20) return 'Describe tu situación con más detalle (mínimo 20 caracteres)';
    if (value.trim().length > 500) return 'El texto es demasiado largo (máximo 500 caracteres)';
    return '';
  },

  porQueElegirme: (value: string): string => {
    if (!value.trim()) return 'Este campo es requerido';
    if (value.trim().length < 20) return 'Describe tus expectativas con más detalle (mínimo 20 caracteres)';
    if (value.trim().length > 500) return 'El texto es demasiado largo (máximo 500 caracteres)';
    return '';
  },

  whatsapp: (value: string): string => {
    if (!value.trim()) return 'El WhatsApp es requerido';
    // Validar formato internacional: +1234567890 o 1234567890
    const whatsappRegex = /^(\+?[1-9]\d{1,14}|[1-9]\d{8,14})$/;
    const cleanNumber = value.trim().replace(/[\s\-\(\)]/g, '');
    if (!whatsappRegex.test(cleanNumber)) {
      return 'Ingresa un número de WhatsApp válido (ej: +1234567890)';
    }
    return '';
  },

  presupuesto: (value: string): string => {
    if (!value.trim()) return 'Debes seleccionar un plan de mentoría';
    return '';
  },

  comentarios: (value: string): string => {
    if (value.trim() && value.trim().length > 300) {
      return 'Los comentarios no pueden exceder 300 caracteres';
    }
    return '';
  }
};

export default function MentorshipConsultaPage() {
  const [form, setForm] = useState<FormState>(initialState);
  const [step, setStep] = useState(0);
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mentorshipPlans, setMentorshipPlans] = useState<MentorshipPlan[]>([]);
  const [plansLoaded, setPlansLoaded] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});

  const preguntaActual = preguntas[step];

  // Función para cargar los planes de mentoría
  const loadMentorshipPlans = async () => {
    try {
      console.log('Cargando planes de mentoría...');
      const response = await fetch('/api/payments/getPlans?type=mentorship');
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const plans = await response.json();
        console.log('Planes recibidos:', plans);
        
        const activePlans = plans.filter((plan: MentorshipPlan) => plan.active);
        console.log('Planes activos:', activePlans);
        
        setMentorshipPlans(activePlans);
        
        // Actualizar las opciones de presupuesto con los planes reales
        const presupuestoPregunta = preguntas.find(p => p.name === 'presupuesto');
        if (presupuestoPregunta) {
          const options = activePlans.map((plan: MentorshipPlan) => {
            const trimestralPrice = plan.prices?.find((p: PlanPrice) => p.interval === 'trimestral');
            const anualPrice = plan.prices?.find((p: PlanPrice) => p.interval === 'anual');
            
            let label = `MENTORÍA ${plan.level.toUpperCase()}`;
            if (trimestralPrice && anualPrice) {
              label += ` ($${trimestralPrice.price}/${trimestralPrice.interval} - $${anualPrice.price}/${anualPrice.interval})`;
            } else if (trimestralPrice) {
              label += ` ($${trimestralPrice.price}/${trimestralPrice.interval})`;
            }
            
            return {
              value: plan.level,
              label: label,
              description: plan.description
            };
          });
          
          console.log('Opciones generadas:', options);
          presupuestoPregunta.options = options;
        }
        
        setPlansLoaded(true);
      } else {
        console.error('Error en la respuesta:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error cargando planes de mentoría:', error);
    }
  };

  // Cargar planes al montar el componente
  useEffect(() => {
    loadMentorshipPlans();
  }, []);

  // Función para validar un campo específico
  const validateField = (name: string, value: any): string => {
    const validator = validators[name as keyof typeof validators];
    if (validator) {
      return validator(value);
    }
    return '';
  };

  // Función para validar todos los campos
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    Object.keys(form).forEach(key => {
      const error = validateField(key, form[key as keyof FormState]);
      if (error) {
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para validar el paso actual
  const validateCurrentStep = (): boolean => {
    const currentField = preguntaActual.name;
    const currentValue = form[currentField as keyof FormState];
    const error = validateField(currentField, currentValue);
    
    if (error) {
      setErrors(prev => ({ ...prev, [currentField]: error }));
      return false;
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[currentField];
        return newErrors;
      });
      return true;
    }
  };

  // Validación de paso
  const isValid = () => {
    if (preguntaActual.required) {
      const currentField = preguntaActual.name;
      const currentValue = form[currentField as keyof FormState];
      const error = validateField(currentField, currentValue);
      return !error;
    }
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      const currentValues = form[name as keyof FormState] as string[] || [];
      
      if (checkbox.checked) {
        setForm({ ...form, [name]: [...currentValues, value] } as FormState);
      } else {
        setForm({ ...form, [name]: currentValues.filter(v => v !== value) } as FormState);
      }
    } else {
      setForm({ ...form, [name]: value } as FormState);
    }

    // Validación en tiempo real
    if (touched[name]) {
      const newValue = type === 'checkbox' ? 
        (e.target as HTMLInputElement).checked ? 
          [...(form[name as keyof FormState] as string[] || []), value] : 
          (form[name as keyof FormState] as string[] || []).filter(v => v !== value)
        : value;
      
      const error = validateField(name, newValue);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleRadioChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value } as FormState);
    
    // Validación en tiempo real
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleBlur = (name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const value = form[name as keyof FormState];
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleNext = () => {
    setError("");
    // Marcar el campo actual como tocado
    setTouched(prev => ({ ...prev, [preguntaActual.name]: true }));
    
    if (!validateCurrentStep()) {
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handlePrev = () => {
    setError("");
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Marcar todos los campos como tocados
    const allTouched = Object.keys(form).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as {[key: string]: boolean});
    setTouched(allTouched);
    
    // Validar todo el formulario
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const res = await fetch("/api/mentorship/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Error al enviar la solicitud");
        setLoading(false);
        return;
      }
      
      setEnviado(true);
    } catch (err) {
      setError("Error de conexión. Intenta nuevamente.");
    }
    setLoading(false);
  };

  if (enviado) {
    return (
      <div className="relative min-h-screen flex items-center justify-center font-montserrat" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        {/* Fondo Cloudinary con overlay */}
        <div className="fixed inset-0 z-0">
          <CldImage
            src="my_uploads/plaza/DSC03350_vgjrrh"
            width={1600}
            height={900}
            alt="Fondo mentoría"
            className="w-full h-full object-cover object-center"
            style={{ filter: 'brightness(0.6) blur(2px)' }}
            priority
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        
        <motion.div
          className="relative z-10 w-full max-w-xl mx-auto flex items-center justify-center font-montserrat min-h-[60vh] px-2 md:px-0"
          variants={boxVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="w-full bg-white/90 rounded-2xl shadow-2xl p-6 md:p-12 backdrop-blur-xl border border-[#234C8C]/20 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            
            <motion.h2
              className="text-2xl md:text-3xl font-bold mb-4"
              style={{ color: '#234C8C', fontFamily: 'Montserrat, sans-serif' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              ¡Solicitud Enviada!
            </motion.h2>
            
            <motion.p
              className="text-gray-700 mb-6 text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Gracias por tu interés en entrenar conmigo. He recibido tu solicitud y me pondré en contacto contigo pronto para explicarte todo con detalle.
            </motion.p>
            
            <motion.p
              className="text-gray-600 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Un abrazo fuerte,<br />
              <span className="font-semibold">Mateo</span>
            </motion.p>
            
            <motion.button
              onClick={() => window.location.href = '/'}
              className="bg-[#234C8C] text-white px-6 py-3 rounded font-bold hover:bg-[#1a3763] transition-colors font-montserrat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              Volver al inicio
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Render pregunta actual
  return (
    <div className="relative min-h-screen flex items-center justify-center font-montserrat" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {/* Fondo Cloudinary con overlay */}
      <div className="fixed inset-0 z-0">
        <CldImage
          src="my_uploads/plaza/DSC03350_vgjrrh"
          width={1600}
          height={900}
          alt="Fondo mentoría"
          className="w-full h-full object-cover object-center"
          style={{ filter: 'brightness(0.6) blur(2px)' }}
          priority
        />
        <div className="absolute inset-0 bg-black/70" />
      </div>
      
      {/* Formulario centrado con animación */}
      <div className="relative z-10 w-full max-w-xl mx-auto flex items-center justify-center font-montserrat min-h-[60vh] px-2 md:px-0">
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6 w-full bg-white/90 rounded-2xl shadow-2xl p-6 md:p-12 backdrop-blur-xl border border-[#234C8C]/20"
          variants={boxVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <motion.h1
            className="text-3xl md:text-4xl font-bold text-center tracking-tight font-montserrat"
            style={{ color: '#234C8C', fontFamily: 'Montserrat, sans-serif', letterSpacing: '-0.5px' }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Entrena Conmigo
          </motion.h1>
          <motion.h3
            className="text-lg md:text-xl mb-4 text-center font-montserrat tracking-tight !mt-2" 
            style={{ color: 'black', fontFamily: 'Montserrat, sans-serif', letterSpacing: '-0.5px' }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            Si querés entrenar conmigo y que te acompañe a alcanzar tus objetivos con un plan adaptado a tu tiempo, nivel y recursos, completá este formulario. Me pondré en contacto para contarte todos los detalles y ver si es para vos.
          </motion.h3>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={preguntaActual.name + step}
              variants={preguntaVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full"
            >
              <label className="block font-semibold mb-2 text-black text-lg md:text-xl" style={{ color: '#234C8C', fontFamily: 'Montserrat, sans-serif' }}>{preguntaActual.label}</label>
              
              {preguntaActual.type === "text" && (
                <div>
                  <input
                    type="text"
                    name={preguntaActual.name}
                    value={form[preguntaActual.name as keyof FormState] as string}
                    onChange={handleChange}
                    onBlur={() => handleBlur(preguntaActual.name)}
                    required={preguntaActual.required}
                    className={`w-full border rounded px-3 py-2 text-black bg-white/90 focus:outline-none focus:ring-2 font-montserrat ${
                      errors[preguntaActual.name] && touched[preguntaActual.name]
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-[#234C8C]/30 focus:ring-[#234C8C]'
                    }`}
                    autoFocus
                  />
                  {errors[preguntaActual.name] && touched[preguntaActual.name] && (
                    <p className="text-red-600 text-sm mt-1 font-montserrat">{errors[preguntaActual.name]}</p>
                  )}
                </div>
              )}
              
              {preguntaActual.type === "email" && (
                <div>
                  <input
                    type="email"
                    name={preguntaActual.name}
                    value={form[preguntaActual.name as keyof FormState] as string}
                    onChange={handleChange}
                    onBlur={() => handleBlur(preguntaActual.name)}
                    required={preguntaActual.required}
                    className={`w-full border rounded px-3 py-2 text-black bg-white/90 focus:outline-none focus:ring-2 font-montserrat ${
                      errors[preguntaActual.name] && touched[preguntaActual.name]
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-[#234C8C]/30 focus:ring-[#234C8C]'
                    }`}
                    autoFocus
                  />
                  {errors[preguntaActual.name] && touched[preguntaActual.name] && (
                    <p className="text-red-600 text-sm mt-1 font-montserrat">{errors[preguntaActual.name]}</p>
                  )}
                </div>
              )}
              
              {preguntaActual.type === "textarea" && (
                <div>
                  <textarea
                    name={preguntaActual.name}
                    value={form[preguntaActual.name as keyof FormState] as string}
                    onChange={handleChange}
                    onBlur={() => handleBlur(preguntaActual.name)}
                    required={preguntaActual.required}
                    rows={4}
                    className={`w-full border rounded px-3 py-2 text-black bg-white/90 focus:outline-none focus:ring-2 font-montserrat resize-none ${
                      errors[preguntaActual.name] && touched[preguntaActual.name]
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-[#234C8C]/30 focus:ring-[#234C8C]'
                    }`}
                    autoFocus
                  />
                  {errors[preguntaActual.name] && touched[preguntaActual.name] && (
                    <p className="text-red-600 text-sm mt-1 font-montserrat">{errors[preguntaActual.name]}</p>
                  )}
                </div>
              )}
              
              {preguntaActual.type === "select" && Array.isArray(preguntaActual.options) && (
                <div>
                  <select
                    name={preguntaActual.name}
                    value={form[preguntaActual.name as keyof FormState] as string}
                    onChange={handleChange}
                    onBlur={() => handleBlur(preguntaActual.name)}
                    required={preguntaActual.required}
                    className={`w-full border rounded px-3 py-2 text-black bg-white/90 focus:outline-none focus:ring-2 font-montserrat ${
                      errors[preguntaActual.name] && touched[preguntaActual.name]
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-[#234C8C]/30 focus:ring-[#234C8C]'
                    }`}
                    autoFocus
                  >
                    <option value="">Selecciona una opción</option>
                    {preguntaActual.options.map((opt: any) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                  {errors[preguntaActual.name] && touched[preguntaActual.name] && (
                    <p className="text-red-600 text-sm mt-1 font-montserrat">{errors[preguntaActual.name]}</p>
                  )}
                </div>
              )}
              
              {preguntaActual.type === "checkbox" && Array.isArray(preguntaActual.options) && preguntaActual.options.length > 0 && (
                <div>
                  <div className="space-y-3">
                    {preguntaActual.options.map((opt: any) => (
                      <label key={opt} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          name={preguntaActual.name}
                          value={opt}
                          checked={(form[preguntaActual.name as keyof FormState] as string[] || []).includes(opt)}
                          onChange={handleChange}
                          onBlur={() => handleBlur(preguntaActual.name)}
                          className="w-4 h-4 text-[#234C8C] border-[#234C8C]/30 rounded focus:ring-[#234C8C]"
                        />
                        <span className="text-gray-800 font-montserrat">{opt}</span>
                      </label>
                    ))}
                  </div>
                  {errors[preguntaActual.name] && touched[preguntaActual.name] && (
                    <p className="text-red-600 text-sm mt-1 font-montserrat">{errors[preguntaActual.name]}</p>
                  )}
                </div>
              )}
              
              {preguntaActual.type === "radio" && preguntaActual.name === "presupuesto" && !plansLoaded && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#234C8C]"></div>
                  <span className="ml-3 text-gray-600 font-montserrat">Cargando planes de mentoría...</span>
                </div>
              )}
              
              {preguntaActual.type === "radio" && Array.isArray(preguntaActual.options) && preguntaActual.options.length > 0 && (
                <div>
                  <div className="space-y-4">
                    {(preguntaActual.options as any[]).map((opt: any) => (
                    <label key={opt.value} className="block cursor-pointer">
                      <div className="border border-[#234C8C]/30 rounded-lg p-4 hover:bg-[#234C8C]/5 transition-colors">

                        
                        <div className="flex items-start space-x-3">
                          <input
                            type="radio"
                            name={preguntaActual.name}
                            value={opt.value}
                            checked={form[preguntaActual.name as keyof FormState] === opt.value}
                            onChange={() => handleRadioChange(preguntaActual.name, opt.value)}
                            className="w-4 h-4 text-[#234C8C] border-[#234C8C]/30 focus:ring-[#234C8C] mt-1"
                          />
                          <div className="flex-1">
                            <div className={`font-semibold mb-2 ${
                              opt.value === "student" 
                                ? "text-transparent bg-clip-text bg-gradient-to-r from-[#234C8C] to-[#5FA8E9] text-lg" 
                                : opt.value === "practitioner"
                                ? "text-[#234C8C] text-base font-bold"
                                : "text-[#234C8C]"
                            }`}>
                              {opt.label}
                            </div>
                            <div className={`text-sm ${
                              opt.value === "student" 
                                ? "text-gray-800 font-medium" 
                                : opt.value === "practitioner"
                                ? "text-gray-700 font-medium"
                                : "text-gray-700"
                            }`}>
                              {opt.description}
                            </div>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                  </div>
                  {errors[preguntaActual.name] && touched[preguntaActual.name] && (
                    <p className="text-red-600 text-sm mt-1 font-montserrat">{errors[preguntaActual.name]}</p>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          
          {error && <p className="text-red-600 font-semibold font-montserrat">{error}</p>}
          
          {/* Botones de navegación */}
          <div className="flex justify-between mt-8 gap-2 flex-col sm:flex-row">
            {step > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="bg-gray-200 text-[#234C8C] px-6 py-3 rounded font-bold disabled:opacity-50 border border-[#234C8C]/30 font-montserrat w-full sm:w-auto mb-2 sm:mb-0 text-lg"
              >
                Anterior
              </button>
            )}
            
            {step < preguntas.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="bg-[#234C8C] text-white px-6 py-3 rounded font-bold hover:bg-[#1a3763] disabled:opacity-50 border border-[#234C8C]/30 font-montserrat w-full sm:w-auto text-lg"
              >
                Siguiente
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="bg-[#234C8C] text-white px-6 py-3 rounded font-bold hover:bg-[#1a3763] disabled:opacity-50 border border-[#234C8C]/30 font-montserrat w-full sm:w-auto text-lg"
              >
                {loading ? "Enviando..." : "Enviar solicitud"}
              </button>
            )}
          </div>
          
          {/* Indicador de progreso */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Paso {step + 1} de {preguntas.length}</span>
              <span>{Math.round(((step + 1) / preguntas.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#234C8C] h-2 rounded-full transition-all duration-300"
                style={{ width: `${((step + 1) / preguntas.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </motion.form>
      </div>
    </div>
  );
} 