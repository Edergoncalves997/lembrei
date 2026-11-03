import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from './supabase';

type Estado = { session: Session | null; carregando: boolean };
const SessaoContext = createContext<Estado>({ session: null, carregando: true });

export function SessaoProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>({ session: null, carregando: true });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setEstado({ session: data.session, carregando: false }));
    const { data } = supabase.auth.onAuthStateChange((_evento, session) => setEstado({ session, carregando: false }));
    return () => data.subscription.unsubscribe();
  }, []);

  return <SessaoContext.Provider value={estado}>{children}</SessaoContext.Provider>;
}

export const useSessao = () => useContext(SessaoContext);
