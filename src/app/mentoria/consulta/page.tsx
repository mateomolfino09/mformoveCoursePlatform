"use client";
import React, { useState, useEffect } from "react";
import { CldImage } from 'next-cloudinary';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import MainSideBar from '../../../components/MainSidebar/MainSideBar';
import Footer from '../../../components/Footer';
import MentorshipConsultaSkeleton from '../../../components/PageComponent/Mentorship/MentorshipConsultaSkeleton';
import imageLoader from '../../../../imageLoader';
import { useAppDispatch } from '../../../hooks/useTypeSelector';
import { toggleScroll } from '../../../redux/features/headerLibrarySlice';
import { buildMentorshipBudgetOptions, type MentorshipBudgetOption } from '../../../lib/mentorshipPricing';
import MentorshipConsultaBudgetOptions from '../../../components/PageComponent/Mentorship/MentorshipConsultaBudgetOptions';

const CONSULTA_BG = 'my_uploads/plaza/DSC03350_vgjrrh';

const fieldClass = (hasError: boolean, touchedField: boolean) =>
  [
    'w-full rounded-xl border bg-white px-4 py-3.5 text-[15px] text-palette-ink font-montserrat transition-all duration-200',
    'focus:border-palette-ink focus:outline-none focus:ring-2 focus:ring-palette-sage/25',
    hasError && touchedField
      ? 'border-red-400/90'
      : 'border-palette-stone/22 hover:border-palette-stone/40',
  ].join(' ');

function ConsultaBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <CldImage
        src={CONSULTA_BG}
        alt=""
        fill
        sizes="100vw"
        priority
        className="object-cover object-[center_42%]"
        loader={imageLoader}
      />
      <div className="absolute inset-0 opacity-[0.22] md:opacity-[0.26] mix-blend-overlay bg-palette-ink" aria-hidden />
      <div
        className="absolute inset-0 bg-gradient-to-br from-palette-ink/[0.78] via-palette-ink/[0.58] to-palette-ink/[0.42]"
        aria-hidden
      />
      <div className="absolute inset-0 bg-palette-cream/[0.06]" aria-hidden />
    </div>
  );
}

interface FormState {
  nombre: string;
  email: string;
  paisCiudad: string;
  interesadoEn: string[];
  dondeEntrena: string;
  nivelActual: string;
  objetivos: string[];
  principalFrenoJustificacion: string;
  principalFreno: string;
  porQueElegirme: string;
  /** Prefijo país (ej. +598); se concatena con whatsappNationalNumber al guardar whatsapp completo */
  whatsappDialCode: string;
  whatsappNationalNumber: string;
  whatsapp: string;
  modalidad: string;
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
  monthlyFromTrimestral?: number | null;
  monthlyFromAnual?: number | null;
  discountPercent?: number;
  interval?: 'mensual' | 'trimestral' | 'anual';
}

interface SelectOptionKV {
  value: string;
  label: string;
}

interface Pregunta {
  name: string;
  label: string;
  type: "text" | "email" | "textarea" | "select" | "checkbox" | "radio";
  required: boolean;
  /** Strings (value === label) o pares valor/label (p. ej. interesadoEn). */
  options?: (string | SelectOptionKV)[];
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

/** Valor que se envía en `interesadoEn` (array); coincide con opción histórica del backend. */
const INTERES_MENTORIA = 'Mentoria';
const INTERES_CUERPO_AUTONOMO = 'Cuerpo Autónomo';
const ROUTE_MEMBERSHIP_SELECT_PLAN = '/elegir-plan';

/** Prefijos típicos; el número local se concatena al envío: dialCode + solo dígitos. */
const WHATSAPP_DIAL_CODES = [
  { code: '+598', label: 'Uruguay +598' },
  { code: '+54', label: 'Argentina +54' },
  { code: '+56', label: 'Chile +56' },
  { code: '+57', label: 'Colombia +57' },
  { code: '+52', label: 'México +52' },
  { code: '+51', label: 'Perú +51' },
  { code: '+34', label: 'España +34' },
  { code: '+351', label: 'Portugal +351' },
  { code: '+1', label: 'EE.UU./Can +1' },
  { code: '+55', label: 'Brasil +55' },
  { code: '+593', label: 'Ecuador +593' },
] as const;

function buildWhatsappFull(dial: string, national: string): string {
  const digits = national.replace(/\D/g, '');
  const d = dial.trim().startsWith('+') ? dial.trim() : `+${dial.replace(/\D/g, '')}`;
  return digits ? `${d}${digits}` : '';
}

function currencyDisplay(code: string | undefined): string {
  const c = String(code ?? 'USD').toUpperCase();
  return c === 'USD' ? 'U$S' : c;
}

const MENTORSHIP_PLAN_WHAT_YOU_GET = [
  'Programa de entrenamiento',
  'Ajustes progresivos cada dos semanas',
  'Llamada mensual para tratar conocimientos teóricos en el campo del movimiento.',
] as const;

const MENTORSHIP_PLAN_METHOD_BASIS =
  'Artes marciales, el baile, el yoga, la calistenia, la gimnasia, el entrenamiento y los deportes.';

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
      type: "select",
      options: [
        { value: INTERES_MENTORIA, label: "Mentoría" },
        { value: INTERES_CUERPO_AUTONOMO, label: "Cuerpo Autónomo" },
      ],
      required: true,
    },
    {
      name: "dondeEntrena",
      label: "¿Dónde solés entrenar?",
      type: "select",
      options: [
        "Entreno en un parque de calistenia",
        "Entreno en casa",
        "Entreno en un gimnasio",
        "Otro",
      ],
      required: true,
    },
    {
      name: "nivelActual",
      label: "¿Cómo describirías tu situación actual?",
      type: "select",
      options: [
        "Quiero entrenar, pero me cuesta empezar",
        "Entreno, pero soy poco constante",
        "Entreno 2 o 3 veces por semana",
        "Entreno 4 o más veces por semana",
        "Otro",
      ],
      required: true,
    },
    {
      name: "objetivos",
      label: "¿Cuáles son tus principales objetivos? (Podés elegir más de uno)",
      type: "checkbox",
      options: [
        "Mejorar mi salud física y mental",
        "Tener más constancia",
        "Ganar fuerza",
        "Mejorar mi movilidad y flexibilidad",
        "Aprender habilidades (parada de manos, muscle up, etc.)",
        "Reducir dolores o prevenir lesiones",
        "Cambiar mi físico",
        "Otro",
      ],
      required: true,
    },
    {
      name: "principalFreno",
      label: "¿Qué sentís que hoy te está frenando para conseguir esos objetivos?",
      type: "textarea",
      required: true,
    },
    {
      name: "principalFrenoJustificacion",
      label: "Contame un poco más sobre eso.",
      type: "textarea",
      required: true,
    },
    {
      name: "porQueElegirme",
      label:
        "¿Por qué te gustaría entrenar conmigo? ¿Qué esperás de mí como mentor para ayudarte a conseguir esos objetivos?",
      type: "textarea",
      required: true,
    },
    {
      name: "whatsapp",
      label: "¿Cuál es tu WhatsApp?",
      type: "text",
      required: true,
    },
    {
      name: "modalidad",
      label: "¿Qué inversión mensual te sentirías cómodo haciendo si vemos que la mentoría es para vos?",
      type: "radio",
      options: [
        "Hasta USD 100 por mes",
        "Entre USD 100 y USD 170 por mes",
        "Más de USD 170 por mes",
        "No puedo acceder a ninguna de las opciones anteriores",
      ],
      required: true,
    },
    {
      name: "presupuesto",
      label: "Si vemos que la mentoría es para vos, ¿qué modalidad considerarías?",
      type: "radio",
      options: [
        "Plan trimestral",
        "Plan anual",
        "Podría evaluar cualquiera de las dos",
        "Todavía no lo sé",
      ],
      required: true,
    },
    {
      name: "comentarios",
      label: "¿Hay algo más que te gustaría contarme?",
      type: "textarea",
      required: false,
    },
  ];

const initialState: FormState = {
  nombre: "",
  email: "",
  paisCiudad: "",
  interesadoEn: [INTERES_MENTORIA],
  dondeEntrena: "",
  nivelActual: "",
  objetivos: [],
  principalFrenoJustificacion: "",
  principalFreno: "",
  porQueElegirme: "",
  whatsappDialCode: '+598',
  whatsappNationalNumber: '',
  whatsapp: '',
  modalidad: '',
  presupuesto: '',
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

  objetivos: (value: string[]): string => {
    if (!value || value.length === 0) return 'Elegí al menos un objetivo';
    return '';
  },

  principalFrenoJustificacion: (value: string): string => {
    if (!value.trim()) return 'Este campo es requerido';
    if (value.trim().length < 5) return 'Describe tu justificación con más detalle (mínimo 5 caracteres)';
    if (value.trim().length > 500) return 'El texto es demasiado largo (máximo 500 caracteres)';
    return '';
  },

  principalFreno: (value: string): string => {
    if (!value.trim()) return 'Este campo es requerido';
    if (value.trim().length < 5) return 'Describe tu situación con más detalle (mínimo 5 caracteres)';
    if (value.trim().length > 500) return 'El texto es demasiado largo (máximo 500 caracteres)';
    return '';
  },

  porQueElegirme: (value: string): string => {
    if (!value.trim()) return 'Este campo es requerido';
    if (value.trim().length < 5) return 'Describe tus expectativas con más detalle (mínimo 5 caracteres)';
    if (value.trim().length > 500) return 'El texto es demasiado largo (máximo 500 caracteres)';
    return '';
  },

  whatsapp: (value: string): string => {
    if (!value.trim()) return 'El WhatsApp es requerido';
    // Validar formato internacional: +1234567890 o 1234567890
    const whatsappRegex = /^(\+?[1-9]\d{1,14}|[1-9]\d{8,14})$/;
    const cleanNumber = value.trim().replace(/[\s\-()]/g, '');
    if (!whatsappRegex.test(cleanNumber)) {
      return 'Ingresa un número de WhatsApp válido (ej: +1234567890)';
    }
    return '';
  },

  presupuesto: (value: string): string => {
    if (!value.trim()) return 'Elegí si preferís ciclo trimestral o anual';
    return '';
  },

  modalidad: (value: string): string => {
    if (!value.trim()) return 'Elegí una opción de inversión mensual';
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
  const dispatch = useAppDispatch();
  const [form, setForm] = useState<FormState>(initialState);
  const [step, setStep] = useState(0);
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [budgetOptions, setBudgetOptions] = useState<MentorshipBudgetOption[]>([]);
  const [plansLoaded, setPlansLoaded] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});

  const preguntaActual = preguntas[step];
  const isPresupuestoStep = preguntaActual.name === 'presupuesto';

  useEffect(() => {
    dispatch(toggleScroll(false));
    return () => {
      dispatch(toggleScroll(false));
    };
  }, [dispatch]);

  const loadMentorshipPlans = async () => {
    try {
      const response = await fetch('/api/payments/getPlans?type=mentorship');
      if (!response.ok) {
        console.error('Error en la respuesta:', response.status, response.statusText);
        setBudgetOptions([]);
        return;
      }

      const plans = (await response.json()) as MentorshipPlan[];
      const activePlans = plans.filter((plan) => plan.active);
      const plan = activePlans[0];

      const options: MentorshipBudgetOption[] = plan ? buildMentorshipBudgetOptions(plan.prices) : [];

      setBudgetOptions(options);
    } catch (error) {
      console.error('Error cargando planes de mentoría:', error);
      setBudgetOptions([]);
    } finally {
      setPlansLoaded(true);
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

  // Función para validar todos los campos del flujo
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    const snapshot: FormState = {
      ...form,
      whatsapp: buildWhatsappFull(form.whatsappDialCode, form.whatsappNationalNumber),
    };

    preguntas.forEach((pregunta) => {
      const key = pregunta.name as keyof FormState;
      let value: unknown = snapshot[key];
      if (pregunta.name === 'whatsapp') {
        value = snapshot.whatsapp;
      }
      const error = validateField(pregunta.name, value);
      if (error) {
        newErrors[pregunta.name] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Función para validar el paso actual
  const validateCurrentStep = (): boolean => {
    const currentField = preguntaActual.name;
    let currentValue: unknown = form[currentField as keyof FormState];
    if (currentField === 'whatsapp') {
      currentValue = buildWhatsappFull(form.whatsappDialCode, form.whatsappNationalNumber);
    }
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
      const currentValues = (form[name as keyof FormState] as string[]) || [];

      if (checkbox.checked) {
        setForm({ ...form, [name]: [...currentValues, value] } as FormState);
      } else {
        setForm({ ...form, [name]: currentValues.filter((v) => v !== value) } as FormState);
      }
    } else if (name === 'interesadoEn') {
      setForm({ ...form, interesadoEn: value ? [value] : [] } as FormState);
    } else {
      setForm({ ...form, [name]: value } as FormState);
    }

    if (touched[name]) {
      let newValue: string | string[];
      if (type === 'checkbox') {
        newValue = (e.target as HTMLInputElement).checked
          ? [...((form[name as keyof FormState] as string[]) || []), value]
          : ((form[name as keyof FormState] as string[]) || []).filter((v) => v !== value);
      } else if (name === 'interesadoEn') {
        newValue = value ? [value] : [];
      } else {
        newValue = value;
      }

      const error = validateField(name, newValue);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
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
    setTouched((prev) => ({ ...prev, [name]: true }));
    let value = form[name as keyof FormState];
    if (name === 'whatsapp') {
      const full = buildWhatsappFull(form.whatsappDialCode, form.whatsappNationalNumber);
      setForm((prev) => ({ ...prev, whatsapp: full }));
      value = full;
    }
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const muestraPuenteMembresia =
    preguntaActual.name === 'interesadoEn' && form.interesadoEn?.[0] === INTERES_CUERPO_AUTONOMO;

  const syncWhatsappField = (
    patch: Partial<Pick<FormState, 'whatsappDialCode' | 'whatsappNationalNumber'>>,
  ) => {
    setForm((prev) => {
      const dial = patch.whatsappDialCode ?? prev.whatsappDialCode;
      const national = patch.whatsappNationalNumber ?? prev.whatsappNationalNumber;
      return {
        ...prev,
        ...patch,
        whatsapp: buildWhatsappFull(dial, national),
      };
    });
  };

  const handleNext = () => {
    setError('');
    setTouched((prev) => ({ ...prev, [preguntaActual.name]: true }));

    if (preguntaActual.name === 'interesadoEn' && form.interesadoEn?.[0] === INTERES_CUERPO_AUTONOMO) {
      return;
    }

    if (!validateCurrentStep()) {
      return;
    }

    if (preguntaActual.name === 'whatsapp') {
      const full = buildWhatsappFull(form.whatsappDialCode, form.whatsappNationalNumber);
      setForm((prev) => ({ ...prev, whatsapp: full }));
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
      setError('Revisá los campos: faltan respuestas o hay algún dato inválido.');
      return;
    }
    
    setLoading(true);

    const whatsapp = buildWhatsappFull(form.whatsappDialCode, form.whatsappNationalNumber);
    const payload = {
      ...form,
      whatsapp,
      // Compatibilidad con el modelo/API histórico
      nivelBuscado: form.objetivos.join(', '),
      objetivos: form.objetivos,
      modalidad: form.modalidad,
    };

    try {
      const res = await fetch('/api/mentorship/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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

  if (!plansLoaded && !enviado) {
    return <MentorshipConsultaSkeleton />;
  }

  if (enviado) {
    return (
      <MainSideBar where="mentorship">
        <div className="relative min-h-screen bg-palette-cream font-montserrat flex items-center justify-center pb-24 pt-[7rem] md:pt-28 md:pb-28">
          <ConsultaBackdrop />

          <motion.div
            className="relative z-10 mx-auto flex w-full max-w-lg min-h-[52vh] items-center justify-center px-4 pb-8 md:px-6 md:pb-12"
            variants={boxVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="w-full rounded-3xl border border-palette-stone/20 bg-white/95 px-8 py-10 text-center shadow-[0_14px_48px_rgba(20,20,17,0.1)] backdrop-blur-md md:px-12 md:py-12">
              <p className="mb-6 font-montserrat text-[10px] font-semibold uppercase tracking-[0.28em] text-palette-stone/75 md:text-[11px]">
                Mentoría
              </p>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-palette-sage ring-[3px] ring-palette-sage/30"
            >
              <svg className="w-8 h-8 text-palette-cream" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            
            <motion.h2
              className="mb-4 text-[1.55rem] font-semibold tracking-tight text-palette-ink md:text-[1.95rem]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Solicitud enviada
            </motion.h2>
            
            <motion.p
              className="mb-6 text-[15px] font-light leading-relaxed text-palette-stone md:text-[16px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              Gracias por tu interés. Me pondré en contacto pronto para contarte los detalles.
            </motion.p>
            
            <motion.p
              className="text-palette-stone/85 mb-8 text-sm font-light"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              Un abrazo,<br />
              <span className="font-medium">Mateo</span>
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col gap-3 sm:flex-row sm:justify-center"
            >
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full border-2 border-palette-ink bg-palette-ink px-8 py-3 font-montserrat text-[11px] font-semibold uppercase tracking-[0.2em] text-palette-cream transition-colors duration-200 hover:border-palette-sage hover:bg-palette-sage hover:text-palette-ink"
              >
                Volver
              </Link>
              <Link
                href="/mentoria"
                className="inline-flex items-center justify-center rounded-full border-2 border-palette-stone/35 bg-white px-8 py-3 font-montserrat text-[11px] font-semibold uppercase tracking-[0.2em] text-palette-ink transition-colors duration-200 hover:border-palette-ink hover:bg-palette-cream/80"
              >
                Mentoría
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
      <Footer />
      </MainSideBar>
    );
  }

  return (
    <MainSideBar where="mentorship">
    <div
      className={`relative min-h-screen bg-palette-cream font-montserrat flex ${isPresupuestoStep ? 'items-start' : 'items-center'} justify-center pb-28 pt-[7rem] md:pt-28 md:pb-32`}
    >
      <ConsultaBackdrop />

      <div
        className={`relative z-10 mx-auto mb-8 flex min-h-[58vh] w-full max-w-2xl items-center justify-center px-4 md:px-6 ${isPresupuestoStep ? 'mt-0 md:mt-2' : ''}`}
      >
        <motion.form
          onSubmit={handleSubmit}
          className="w-full space-y-8 rounded-3xl border border-palette-stone/20 bg-white/95 p-7 shadow-[0_14px_48px_rgba(20,20,17,0.08)] backdrop-blur-md md:space-y-9 md:p-12"
          variants={boxVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <div className="text-center">
            <p className="mb-2 font-montserrat text-[10px] font-semibold uppercase tracking-[0.28em] text-palette-stone/75 md:text-[11px]">
              Mentoría
            </p>
            <motion.h1
              className="font-montserrat text-[1.65rem] font-semibold leading-[1.12] tracking-tight text-palette-ink sm:text-[1.85rem] md:text-[2.05rem]"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              Solicitud de mentoría
            </motion.h1>
          </div>
          {step === 0 && (
            <motion.p
              className="mx-auto mb-2 max-w-md text-center font-montserrat text-[14px] font-light leading-relaxed text-palette-stone md:text-[15px]"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              Completá este formulario para que pueda conocer tu situación. Me pondré en contacto para ver si la mentoría es lo
              que necesitás.
            </motion.p>
          )}
          <AnimatePresence mode="wait">
            <motion.div
              key={preguntaActual.name + step}
              variants={preguntaVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`w-full ${preguntaActual.name === 'presupuesto' ? 'my-6 md:my-8' : ''}`}
            >
              <label className="mb-3 block font-montserrat text-[15px] font-medium leading-snug text-palette-ink md:text-[16px]">
                {preguntaActual.label}
              </label>
              
              {preguntaActual.name === 'whatsapp' && (
                <div>
                  <p className="mb-3 font-montserrat text-[13px] font-light leading-relaxed text-palette-stone md:text-[14px]">
                    Elegí el prefijo de tu país y escribí el número sin el prefijo. Al enviar lo unimos como un solo contacto internacional.
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                    <div className="relative shrink-0 sm:w-[11.5rem]">
                      <select
                        name="whatsappDialCode-sel"
                        value={form.whatsappDialCode}
                        onChange={(e) => {
                          syncWhatsappField({ whatsappDialCode: e.target.value });
                          if (touched.whatsapp) {
                            const full = buildWhatsappFull(e.target.value, form.whatsappNationalNumber);
                            setErrors((prev) => ({
                              ...prev,
                              whatsapp: validators.whatsapp(full),
                            }));
                          }
                        }}
                        onBlur={() => handleBlur('whatsapp')}
                        aria-label="Prefijo país WhatsApp"
                        className={`${fieldClass(false, false)} cursor-pointer appearance-none pr-10 text-[14px]`}
                        autoFocus
                      >
                        {WHATSAPP_DIAL_CODES.map((p) => (
                          <option key={p.code} value={p.code}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                        <svg className="h-5 w-5 text-palette-stone/55" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    <input
                      type="tel"
                      name="whatsappNationalNumber-input"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      placeholder="Ej. 9 1234 5678"
                      value={form.whatsappNationalNumber}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^\d\s]/g, '');
                        syncWhatsappField({ whatsappNationalNumber: v });
                        if (touched.whatsapp) {
                          const full = buildWhatsappFull(form.whatsappDialCode, v);
                          setErrors((prev) => ({
                            ...prev,
                            whatsapp: validators.whatsapp(full),
                          }));
                        }
                      }}
                      onBlur={() => handleBlur('whatsapp')}
                      aria-label="Número de WhatsApp sin prefijo país"
                      className={`flex-1 ${fieldClass(!!errors.whatsapp && !!touched.whatsapp, !!touched.whatsapp)}`}
                    />
                  </div>
                  {form.whatsapp ? (
                    <p className="mt-3 font-montserrat text-[12px] text-palette-stone/85 md:text-[13px]" aria-live="polite">
                      Se enviará como: <span className="font-semibold tabular-nums text-palette-ink">{form.whatsapp}</span>
                    </p>
                  ) : null}
                  {errors.whatsapp && touched.whatsapp ? (
                    <p className="mt-2 flex items-center font-montserrat text-sm text-red-600">
                      <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.whatsapp}
                    </p>
                  ) : null}
                </div>
              )}

              {preguntaActual.type === 'text' && preguntaActual.name !== 'whatsapp' && (
                <div>
                  <input
                    type="text"
                    name={preguntaActual.name}
                    value={form[preguntaActual.name as keyof FormState] as string}
                    onChange={handleChange}
                    onBlur={() => handleBlur(preguntaActual.name)}
                    required={preguntaActual.required}
                    className={fieldClass(!!errors[preguntaActual.name], !!touched[preguntaActual.name])}
                    autoFocus
                  />
                  {errors[preguntaActual.name] && touched[preguntaActual.name] && (
                    <p className="text-red-600 text-sm mt-2 font-montserrat flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors[preguntaActual.name]}
                    </p>
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
                    className={fieldClass(!!errors[preguntaActual.name], !!touched[preguntaActual.name])}
                    autoFocus
                  />
                  {errors[preguntaActual.name] && touched[preguntaActual.name] && (
                    <p className="text-red-600 text-sm mt-2 font-montserrat flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors[preguntaActual.name]}
                    </p>
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
                    className={`${fieldClass(!!errors[preguntaActual.name], !!touched[preguntaActual.name])} min-h-[7.5rem] resize-none`}
                    autoFocus
                  />
                  {errors[preguntaActual.name] && touched[preguntaActual.name] && (
                    <p className="text-red-600 text-sm mt-1 font-montserrat">{errors[preguntaActual.name]}</p>
                  )}
                </div>
              )}
              
              {preguntaActual.type === 'select' && Array.isArray(preguntaActual.options) && (
                <>
                  <div className="relative">
                    <select
                      name={preguntaActual.name}
                      value={
                        preguntaActual.name === 'interesadoEn'
                          ? ((form.interesadoEn && form.interesadoEn[0]) || '')
                          : ((form[preguntaActual.name as keyof FormState] as string) ?? '')
                      }
                      onChange={handleChange}
                      onBlur={() => handleBlur(preguntaActual.name)}
                      required={preguntaActual.required}
                      className={`${fieldClass(!!errors[preguntaActual.name], !!touched[preguntaActual.name])} cursor-pointer appearance-none pr-12`}
                      autoFocus
                    >
                      {preguntaActual.name !== 'interesadoEn' ? (
                        <option value="" className="text-palette-stone/70">
                          Selecciona una opción
                        </option>
                      ) : null}
                      {preguntaActual.options.map((opt: string | SelectOptionKV) => {
                        const v = typeof opt === 'string' ? opt : opt.value;
                        const lab = typeof opt === 'string' ? opt : opt.label;
                        return (
                          <option key={v} value={v} className="text-palette-ink">
                            {lab}
                          </option>
                        );
                      })}
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 transition-transform duration-200">
                      <svg className="h-5 w-5 text-palette-stone/55" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  {preguntaActual.name === 'interesadoEn' && muestraPuenteMembresia ? (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="mt-6 rounded-2xl border border-palette-stone/22 bg-gradient-to-br from-palette-cream/95 to-white p-5 shadow-[0_10px_32px_rgba(20,20,17,0.07)] md:p-6"
                    >
                      <p className="font-montserrat text-[10px] font-semibold uppercase tracking-[0.24em] text-palette-stone/75 md:text-[11px]">
                        Membresía
                      </p>
                      <p className="mt-3 font-montserrat text-[15px] leading-relaxed text-palette-ink md:text-[16px]">
                        <strong className="font-semibold">Cuerpo Autónomo</strong> forma parte del recorrido de membresía. Ahí elegís tu plan según tus tiempos y objetivos.
                      </p>
                      <Link
                        href={ROUTE_MEMBERSHIP_SELECT_PLAN}
                        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-palette-ink bg-palette-ink px-6 py-3 font-montserrat text-[11px] font-semibold uppercase tracking-[0.2em] text-palette-cream transition-all duration-200 hover:border-palette-sage hover:bg-palette-sage hover:text-palette-ink sm:w-auto"
                      >
                        Ir a seleccionar plan
                        <span aria-hidden className="text-palette-cream/90">
                          →
                        </span>
                      </Link>
                      <p className="mt-4 font-montserrat text-[12px] font-light text-palette-stone md:text-[13px]">
                        Si después preferís aplicar solo a mentoría, cambiá arriba a <span className="font-medium text-palette-ink">Mentoría</span>.
                      </p>
                    </motion.div>
                  ) : null}
                  {errors[preguntaActual.name] && touched[preguntaActual.name] ? (
                    <p className="mt-2 flex items-center font-montserrat text-sm text-red-600">
                      <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors[preguntaActual.name]}
                    </p>
                  ) : null}
                </>
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
                          className="h-5 w-5 rounded-md border border-palette-stone/30 bg-white text-palette-ink transition-all duration-200 focus:ring-2 focus:ring-palette-sage/30"
                        />
                        <span className="text-palette-ink/90 font-montserrat">{opt}</span>
                      </label>
                    ))}
                  </div>
                  {errors[preguntaActual.name] && touched[preguntaActual.name] && (
                    <p className="text-red-600 text-sm mt-2 font-montserrat flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors[preguntaActual.name]}
                    </p>
                  )}
                </div>
              )}
              
              {preguntaActual.type === "radio" &&
                preguntaActual.name === "modalidad" &&
                Array.isArray(preguntaActual.options) &&
                preguntaActual.options.length > 0 && (
                <div>
                  <div className="space-y-3">
                    {preguntaActual.options.map((opt: any) => {
                      const optionValue = typeof opt === 'string' ? opt : opt.value;
                      const optionLabel = typeof opt === 'string' ? opt : opt.label;
                      return (
                        <label
                          key={optionValue}
                          className="flex cursor-pointer items-start gap-3 rounded-2xl border border-palette-stone/18 bg-white/85 p-4 shadow-[0_6px_22px_rgba(20,20,17,0.05)] transition-all duration-200 hover:border-palette-stone/32 hover:bg-palette-cream/65"
                        >
                          <input
                            type="radio"
                            name={preguntaActual.name}
                            value={optionValue}
                            checked={form.modalidad === optionValue}
                            onChange={() => handleRadioChange('modalidad', optionValue)}
                            className="mt-0.5 h-5 w-5 shrink-0 border border-palette-stone/30 bg-white text-palette-ink transition-all duration-200 focus:ring-2 focus:ring-palette-sage/30"
                          />
                          <span className="font-montserrat text-[15px] text-palette-ink/90">{optionLabel}</span>
                        </label>
                      );
                    })}
                  </div>
                  {errors.modalidad && touched.modalidad ? (
                    <p className="mt-2 flex items-center font-montserrat text-sm text-red-600">
                      <svg className="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.modalidad}
                    </p>
                  ) : null}
                </div>
              )}

              {preguntaActual.type === "radio" && preguntaActual.name === "presupuesto" && !plansLoaded && (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-palette-stone/25 border-t-palette-ink" />
                    <span className="text-palette-stone font-montserrat text-base">Cargando planes...</span>
                  </div>
                </div>
              )}
              
              {preguntaActual.type === "radio" && preguntaActual.name === "presupuesto" && plansLoaded && budgetOptions.length === 0 && (
                <div className="text-center text-palette-stone py-4">No hay planes activos disponibles en este momento.</div>
              )}

              {preguntaActual.type === "radio" && preguntaActual.name === "presupuesto" && budgetOptions.length > 0 && (
                <div>
                  <MentorshipConsultaBudgetOptions
                    options={budgetOptions}
                    name={preguntaActual.name}
                    value={String(form[preguntaActual.name as keyof FormState] ?? '')}
                    onChange={(next) => handleRadioChange(preguntaActual.name, next)}
                    error={errors[preguntaActual.name]}
                    showError={Boolean(touched[preguntaActual.name])}
                  />
       
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          
          {error && (
            <div className="mt-4 rounded-2xl border border-red-200/80 bg-red-50/90 p-4">
              <p className="flex items-center font-montserrat text-sm font-medium text-red-800">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            </div>
          )}
          
          {/* Botones de navegación */}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-between sm:gap-4">
            {step > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="w-full rounded-full border-2 border-palette-stone/35 bg-white px-7 py-3 font-montserrat text-[11px] font-semibold uppercase tracking-[0.2em] text-palette-ink transition-all duration-200 hover:border-palette-ink hover:bg-palette-cream/85 disabled:opacity-50 sm:w-auto sm:min-w-[9rem]"
              >
                Anterior
              </button>
            )}

            {step < preguntas.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={muestraPuenteMembresia}
                title={muestraPuenteMembresia ? 'Elegí mentoría para continuar esta solicitud, o entrá por el enlace de membresía' : undefined}
                className="group inline-flex w-full items-center justify-center gap-3 rounded-full border-2 border-palette-ink bg-palette-ink px-8 py-3 font-montserrat text-[11px] font-semibold uppercase tracking-[0.2em] text-palette-cream transition-all duration-200 hover:border-palette-sage hover:bg-palette-sage hover:text-palette-ink disabled:cursor-not-allowed disabled:opacity-40 sm:ml-auto sm:w-auto"
              >
                Siguiente
                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="group inline-flex w-full items-center justify-center gap-3 rounded-full border-2 border-palette-ink bg-palette-ink px-8 py-3 font-montserrat text-[11px] font-semibold uppercase tracking-[0.2em] text-palette-cream transition-all duration-200 hover:border-palette-sage hover:bg-palette-sage hover:text-palette-ink disabled:opacity-50 sm:ml-auto sm:w-auto"
              >
                {loading ? 'Enviando…' : 'Enviar solicitud'}
                {!loading && (
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            )}
          </div>
          
          {/* Indicador de progreso */}
          <div className="mt-8 border-t border-palette-stone/15 pt-6">
            <div className="mb-2 flex items-center justify-between font-montserrat text-[11px] font-medium uppercase tracking-[0.18em] text-palette-stone/80 sm:text-xs">
              <span>
                Paso {step + 1} / {preguntas.length}
              </span>
              <span className="tabular-nums text-palette-ink">{Math.round(((step + 1) / preguntas.length) * 100)}%</span>
            </div>
            <div className="relative h-[3px] w-full overflow-hidden rounded-full bg-palette-stone/15">
              <div
                className="h-full rounded-full bg-gradient-to-r from-palette-ink via-palette-ink to-palette-sage transition-all duration-500 ease-out"
                style={{ width: `${((step + 1) / preguntas.length) * 100}%` }}
              />
            </div>
          </div>
        </motion.form>
      </div>
    </div>
    <Footer />
    </MainSideBar>
  );
}