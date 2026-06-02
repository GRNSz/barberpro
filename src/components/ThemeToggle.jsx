import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';
import './ThemeToggle.css';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
      title={theme === 'dark' ? 'Modo claro' : 'Modo escuro'}
    >
      <div className={`theme-toggle-track ${theme}`}>
        <div className="theme-toggle-thumb">
          {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
        </div>
      </div>
    </button>
  );
}
