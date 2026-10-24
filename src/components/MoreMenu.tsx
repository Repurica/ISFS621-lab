import { ResetIcon, SoundIcon } from './icons';
import { Sheet } from './Sheet';

interface MoreMenuProps {
  open: boolean;
  onClose: () => void;
  soundOn: boolean;
  onToggleSound: () => void;
  onRestart: () => void;
}

export function MoreMenu({ open, onClose, soundOn, onToggleSound, onRestart }: MoreMenuProps) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Prototype controls"
      subtitle="CDC Vouchers 2027 · scan-to-pay demo"
      footer={
        <button type="button" className="sheet-done" onClick={onClose}>
          Done
        </button>
      }
    >
      <div className="menu-list">
        <button type="button" className="menu-row" onClick={onRestart}>
          <span className="menu-row__icon">
            <ResetIcon />
          </span>
          <span className="menu-row__copy">
            <strong>Restart demo</strong>
            <small>Clear balances and return to login.</small>
          </span>
        </button>

        <button
          type="button"
          className="menu-row"
          role="switch"
          aria-checked={soundOn}
          onClick={onToggleSound}
        >
          <span className="menu-row__icon">
            <SoundIcon off={!soundOn} />
          </span>
          <span className="menu-row__copy">
            <strong>Sound effects</strong>
            <small>Play a confirmation chime for the retailer.</small>
          </span>
          <span className="switch" data-on={soundOn ? 'true' : 'false'} aria-hidden="true" />
        </button>
      </div>

      <p className="menu-note">
        This is a simulation. No real vouchers, payments, or Singpass credentials are used.
      </p>
    </Sheet>
  );
}
