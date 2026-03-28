import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme, DEFAULT_LIST_ACCENT } from '../context/ThemeContext';
import Modal from './Modal';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user } = useAuth();
  const {
    theme,
    toggleTheme,
    headerColorDark,
    headerColorLight,
    headerTitle,
    displayName,
    listAccentColor,
    updateHeaderColorDark,
    updateHeaderColorLight,
    updateHeaderTitle,
    updateDisplayName,
    updateListAccentColor,
  } = useTheme();
  const [colorDarkInput, setColorDarkInput] = useState(headerColorDark);
  const [colorLightInput, setColorLightInput] = useState(headerColorLight);
  const [titleInput, setTitleInput] = useState(headerTitle);
  const [displayNameInput, setDisplayNameInput] = useState(displayName);
  const [listAccentInput, setListAccentInput] = useState(listAccentColor);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setColorDarkInput(headerColorDark);
      setColorLightInput(headerColorLight);
      setTitleInput(headerTitle);
      setDisplayNameInput(displayName);
      setListAccentInput(listAccentColor);
    }
  }, [isOpen, headerColorDark, headerColorLight, headerTitle, displayName, listAccentColor]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateHeaderColorDark(colorDarkInput);
      await updateHeaderColorLight(colorLightInput);
      await updateHeaderTitle(titleInput);
      await updateDisplayName(displayNameInput);
      const accentRaw = listAccentInput.trim();
      const accentFinal = /^#[0-9A-Fa-f]{6}$/.test(accentRaw) ? accentRaw : DEFAULT_LIST_ACCENT;
      await updateListAccentColor(accentFinal);
      onClose();
    } catch (error) {
      console.error('Error al guardar preferencias:', error);
    } finally {
      setSaving(false);
    }
  };

  const presetColors = [
    { name: 'Rojo', value: '#A80000' },
    { name: 'Azul', value: '#1e3a8a' },
    { name: 'Verde', value: '#059669' },
    { name: 'Morado', value: '#7c3aed' },
    { name: 'Naranja', value: '#ea580c' },
    { name: 'Rosa', value: '#db2777' },
    { name: 'Cian', value: '#0891b2' },
    { name: 'Amarillo', value: '#ca8a04' },
  ];

  const listBarPresets = [
    { name: 'Amarillo', value: '#eab308' },
    { name: 'Lima', value: '#84cc16' },
    { name: 'Cian', value: '#06b6d4' },
    { name: 'Rosa', value: '#ec4899' },
    { name: 'Violeta', value: '#8b5cf6' },
    { name: 'Naranja', value: '#f97316' },
    { name: 'Rojo', value: '#ef4444' },
    { name: 'Azul', value: '#3b82f6' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mi Perfil">
      <div className="space-y-3 sm:space-y-6">
        {/* Email */}
        <div>
          <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Email
          </label>
          <div className={`px-2 py-1.5 rounded-lg text-xs sm:text-sm ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
            {user?.email || 'No disponible'}
          </div>
        </div>

        {/* Nombre en la lista */}
        <div>
          <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Tu nombre en la lista
          </label>
          <input
            type="text"
            value={displayNameInput}
            onChange={(e) => setDisplayNameInput(e.target.value)}
            className={`w-full px-2 py-1.5 rounded-lg text-xs sm:text-sm ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'} border focus:outline-none focus-ring-header`}
            placeholder="Ej. Felipe o Naky"
            maxLength={40}
            autoComplete="nickname"
          />
          <p className={`text-xs mt-0.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Así se muestra al añadir títulos en Por ver (no se usa el email).
          </p>
        </div>

        {/* Barrita en Por ver */}
        <div>
          <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Color de tu barrita (lista Por ver)
          </label>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="color"
              value={listAccentInput}
              onChange={(e) => setListAccentInput(e.target.value)}
              className="w-10 h-8 sm:w-14 sm:h-9 rounded cursor-pointer border-2 border-gray-300 flex-shrink-0"
            />
            <input
              type="text"
              value={listAccentInput}
              onChange={(e) => setListAccentInput(e.target.value)}
              className={`flex-1 px-2 py-1.5 rounded-lg text-xs sm:text-sm font-mono ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'} border focus:outline-none focus-ring-header`}
              placeholder="#eab308"
              maxLength={7}
            />
          </div>
          <div
            className={`flex rounded-lg overflow-hidden border mb-2 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}
            aria-hidden
          >
            <div className="w-2 sm:w-2.5 shrink-0 self-stretch min-h-[3rem]" style={{ backgroundColor: listAccentInput }} />
            <div
              className={`flex-1 px-3 py-2.5 text-xs ${theme === 'dark' ? 'bg-gray-800 text-gray-200' : 'bg-gray-50 text-gray-800'}`}
            >
              <span className="font-semibold block">Vista previa</span>
              <span className="opacity-80">Así se verá cada película o serie que añadas vos</span>
            </div>
          </div>
          <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Predefinidos:</p>
          <div className="grid grid-cols-4 gap-1.5">
            {listBarPresets.map((preset) => (
              <button
                key={preset.value}
                type="button"
                onClick={() => setListAccentInput(preset.value)}
                className={`h-7 sm:h-9 rounded-lg border-2 transition-all ${
                  listAccentInput.toLowerCase() === preset.value.toLowerCase()
                    ? 'border-white ring-2 ring-[var(--header-color)] scale-105'
                    : theme === 'dark'
                      ? 'border-gray-600 hover:border-gray-500'
                      : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ backgroundColor: preset.value }}
                title={preset.name}
              />
            ))}
          </div>
        </div>

        {/* Color del Header - Modo Oscuro */}
        <div>
          <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Color Header (Oscuro)
          </label>
          <div className="space-y-2">
            {/* Input de color */}
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colorDarkInput}
                onChange={(e) => setColorDarkInput(e.target.value)}
                className="w-10 h-8 sm:w-16 sm:h-10 rounded cursor-pointer border-2 border-gray-300 flex-shrink-0"
              />
              <input
                type="text"
                value={colorDarkInput}
                onChange={(e) => setColorDarkInput(e.target.value)}
                className={`flex-1 px-2 py-1.5 rounded-lg text-xs sm:text-sm ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'} border focus:outline-none focus-ring-header`}
                placeholder="#A80000"
              />
            </div>
            
            {/* Colores predefinidos */}
            <div>
              <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Predefinidos:
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {presetColors.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setColorDarkInput(preset.value)}
                    className={`h-7 sm:h-10 rounded-lg border-2 transition-all ${
                      colorDarkInput === preset.value
                        ? 'border-white ring-2 ring-[var(--header-color)] scale-105'
                        : theme === 'dark'
                        ? 'border-gray-600 hover:border-gray-500'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: preset.value }}
                    title={preset.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Color del Header - Modo Claro */}
        <div>
          <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Color Header (Claro)
          </label>
          <div className="space-y-2">
            {/* Input de color */}
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colorLightInput}
                onChange={(e) => setColorLightInput(e.target.value)}
                className="w-10 h-8 sm:w-16 sm:h-10 rounded cursor-pointer border-2 border-gray-300 flex-shrink-0"
              />
              <input
                type="text"
                value={colorLightInput}
                onChange={(e) => setColorLightInput(e.target.value)}
                className={`flex-1 px-2 py-1.5 rounded-lg text-xs sm:text-sm ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'} border focus:outline-none focus-ring-header`}
                placeholder="#1e3a8a"
              />
            </div>
            
            {/* Colores predefinidos */}
            <div>
              <p className={`text-xs mb-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Predefinidos:
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {presetColors.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => setColorLightInput(preset.value)}
                    className={`h-7 sm:h-10 rounded-lg border-2 transition-all ${
                      colorLightInput === preset.value
                        ? 'border-white ring-2 ring-[var(--header-color)] scale-105'
                        : theme === 'dark'
                        ? 'border-gray-600 hover:border-gray-500'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: preset.value }}
                    title={preset.name}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tema */}
        <div>
          <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Tema
          </label>
          <div className="flex gap-2">
            <button
              onClick={toggleTheme}
              className={`flex-1 px-3 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1.5 text-xs sm:text-sm ${
                theme === 'dark'
                  ? 'bg-gray-700 text-white hover:bg-gray-600'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              {theme === 'dark' ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <span className="hidden sm:inline">Modo Oscuro</span>
                  <span className="sm:hidden">Oscuro</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="hidden sm:inline">Modo Claro</span>
                  <span className="sm:hidden">Claro</span>
                </>
              )}
            </button>
          </div>
          <p className={`text-xs mt-0.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            Cambia entre modo oscuro y modo claro.
          </p>
        </div>

        {/* Título del Header */}
        <div>
          <label className={`block text-xs font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
            Título del Header
          </label>
          <input
            type="text"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            className={`w-full px-2 py-1.5 rounded-lg text-xs sm:text-sm ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'} border focus:outline-none focus-ring-header`}
            placeholder="Movie NaPi"
            maxLength={50}
          />
          <p className={`text-xs mt-0.5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            {titleInput.length}/50 caracteres
          </p>
        </div>

        {/* Botones */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={onClose}
            className={`flex-1 px-3 py-1.5 rounded-lg transition-colors text-xs sm:text-sm ${
              theme === 'dark'
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-3 py-1.5 rounded-lg text-xs sm:text-sm btn-header-primary font-medium"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

