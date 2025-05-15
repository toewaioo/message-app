import type { ReactNode } from 'react';

interface AppContainerProps {
  children: ReactNode;
}

const AppContainer = ({ children }: AppContainerProps) => {
  return (
    <main className="container mx-auto px-4 py-8 flex-grow">
      {children}
    </main>
  );
};

export default AppContainer;
