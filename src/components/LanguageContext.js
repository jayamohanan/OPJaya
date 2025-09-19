import React, { createContext, useState, useEffect } from 'react';

export const LanguageContext = createContext({ lang: 'ml', setLang: () => {} });

export const LanguageProvider = ({ children }) => {
  // Default to Malayalam ('ml')
  const [lang, setLang] = useState(() => {
    const stored = localStorage.getItem('lang');
    return stored === 'en' ? 'en' : 'ml';
  });

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};
