import { BookOpen, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Logo() {
  return (
    <Link className="logo" to="/" aria-label="Mundo Encantado — início">
      <span className="logo-mark"><BookOpen aria-hidden="true" /><Sparkles aria-hidden="true" /></span>
      <span>Mundo <strong>Encantado</strong></span>
    </Link>
  );
}
