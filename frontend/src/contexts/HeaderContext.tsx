import { createContext, useContext, useState, ReactNode } from 'react';

interface HeaderContent {
  middle?: ReactNode;
  right?: ReactNode;
}

interface HeaderContextType {
  setHeaderContent: (content: HeaderContent) => void;
  headerContent: HeaderContent;
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined);

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [headerContent, setHeaderContent] = useState<HeaderContent>({});

  return (
    <HeaderContext.Provider value={{ headerContent, setHeaderContent }}>
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeader() {
  const context = useContext(HeaderContext);
  if (context === undefined) {
    throw new Error('useHeader must be used within a HeaderProvider');
  }
  return context;
}

