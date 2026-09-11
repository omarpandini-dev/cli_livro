import { ArrowLeft, ArrowRight, Maximize, Minimize, RotateCcw, Volume2, VolumeX } from 'lucide-react';

interface Props {
  page: number; total: number; muted: boolean; fullscreen: boolean; fullscreenSupported: boolean;
  onPrevious: () => void; onNext: () => void; onToggleMuted: () => void; onToggleFullscreen: () => void; onRestart: () => void;
}

export function ReaderControls(props: Props) {
  const { page, total, muted, fullscreen, fullscreenSupported, onPrevious, onNext, onToggleMuted, onToggleFullscreen, onRestart } = props;
  return (
    <div className="reader-controls" aria-label="Controles de leitura">
      <button className="control" onClick={onPrevious} disabled={page === 0} aria-label="Página anterior"><ArrowLeft /></button>
      <div className="reader-position" aria-live="polite"><span>Página {page + 1} de {total}</span><div className="progress-track"><i style={{ width: `${((page + 1) / total) * 100}%` }} /></div></div>
      <button className="control" onClick={onNext} disabled={page >= total - 1} aria-label="Próxima página"><ArrowRight /></button>
      <button className="control" onClick={onToggleMuted} aria-label={muted ? 'Ativar som' : 'Desativar som'}>{muted ? <VolumeX /> : <Volume2 />}<span>{muted ? 'Som desligado' : 'Som ligado'}</span></button>
      {fullscreenSupported && <button className="control" onClick={onToggleFullscreen} aria-label={fullscreen ? 'Sair da tela cheia' : 'Entrar em tela cheia'}>{fullscreen ? <Minimize /> : <Maximize />}<span>{fullscreen ? 'Sair' : 'Tela cheia'}</span></button>}
      <button className="control restart-control" onClick={onRestart} aria-label="Começar novamente"><RotateCcw /></button>
    </div>
  );
}
