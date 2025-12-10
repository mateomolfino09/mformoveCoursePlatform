'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface Achievement {
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

interface CoherenceTracking {
  totalUnits: number;
  currentStreak: number;
  longestStreak: number;
  achievements: Achievement[];
  lastCompletedDate?: string;
  level?: number;
  monthsCompleted?: number;
  characterEvolution?: number;
  gorillaIcon?: string;
  evolutionName?: string;
  progressToNextLevel?: number;
}

interface CoherenceContextType {
  completedDays: Set<string>;
  completedWeeks: Set<string>;
  completedVideos: Set<string>;
  completedAudios: Set<string>;
  coherenceTracking: CoherenceTracking | null;
  monthProgress: number;
  fetchCoherenceTracking: () => Promise<void>;
  markDayCompleted: (key: string) => void;
  markWeekCompleted: (key: string) => void;
  markVideoCompleted: (key: string, count?: number) => void;
  markAudioCompleted: (key: string) => void;
  updateTracking: (data: Partial<CoherenceTracking>) => void;
  updateMonthProgress: (progress: number) => void;
}

const CoherenceContext = createContext<CoherenceContextType | undefined>(undefined);

export function CoherenceProvider({ children }: { children: React.ReactNode }) {
  const [completedDays, setCompletedDays] = useState<Set<string>>(new Set());
  const [completedWeeks, setCompletedWeeks] = useState<Set<string>>(new Set());
  const [completedVideos, setCompletedVideos] = useState<Set<string>>(new Set());
  const [completedAudios, setCompletedAudios] = useState<Set<string>>(new Set());
  const [coherenceTracking, setCoherenceTracking] = useState<CoherenceTracking | null>(null);
  const [monthProgress, setMonthProgress] = useState<number>(0);

  const fetchCoherenceTracking = useCallback(async () => {
    try {
      console.log('[CoherenceContext] fetchCoherenceTracking: Iniciando petición');
      
      const response = await fetch('/api/coherence/tracking', {
        credentials: 'include',
        cache: 'no-store'
      });

      if (!response.ok) {
        console.error('[CoherenceContext] fetchCoherenceTracking: Error en respuesta', response.status);
        return;
      }

      const data = await response.json();
      console.log('[CoherenceContext] fetchCoherenceTracking: Datos recibidos', {
        success: data.success,
        totalUnits: data.tracking?.totalUnits,
        completedDaysCount: data.completedDays?.length || 0,
        completedWeeksCount: data.completedWeeks?.length || 0,
        completedVideosCount: data.completedVideos?.length || 0,
        completedAudiosCount: data.completedAudios?.length || 0,
        completedDays: data.completedDays,
        completedWeeks: data.completedWeeks,
        completedVideos: data.completedVideos,
        completedAudios: data.completedAudios
      });
      
      if (data.success && data.tracking) {
        setCoherenceTracking({
          totalUnits: data.tracking.totalUnits || 0,
          currentStreak: data.tracking.currentStreak || 0,
          longestStreak: data.tracking.longestStreak || 0,
          achievements: data.tracking.achievements || [],
          lastCompletedDate: data.tracking.lastCompletedDate,
          level: data.tracking.level || 1,
          monthsCompleted: data.tracking.monthsCompleted || 0,
          characterEvolution: data.tracking.characterEvolution || 0,
          gorillaIcon: data.tracking.gorillaIcon || '🦍',
          evolutionName: data.tracking.evolutionName || 'Gorila Bebé',
          progressToNextLevel: data.tracking.progressToNextLevel || 0
        });
        
        console.log('[CoherenceContext] fetchCoherenceTracking: Tracking actualizado', {
          totalUnits: data.tracking.totalUnits || 0
        });
        
        // Inicializar los Sets con los datos del servidor
        if (data.completedDays && Array.isArray(data.completedDays)) {
          console.log('[CoherenceContext] fetchCoherenceTracking: Inicializando completedDays', {
            count: data.completedDays.length,
            items: data.completedDays
          });
          setCompletedDays(new Set(data.completedDays));
        } else {
          console.log('[CoherenceContext] fetchCoherenceTracking: No hay completedDays o no es array', {
            hasData: !!data.completedDays,
            isArray: Array.isArray(data.completedDays),
            type: typeof data.completedDays
          });
        }
        
        if (data.completedWeeks && Array.isArray(data.completedWeeks)) {
          console.log('[CoherenceContext] fetchCoherenceTracking: Inicializando completedWeeks', {
            count: data.completedWeeks.length,
            items: data.completedWeeks
          });
          setCompletedWeeks(new Set(data.completedWeeks));
        } else {
          console.log('[CoherenceContext] fetchCoherenceTracking: No hay completedWeeks o no es array');
        }
        
        if (data.completedVideos && Array.isArray(data.completedVideos)) {
          console.log('[CoherenceContext] fetchCoherenceTracking: Inicializando completedVideos', {
            count: data.completedVideos.length,
            items: data.completedVideos
          });
          setCompletedVideos(new Set(data.completedVideos));
        } else {
          console.log('[CoherenceContext] fetchCoherenceTracking: No hay completedVideos o no es array');
        }
        
        if (data.completedAudios && Array.isArray(data.completedAudios)) {
          console.log('[CoherenceContext] fetchCoherenceTracking: Inicializando completedAudios', {
            count: data.completedAudios.length,
            items: data.completedAudios
          });
          setCompletedAudios(new Set(data.completedAudios));
        } else {
          console.log('[CoherenceContext] fetchCoherenceTracking: No hay completedAudios o no es array');
        }
      } else {
        console.log('[CoherenceContext] fetchCoherenceTracking: No hay datos válidos en la respuesta');
      }
    } catch (error) {
      console.error('[CoherenceContext] fetchCoherenceTracking: Error obteniendo tracking', error);
    }
  }, []);

  const markDayCompleted = useCallback((key: string) => {
    console.log('[CoherenceContext] markDayCompleted', { key });
    setCompletedDays(prev => {
      const nuevo = new Set(prev).add(key);
      console.log('[CoherenceContext] markDayCompleted: Nuevo Set', Array.from(nuevo));
      return nuevo;
    });
  }, []);

  const markWeekCompleted = useCallback((key: string) => {
    console.log('[CoherenceContext] markWeekCompleted', { key });
    setCompletedWeeks(prev => {
      const nuevo = new Set(prev).add(key);
      console.log('[CoherenceContext] markWeekCompleted: Nuevo Set', Array.from(nuevo));
      return nuevo;
    });
  }, []);

  const markVideoCompleted = useCallback((key: string, count: number = 1) => {
    console.log('[CoherenceContext] markVideoCompleted', { key, count });
    setCompletedVideos(prev => {
      const nuevo = new Set(prev).add(key);
      console.log('[CoherenceContext] markVideoCompleted: Nuevo Set', Array.from(nuevo));
      return nuevo;
    });
  }, []);

  const markAudioCompleted = useCallback((key: string) => {
    console.log('[CoherenceContext] markAudioCompleted', { key });
    setCompletedAudios(prev => {
      const nuevo = new Set(prev).add(key);
      console.log('[CoherenceContext] markAudioCompleted: Nuevo Set', Array.from(nuevo));
      return nuevo;
    });
  }, []);

  const updateTracking = useCallback((data: Partial<CoherenceTracking>) => {
    console.log('[CoherenceContext] updateTracking: Actualizando tracking', {
      dataRecibido: data
    });
    
    setCoherenceTracking(prev => {
      const nuevoTracking = !prev ? {
        totalUnits: data.totalUnits || 0,
        currentStreak: data.currentStreak || 0,
        longestStreak: data.longestStreak || 0,
        achievements: data.achievements || [],
        lastCompletedDate: data.lastCompletedDate
      } : {
        ...prev,
        ...data,
        achievements: data.achievements !== undefined ? data.achievements : prev.achievements
      };
      
      console.log('[CoherenceContext] updateTracking: Nuevo tracking establecido', {
        totalUnits: nuevoTracking.totalUnits,
        currentStreak: nuevoTracking.currentStreak,
        longestStreak: nuevoTracking.longestStreak
      });
      return nuevoTracking;
    });
  }, []);

  const updateMonthProgress = useCallback((progress: number) => {
    setMonthProgress(progress);
  }, []);

  const value: CoherenceContextType = {
    completedDays,
    completedWeeks,
    completedVideos,
    completedAudios,
    coherenceTracking,
    monthProgress,
    fetchCoherenceTracking,
    markDayCompleted,
    markWeekCompleted,
    markVideoCompleted,
    markAudioCompleted,
    updateTracking,
    updateMonthProgress
  };

  return (
    <CoherenceContext.Provider value={value}>
      {children}
    </CoherenceContext.Provider>
  );
}

export function useCoherence() {
  const context = useContext(CoherenceContext);
  if (context === undefined) {
    throw new Error('useCoherence debe ser usado dentro de un CoherenceProvider');
  }
  return context;
}

