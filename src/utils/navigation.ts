// Navigation utility compatible with react-router-dom
// Used by components that can't directly use useNavigate hook

let _navigate: ((path: string) => void) | null = null;

export const setNavigator = (fn: (path: string) => void) => {
  _navigate = fn;
};

export const navigateTo = (path: string, e?: React.MouseEvent) => {
  if (e) e.preventDefault();

  // Hash links — scroll to section
  if (path.startsWith('#')) {
    const el = document.getElementById(path.slice(1));
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  if (_navigate) {
    _navigate(path);
  } else if (typeof window !== 'undefined') {
    // Fallback for pre-router-init
    window.location.href = path;
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
};
