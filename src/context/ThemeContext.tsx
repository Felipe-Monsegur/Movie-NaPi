import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { saveUserTheme, getUserSettings, saveUserSettings } from '../services/firebaseService';

type Theme = 'dark' | 'light';

/** Color por defecto de la barrita en “Por ver” (amarillo tipo tarjeta) */
export const DEFAULT_LIST_ACCENT = '#eab308';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  headerColor: string;
  headerTitle: string;
  loginBgColor: string;
  headerColorDark: string;
  headerColorLight: string;
  /** Nombre en la lista Por ver (ej. Felipe, Naky) */
  displayName: string;
  /** Color de la barrita al añadir títulos en Por ver (película o serie) */
  listAccentColor: string;
  updateHeaderColorDark: (color: string) => Promise<void>;
  updateHeaderColorLight: (color: string) => Promise<void>;
  updateHeaderTitle: (title: string) => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
  updateListAccentColor: (color: string) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  toggleTheme: () => {},
  headerColor: '#5b21b6',
  headerTitle: 'Movie NaPi',
  loginBgColor: '#5b21b6',
  headerColorDark: '#5b21b6',
  headerColorLight: '#7c3aed',
  updateHeaderColorDark: async () => {},
  updateHeaderColorLight: async () => {},
  updateHeaderTitle: async () => {},
  displayName: '',
  listAccentColor: DEFAULT_LIST_ACCENT,
  updateDisplayName: async () => {},
  updateListAccentColor: async () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  // Cargar tema inicial de localStorage inmediatamente
  const getInitialTheme = (): Theme => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
    return 'dark'; // Tema por defecto
  };
  
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [loading, setLoading] = useState(!!user); // Solo loading si hay usuario
  const [headerColorDark, setHeaderColorDark] = useState<string>('#5b21b6');
  const [headerColorLight, setHeaderColorLight] = useState<string>('#7c3aed');
  const [headerTitle, setHeaderTitle] = useState<string>('Movie NaPi');
  const [displayName, setDisplayName] = useState<string>('');
  const [listAccentColor, setListAccentColor] = useState<string>(DEFAULT_LIST_ACCENT);

  // Color del header según el tema actual (calculado dinámicamente)
  const headerColor = theme === 'dark' ? headerColorDark : headerColorLight;
  
  // Colores según el tema
  const loginBgColor = theme === 'dark' ? '#5b21b6' : '#7c3aed';

  // Cargar tema y preferencias del usuario al iniciar sesión
  useEffect(() => {
    const loadTheme = async () => {
      if (user) {
        try {
          // Cargar todas las configuraciones del usuario
          const settings = await getUserSettings(user.uid);
          
          if (settings) {
            // Cargar tema
            if (settings.theme) {
              setTheme(settings.theme);
              localStorage.setItem('theme', settings.theme);
            } else {
              // Si no hay tema en Firestore, usar localStorage como fallback
              const localTheme = localStorage.getItem('theme') as Theme | null;
              if (localTheme === 'dark' || localTheme === 'light') {
                setTheme(localTheme);
                await saveUserTheme(user.uid, localTheme);
              }
            }
            
            // Cargar colores del header personalizados
            if (settings.headerColorDark) {
              setHeaderColorDark(settings.headerColorDark);
            }
            if (settings.headerColorLight) {
              setHeaderColorLight(settings.headerColorLight);
            }
            
            // Cargar título del header personalizado
            if (settings.headerTitle) {
              setHeaderTitle(settings.headerTitle);
            }
            if (settings.displayName) {
              setDisplayName(settings.displayName);
            } else {
              setDisplayName('');
            }
            if (
              settings.listAccentColor &&
              /^#[0-9A-Fa-f]{6}$/.test(settings.listAccentColor.trim())
            ) {
              setListAccentColor(settings.listAccentColor.trim());
            } else {
              setListAccentColor(DEFAULT_LIST_ACCENT);
            }
          }
        } catch (error) {
          console.error('Error al cargar configuraciones:', error);
          // En caso de error, usar localStorage como fallback
          const localTheme = localStorage.getItem('theme') as Theme | null;
          if (localTheme === 'dark' || localTheme === 'light') {
            setTheme(localTheme);
          }
        }
        setLoading(false);
      } else {
        setDisplayName('');
        setListAccentColor(DEFAULT_LIST_ACCENT);
        const savedTheme = localStorage.getItem('theme') as Theme | null;
        if (savedTheme === 'dark' || savedTheme === 'light') {
          setTheme(savedTheme);
        }
        setLoading(false);
      }
    };

    loadTheme();
  }, [user]);
  
  // Guardar tema cuando cambia
  const toggleTheme = async () => {
    const newTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    // Guardar siempre en localStorage inmediatamente
    localStorage.setItem('theme', newTheme);

    if (user) {
      try {
        await saveUserTheme(user.uid, newTheme);
        // También actualizar en userSettings
        await saveUserSettings(user.uid, { theme: newTheme });
      } catch (error) {
        console.error('Error al guardar tema:', error);
      }
    }
  };

  // Funciones para actualizar preferencias
  const updateHeaderColorDark = async (color: string) => {
    // Validar color antes de actualizar
    if (!color || !color.startsWith('#')) {
      console.error('Color inválido:', color);
      return;
    }
    
    setHeaderColorDark(color);
    
    // Guardar el color del header oscuro
    if (user) {
      try {
        await saveUserSettings(user.uid, { headerColorDark: color });
      } catch (error) {
        console.error('Error al guardar color del header oscuro:', error);
      }
    }
  };

  const updateHeaderColorLight = async (color: string) => {
    // Validar color antes de actualizar
    if (!color || !color.startsWith('#')) {
      console.error('Color inválido:', color);
      return;
    }
    
    setHeaderColorLight(color);
    
    // Guardar el color del header claro
    if (user) {
      try {
        await saveUserSettings(user.uid, { headerColorLight: color });
      } catch (error) {
        console.error('Error al guardar color del header claro:', error);
      }
    }
  };

  const updateHeaderTitle = async (title: string) => {
    setHeaderTitle(title);
    if (user) {
      try {
        await saveUserSettings(user.uid, { headerTitle: title });
      } catch (error) {
        console.error('Error al guardar título del header:', error);
      }
    }
  };

  const updateDisplayName = async (name: string) => {
    const trimmed = name.trim();
    setDisplayName(trimmed);
    if (user) {
      try {
        await saveUserSettings(user.uid, { displayName: trimmed });
      } catch (error) {
        console.error('Error al guardar nombre en lista:', error);
      }
    }
  };

  const updateListAccentColor = async (color: string) => {
    const trimmed = color.trim();
    if (!trimmed.startsWith('#') || !/^#[0-9A-Fa-f]{6}$/.test(trimmed)) {
      console.error('Color de lista inválido:', color);
      return;
    }
    setListAccentColor(trimmed);
    if (user) {
      try {
        await saveUserSettings(user.uid, { listAccentColor: trimmed });
      } catch (error) {
        console.error('Error al guardar color de lista:', error);
      }
    }
  };

  // Aplicar tema al body
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    } else {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    }
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.setProperty('--header-color', headerColor);
  }, [headerColor]);

  if (loading) {
    return null; // O un loader si prefieres
  }

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      headerColor, 
      headerTitle,
      loginBgColor,
      headerColorDark,
      headerColorLight,
      displayName,
      listAccentColor,
      updateHeaderColorDark,
      updateHeaderColorLight,
      updateHeaderTitle,
      updateDisplayName,
      updateListAccentColor,
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

