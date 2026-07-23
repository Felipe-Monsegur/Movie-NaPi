import { useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';
import { IconBan } from '../components/icons/AppIcons';

export default function NotAuthorized() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="ui-panel p-8 w-full max-w-md">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-panel bg-danger/15 text-danger">
            <IconBan size={36} className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-bold mb-4 text-ink">
            Acceso No Autorizado
          </h1>
          <p className="mb-6 text-ink-muted">
            Tu cuenta no tiene permiso para acceder a esta aplicación.
            Por favor, contacta al administrador para solicitar acceso.
          </p>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2.5 px-4 btn-header-primary font-bold text-xs ui-label inline-flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M18.75 15l3-3m0 0l-3-3m3 3H9"
              />
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
}
