// Tipos compartidos para la aplicación

export interface Lead {
  _id?: string;
  nombre: string;
  email: string;
  empresa?: string;
  telefono?: string;
  mensaje?: string;
  estado: 'nuevo' | 'contactado' | 'convertido' | 'descartado';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ContactFormData {
  nombre: string;
  email: string;
  empresa?: string;
  telefono?: string;
  mensaje?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}



