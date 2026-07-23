import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme, DEFAULT_LIST_ACCENT } from '../context/ThemeContext';
import Modal from './Modal';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const fieldClass =
  'w-full px-3 py-2.5 rounded-control text-sm bg-surface-2 text-ink border border-line focus:outline-none focus-ring-header';
const labelClass = 'block text-xs text-ink-muted ui-label mb-1.5';
const hintClass = 'text-xs text-ink-muted mt-1.5 leading-relaxed';
const sectionClass = 'rounded-panel border border-line bg-surface-2/40 p-3.5 sm:p-4 space-y-3';

function ColorSwatches({
  colors,
  value,
  onPick,
}: {
  colors: { name: string; value: string }[];
  value: string;
  onPick: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
      {colors.map((preset) => {
        const active = value.toLowerCase() === preset.value.toLowerCase();
        return (
          <button
            key={preset.value}
            type="button"
            onClick={() => onPick(preset.value)}
            className={`h-8 sm:h-9 rounded-control border transition-all ${
              active
                ? 'border-white ring-2 ring-[var(--header-color)] scale-[1.03]'
                : 'border-line hover:border-line-strong'
            }`}
            style={{ backgroundColor: preset.value }}
            title={preset.name}
            aria-label={preset.name}
          />
        );
      })}
    </div>
  );
}

function ColorRow({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-11 h-10 rounded-control cursor-pointer border border-line bg-transparent shrink-0 overflow-hidden"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${fieldClass} font-mono`}
        placeholder={placeholder}
        maxLength={7}
        spellCheck={false}
      />
    </div>
  );
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

  const initial = (displayNameInput.trim() || user?.email || '?').charAt(0).toUpperCase();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configuración">
      <div className="space-y-4 sm:space-y-5">
        {/* Usuario */}
        <div className="flex items-center gap-3">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white text-lg font-bold"
            style={{
              background: `linear-gradient(135deg, var(--header-color), color-mix(in srgb, var(--header-color) 70%, #0f172a))`,
            }}
          >
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink truncate">
              {displayNameInput.trim() || 'Sin nombre'}
            </p>
            <p className="text-xs text-ink-muted truncate">{user?.email || 'No disponible'}</p>
          </div>
        </div>

        {/* Identidad */}
        <section className={sectionClass}>
          <h3 className="text-xs text-ink ui-label">Identidad</h3>
          <div>
            <label className={labelClass}>Nombre en la lista</label>
            <input
              type="text"
              value={displayNameInput}
              onChange={(e) => setDisplayNameInput(e.target.value)}
              className={fieldClass}
              placeholder="Ej. Felipe o Naky"
              maxLength={40}
              autoComplete="nickname"
            />
            <p className={hintClass}>
              Así aparece al añadir títulos en Por ver.
            </p>
          </div>
          <div>
            <label className={labelClass}>Título del header</label>
            <input
              type="text"
              value={titleInput}
              onChange={(e) => setTitleInput(e.target.value)}
              className={fieldClass}
              placeholder="Movie NaPi"
              maxLength={50}
            />
            <p className={hintClass}>{titleInput.length}/50</p>
          </div>
        </section>

        {/* Lista Por ver */}
        <section className={sectionClass}>
          <h3 className="text-xs text-ink ui-label">Lista Por ver</h3>
          <div>
            <label className={labelClass}>Color de tu barrita</label>
            <ColorRow
              value={listAccentInput}
              onChange={setListAccentInput}
              placeholder="#eab308"
            />
          </div>
          <div
            className="flex overflow-hidden rounded-control border border-line"
            aria-hidden
          >
            <div
              className="w-2.5 shrink-0 self-stretch min-h-[3.25rem]"
              style={{ backgroundColor: listAccentInput }}
            />
            <div className="flex-1 px-3 py-2.5 text-xs bg-surface text-ink">
              <span className="font-semibold block">Vista previa</span>
              <span className="text-ink-muted">Así se verá cada título que añadas</span>
            </div>
          </div>
          <ColorSwatches
            colors={listBarPresets}
            value={listAccentInput}
            onPick={setListAccentInput}
          />
        </section>

        {/* Apariencia */}
        <section className={sectionClass}>
          <h3 className="text-xs text-ink ui-label">Apariencia</h3>

          <div>
            <label className={labelClass}>Tema</label>
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-full border border-line bg-surface">
              <button
                type="button"
                onClick={() => {
                  if (theme !== 'dark') toggleTheme();
                }}
                className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs sm:text-sm font-semibold transition-colors ${
                  theme === 'dark'
                    ? 'text-white'
                    : 'text-ink-muted hover:text-ink'
                }`}
                style={
                  theme === 'dark'
                    ? {
                        background: `color-mix(in srgb, var(--header-color) 85%, #0f172a)`,
                      }
                    : undefined
                }
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
                Oscuro
              </button>
              <button
                type="button"
                onClick={() => {
                  if (theme !== 'light') toggleTheme();
                }}
                className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs sm:text-sm font-semibold transition-colors ${
                  theme === 'light'
                    ? 'text-white'
                    : 'text-ink-muted hover:text-ink'
                }`}
                style={
                  theme === 'light'
                    ? {
                        background: `color-mix(in srgb, var(--header-color) 85%, #0f172a)`,
                      }
                    : undefined
                }
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                Claro
              </button>
            </div>
          </div>

          <div>
            <label className={labelClass}>Color header · oscuro</label>
            <ColorRow
              value={colorDarkInput}
              onChange={setColorDarkInput}
              placeholder="#A80000"
            />
            <div className="mt-2">
              <ColorSwatches
                colors={presetColors}
                value={colorDarkInput}
                onPick={setColorDarkInput}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Color header · claro</label>
            <ColorRow
              value={colorLightInput}
              onChange={setColorLightInput}
              placeholder="#1e3a8a"
            />
            <div className="mt-2">
              <ColorSwatches
                colors={presetColors}
                value={colorLightInput}
                onPick={setColorLightInput}
              />
            </div>
          </div>
        </section>

        {/* Acciones */}
        <div className="flex gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-control text-sm font-semibold transition-colors bg-surface-2 text-ink border border-line hover:bg-surface-3"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2.5 rounded-control text-sm font-semibold btn-header-primary"
          >
            {saving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
