import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'passenger' | 'driver' | 'admin';

interface User {
  id: number;
  nome: string;
  status?: string;
}

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  user: User | null;
  setUser: (user: User | null) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<UserRole>('passenger');
  const [user, setUser] = useState<User | null>(null);

  return (
    <RoleContext.Provider value={{ role, setRole, user, setUser }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};
