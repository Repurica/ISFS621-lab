import type { ReactNode } from 'react';

interface MetaRowProps {
  left: ReactNode;
  right?: ReactNode;
  className?: string;
  bordered?: boolean;
}

export function MetaRow({ left, right, className, bordered = false }: MetaRowProps) {
  return (
    <div
      className={['meta-row', bordered ? 'meta-row--bordered' : '', className ?? '']
        .filter(Boolean)
        .join(' ')}
    >
      <div className="meta-row__left">{left}</div>
      {right ? <div className="meta-row__right">{right}</div> : null}
    </div>
  );
}

interface MoreButtonProps {
  onClick: () => void;
  className?: string;
}

export function MoreButton({ onClick, className }: MoreButtonProps) {
  return (
    <button
      type="button"
      className={['more-button', className ?? ''].filter(Boolean).join(' ')}
      onClick={onClick}
      aria-label="More options"
    >
      <span aria-hidden="true">•••</span>
    </button>
  );
}

export function Spinner() {
  return <span className="spinner" aria-hidden="true" />;
}
