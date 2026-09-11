import { ArrowLeft, BookOpen, Library, RotateCcw, Sparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
  onRestart: () => void;
  onPrevious: () => void;
  onClose: () => void;
}

export function EndAdventure({ onRestart, onPrevious, onClose }: Props) {
  return (
    <div className="end-adventure" role="dialog" aria-modal="true" aria-labelledby="end-adventure-title">
      <button className="close-end-adventure" onClick={onClose} aria-label="Continuar lendo a última página"><X /></button>
      <Sparkles />
      <h2 id="end-adventure-title">Fim da aventura</h2>
      <p>Que história incrível! Quer viver mais um pouquinho dessa magia?</p>
      <div>
        <button onClick={onRestart}><RotateCcw />Ler novamente</button>
        <button className="secondary-end-action" onClick={onPrevious}><ArrowLeft />Voltar uma página</button>
        <Link to="/"><BookOpen />Mundo Encantado</Link>
        <Link to="/books"><Library />Outra história</Link>
      </div>
    </div>
  );
}
