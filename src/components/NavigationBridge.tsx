import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { setNavigator } from '../utils/navigation';

/**
 * Registers react-router's navigate function with the legacy navigateTo utility.
 * Place this once inside BrowserRouter.
 */
export const NavigationBridge: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setNavigator((path: string) => navigate(path));
  }, [navigate]);

  return null;
};
