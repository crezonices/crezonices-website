import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
type Theme = 'light' | 'dark';
const ThemeContext = createContext<{theme:Theme;toggleTheme:()=>void}>({theme:'light',toggleTheme:()=>undefined});
export function ThemeProvider({children}:{children:ReactNode}) { const [theme,setTheme]=useState<Theme>(()=>(document.documentElement.dataset.theme as Theme)||'light'); useEffect(()=>{document.documentElement.dataset.theme=theme; localStorage.setItem('crezonices-theme',theme)},[theme]); return <ThemeContext.Provider value={{theme,toggleTheme:()=>setTheme(t=>t==='dark'?'light':'dark')}}>{children}</ThemeContext.Provider> }
export const useTheme=()=>useContext(ThemeContext);
