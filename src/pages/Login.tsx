import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn, signUp, resetPassword } from '../services/authService';
import { useTheme } from '../context/ThemeContext';

function authErrorMessage(err: unknown, fallback: string): string {
  const code = (err as { code?: string })?.code;
  switch (code) {
    case 'auth/invalid-email':
      return 'El email no es válido.';
    case 'auth/missing-email':
      return 'Escribí tu email para recuperar la contraseña.';
    case 'auth/user-not-found':
      return 'No hay una cuenta con ese email.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Probá de nuevo en unos minutos.';
    case 'auth/network-request-failed':
      return 'Error de red. Revisá tu conexión.';
    default:
      return (err as { message?: string })?.message || fallback;
  }
}

export default function Login() {
  const navigate = useNavigate();
  const { theme, toggleTheme, headerColor } = useTheme();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      navigate('/');
    } catch (err: unknown) {
      setError(authErrorMessage(err, 'Error al autenticar'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    setInfo('');
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Escribí tu email para recuperar la contraseña.');
      return;
    }

    setResetting(true);
    try {
      await resetPassword(trimmed);
      setInfo('Te enviamos un email para restablecer la contraseña. Revisá también spam.');
    } catch (err: unknown) {
      setError(authErrorMessage(err, 'No se pudo enviar el email de recuperación'));
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="ui-panel p-6 sm:p-8 w-full max-w-md">
        <div className="flex items-center justify-between mb-6 gap-3">
          <h1 className="text-3xl font-bold text-ink tracking-tight flex items-center gap-3">
            <img
              src="/logo.png"
              alt=""
              width={48}
              height={48}
              className="w-12 h-12 shrink-0 rounded-md object-cover"
            />
            Movie NaPi
          </h1>
          <button
            onClick={toggleTheme}
            className="px-3 py-2 rounded-control flex items-center gap-2 text-xs transition-colors bg-surface-2 text-ink hover:bg-surface-3 border border-line"
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {theme === 'dark' ? (
              <svg
                key={theme}
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                className="w-4 h-4"
              >
                <path
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="64"
                  strokeDashoffset="64"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C15.53 21 18.59 18.96 20.06 16C20.06 16 14 17.5 11 13C8 8.5 12 3 12 3Z"
                >
                  <animate
                    fill="freeze"
                    attributeName="stroke-dashoffset"
                    dur="0.6s"
                    values="64;0"
                  />
                </path>
              </svg>
            ) : (
              <svg
                key={theme}
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                className="w-4 h-4"
              >
                <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2">
                  <path
                    strokeDasharray="34"
                    strokeDashoffset="34"
                    d="M12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7"
                  >
                    <animate
                      fill="freeze"
                      attributeName="stroke-dashoffset"
                      dur="0.4s"
                      values="34;0"
                    />
                  </path>
                  <g strokeDasharray="2" strokeDashoffset="2">
                    <path d="M0 0">
                      <animate
                        fill="freeze"
                        attributeName="d"
                        begin="0.5s"
                        dur="0.2s"
                        values="M12 19v1M19 12h1M12 5v-1M5 12h-1;M12 21v1M21 12h1M12 3v-1M3 12h-1"
                      />
                      <animate
                        fill="freeze"
                        attributeName="stroke-dashoffset"
                        begin="0.5s"
                        dur="0.2s"
                        values="2;0"
                      />
                    </path>
                    <path d="M0 0">
                      <animate
                        fill="freeze"
                        attributeName="d"
                        begin="0.7s"
                        dur="0.2s"
                        values="M17 17l0.5 0.5M17 7l0.5 -0.5M7 7l-0.5 -0.5M7 17l-0.5 0.5;M18.5 18.5l0.5 0.5M18.5 5.5l0.5 -0.5M5.5 5.5l-0.5 -0.5M5.5 18.5l-0.5 0.5"
                      />
                      <animate
                        fill="freeze"
                        attributeName="stroke-dashoffset"
                        begin="0.7s"
                        dur="0.2s"
                        values="2;0"
                      />
                    </path>
                  </g>
                </g>
              </svg>
            )}
            <span>{theme === 'dark' ? 'Modo oscuro' : 'Modo claro'}</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs mb-1.5 text-ink-muted ui-label">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-line rounded-control px-3 py-2.5 bg-surface-2 text-ink focus:outline-none focus-ring-header"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <label className="block text-xs text-ink-muted ui-label">
                Contraseña
              </label>
              {isLogin && (
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={loading || resetting}
                  className="text-xs font-medium transition-opacity hover:opacity-80 underline-offset-2 hover:underline disabled:opacity-50"
                  style={{ color: headerColor }}
                >
                  {resetting ? 'Enviando…' : 'Olvidé mi contraseña'}
                </button>
              )}
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-line rounded-control px-3 py-2.5 bg-surface-2 text-ink focus:outline-none focus-ring-header"
              required
              minLength={isLogin ? undefined : 6}
            />
          </div>

          {error && (
            <div className="px-4 py-3 rounded-control border border-danger/40 bg-danger/15 text-danger text-sm">
              {error}
            </div>
          )}

          {info && (
            <div className="px-4 py-3 rounded-control border border-emerald-500/40 bg-emerald-500/15 text-emerald-400 text-sm">
              {info}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || resetting}
            className="w-full py-2.5 btn-header-primary font-bold text-xs ui-label"
          >
            {loading ? 'Cargando...' : isLogin ? 'Iniciar Sesión' : 'Registrarse'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setInfo('');
            }}
            className="transition-opacity hover:opacity-80 underline-offset-2 hover:underline font-medium text-sm"
            style={{ color: headerColor }}
          >
            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}
