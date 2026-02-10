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
  levelProgress?: number;
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
      const response = await fetch('/api/coherence/tracking', {
        credentials: 'include',
        cache: 'no-store'
      });

      if (!response.ok) {
        return;
      }

      const data = await response.json();
      
      if (data.success && data.tracking) {
        const rawMonthsCompleted = data.tracking.monthsCompleted ?? 0;
        // Usar directamente el nivel de la base de datos (ya viene calculado correctamente)
        // El nivel puede subir por meses completados o por U.C. completadas (cada 8 = 1 nivel)
        const rawLevel = data.tracking.level ?? 1;
        const displayLevel = rawLevel || 1; // Asegurar que sea al menos 1
        const displayIcon = data.tracking.gorillaIcon || '🦍';
        const displayName = data.tracking.evolutionName || 'Gorila Bebé';
        const displayProgress = data.tracking.progressToNextLevel || 0;
        const levelProgress = data.tracking.levelProgress !== undefined && data.tracking.levelProgress !== null ? data.tracking.levelProgress : 0;

        const newTracking = {
          totalUnits: data.tracking.totalUnits || 0,
          currentStreak: data.tracking.currentStreak || 0,
          longestStreak: data.tracking.longestStreak || 0,
          achievements: data.tracking.achievements || [],
          lastCompletedDate: data.tracking.lastCompletedDate,
          level: displayLevel,
          levelProgress: levelProgress,
          monthsCompleted: rawMonthsCompleted,
          characterEvolution: data.tracking.characterEvolution || 0,
          gorillaIcon: displayIcon,
          evolutionName: displayName,
          progressToNextLevel: displayProgress
        };
        
        setCoherenceTracking(newTracking);
        
        // Inicializar los Sets con los datos del servidor
        if (data.completedDays && Array.isArray(data.completedDays)) {
          setCompletedDays(new Set(data.completedDays));
        }
        
        if (data.completedWeeks && Array.isArray(data.completedWeeks)) {
          setCompletedWeeks(new Set(data.completedWeeks));
        }
        
        if (data.completedVideos && Array.isArray(data.completedVideos)) {
          setCompletedVideos(new Set(data.completedVideos));
        }
        
        if (data.completedAudios && Array.isArray(data.completedAudios)) {
          setCompletedAudios(new Set(data.completedAudios));
        }
      }
    } catch (error) {
      // Error silencioso
    }
  }, []);

  const markDayCompleted = useCallback((key: string) => {
    setCompletedDays(prev => {
      const nuevo = new Set(prev).add(key);
      return nuevo;
    });
  }, []);

  const markWeekCompleted = useCallback((key: string) => {
    setCompletedWeeks(prev => {
      const nuevo = new Set(prev).add(key);
      return nuevo;
    });
  }, []);

  const markVideoCompleted = useCallback((key: string, count: number = 1) => {
    setCompletedVideos(prev => {
      const nuevo = new Set(prev).add(key);
      return nuevo;
    });
  }, []);

  const markAudioCompleted = useCallback((key: string) => {
    setCompletedAudios(prev => {
      const nuevo = new Set(prev).add(key);
      return nuevo;
    });
  }, []);

  const updateTracking = useCallback((data: Partial<CoherenceTracking>) => {
    setCoherenceTracking(prev => {
      const rawMonthsCompleted = data.monthsCompleted ?? prev?.monthsCompleted ?? 0;
      // El nivel es independiente de monthsCompleted - usar el nivel que viene en data o mantener el anterior
      const rawLevel = data.level !== undefined && data.level !== null ? data.level : (prev?.level ?? 1);
      const displayLevel = rawLevel || 1;
      // El icono y nombre de evolución se basan en el nivel, no en monthsCompleted
      const displayIcon = data.gorillaIcon || prev?.gorillaIcon || '🦍';
      const displayName = data.evolutionName || prev?.evolutionName || 'Gorila Bebé';
      const displayProgress = data.progressToNextLevel ?? prev?.progressToNextLevel ?? 0;
      const levelProgress = data.levelProgress !== undefined && data.levelProgress !== null ? data.levelProgress : (prev?.levelProgress ?? 0);

      const nuevoTracking = !prev ? {
        totalUnits: data.totalUnits || 0,
        currentStreak: data.currentStreak || 0,
        longestStreak: data.longestStreak || 0,
        achievements: data.achievements || [],
        lastCompletedDate: data.lastCompletedDate,
        level: displayLevel,
        levelProgress: levelProgress,
        monthsCompleted: rawMonthsCompleted,
        gorillaIcon: displayIcon,
        evolutionName: displayName,
        progressToNextLevel: displayProgress,
        characterEvolution: data.characterEvolution ?? 0
      } : {
        ...prev,
        ...data,
        level: displayLevel,
        levelProgress: levelProgress,
        monthsCompleted: rawMonthsCompleted,
        gorillaIcon: displayIcon,
        evolutionName: displayName,
        progressToNextLevel: displayProgress,
        achievements: data.achievements !== undefined ? data.achievements : prev.achievements
      };
      
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

