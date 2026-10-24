import { useEffect, useRef, useState } from 'react';
import { AssetIcon, ScanIcon } from '../components/icons';
import { MetaRow, MoreButton } from '../components/ScreenChrome';
import { Sheet } from '../components/Sheet';
import { useCamera } from '../hooks/useCamera';
import {
  formatOfflineCode,
  generateOfflineCode,
} from '../lib/payment';

interface ScanScreenProps {
  onScanned: () => void;
  onCancel: () => void;
  onOpenMenu: () => void;
}

export function ScanScreen({ onScanned, onCancel, onOpenMenu }: ScanScreenProps) {
  const { videoRef, status, message, torchOn, toggleTorch, retry } = useCamera();
  const [scanning, setScanning] = useState(false);
  const [offlineOpen, setOfflineOpen] = useState(false);
  const [offlineCode, setOfflineCode] = useState(generateOfflineCode);
  const [secondsLeft, setSecondsLeft] = useState(60);
  const scanTimer = useRef<number | null>(null);
  const cameraActive = status === 'active';
  const cameraStarting = status === 'idle' || status === 'requesting';
  const cameraUnavailable = status === 'denied' || status === 'unavailable' || status === 'error';
  const cameraBadge = cameraActive
    ? 'Camera active'
    : cameraStarting
      ? 'Starting camera…'
      : 'Camera off';

  useEffect(() => {
    return () => {
      if (scanTimer.current !== null) window.clearTimeout(scanTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!offlineOpen) return;

    setSecondsLeft(60);
    const interval = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [offlineOpen]);

  useEffect(() => {
    if (offlineOpen && secondsLeft === 0) {
      setOfflineCode(generateOfflineCode());
      setSecondsLeft(60);
    }
  }, [offlineOpen, secondsLeft]);

  const scan = () => {
    if (scanning) return;
    setScanning(true);
    scanTimer.current = window.setTimeout(() => {
      scanTimer.current = null;
      setScanning(false);
      onScanned();
    }, 850);
  };

  const refreshCode = () => {
    setOfflineCode(generateOfflineCode());
    setSecondsLeft(60);
  };

  const handleViewfinder = () => {
    if (cameraUnavailable) {
      void retry();
      return;
    }

    scan();
  };

  return (
    <div className="screen scan-screen">
      <header className="screen-head">
        <MetaRow
          left={<span className="meta-label">04 · Scan shop code</span>}
          right={<MoreButton onClick={onOpenMenu} />}
          bordered
        />
        <MetaRow
          className="scan-status-row"
          left={<span className="scan-time">12:41</span>}
          right={<span className="scan-context">Scan to pay</span>}
        />
      </header>

      <div className="screen-scroll scan-scroll">
        <section className="viewfinder-section" aria-label="SGQR camera view">
          <button
            type="button"
            className={`viewfinder${torchOn ? ' is-torch' : ''}${scanning ? ' is-scanning' : ''}${
              cameraActive ? ' has-camera' : ''
            }${cameraUnavailable ? ' is-camera-off' : ''}`}
            onClick={handleViewfinder}
            disabled={scanning || cameraStarting}
            aria-label={
              cameraUnavailable
                ? 'Retry camera access'
                : scanning
                  ? 'Reading SGQR code'
                  : cameraActive
                    ? "Simulate scanning Ah Seng Noodle's SGQR code"
                    : 'Starting camera'
            }
          >
            <video
              ref={videoRef}
              className="camera-preview"
              autoPlay
              muted
              playsInline
              disablePictureInPicture
              aria-hidden="true"
            />

            <span className="camera-badge">
              <span className={`dot dot--6${cameraActive ? '' : ' dot--off'}`} />
              {cameraBadge}
            </span>

            {!cameraActive || scanning ? (
              <span className="viewfinder-center">
                <span className={`camera-label${cameraUnavailable ? ' camera-label--error' : ''}`}>
                  {scanning
                    ? 'Reading SGQR…'
                    : cameraStarting
                      ? 'Starting camera…'
                      : 'Camera unavailable'}
                </span>
                <span className="camera-hint">
                  {scanning
                    ? 'Checking stall details…'
                    : cameraStarting
                      ? 'Allow camera access when prompted'
                      : 'Tap to retry · simulation still works'}
                </span>
              </span>
            ) : null}

            <span className="reticle reticle--tl" aria-hidden="true" />
            <span className="reticle reticle--tr" aria-hidden="true" />
            <span className="reticle reticle--bl" aria-hidden="true" />
            <span className="reticle reticle--br" aria-hidden="true" />

            <span className="scan-line" aria-hidden="true" />

            <span className="viewfinder-hint">Align stall’s SGQR within the frame</span>
            {scanning ? <span className="scan-flash" aria-hidden="true" /> : null}
          </button>
          <span className="sr-only" role="status" aria-live="polite">
            {scanning ? 'Reading SGQR code.' : (message ?? cameraBadge)}
          </span>
        </section>

        <section className="scan-guidance">
          <h1>Scan the shop’s SGQR sticker</h1>
          <p>Usually on the counter or beside the till.</p>
        </section>

        <section className="scan-controls" aria-label="Scanning controls">
          <button
            type="button"
            className="scan-control"
            onClick={() => void toggleTorch()}
            aria-pressed={torchOn}
          >
            <AssetIcon name="flashlight" size={16} className="scan-control__icon" />
            <span>Torch</span>
          </button>
          <button type="button" className="scan-control" onClick={() => setOfflineOpen(true)}>
            <AssetIcon name="keypad" size={16} />
            <span>Offline code</span>
          </button>
        </section>

        <aside className="scan-advisory">
          <p>
            <strong>No signal at this stall?</strong> Use the offline code and read the 6 digits
            to the retailer.
          </p>
          <p className="scan-note">Payment is complete only after the retailer confirms it.</p>
        </aside>
      </div>

      <footer className="scan-footer">
        <button type="button" className="scan-cta" onClick={scan} disabled={scanning}>
          <ScanIcon size={16} />
          <span>{scanning ? 'Reading SGQR…' : 'Simulate SGQR Scan (Ah Seng Noodle)'}</span>
        </button>
        <button type="button" className="scan-cancel" onClick={onCancel} disabled={scanning}>
          Cancel scan
        </button>
        <div className="home-indicator" aria-hidden="true">
          <span />
        </div>
      </footer>

      <Sheet
        open={offlineOpen}
        onClose={() => setOfflineOpen(false)}
        title="Offline code"
        subtitle="Read these 6 digits to the retailer."
        footer={
          <button type="button" className="sheet-done" onClick={() => setOfflineOpen(false)}>
            Done
          </button>
        }
      >
        <div className="offline-code" aria-live="polite">
          {formatOfflineCode(offlineCode)}
        </div>
        <div
          className="offline-progress"
          role="progressbar"
          aria-label="Offline code validity"
          aria-valuemin={0}
          aria-valuemax={60}
          aria-valuenow={secondsLeft}
        >
          <span style={{ width: `${(secondsLeft / 60) * 100}%` }} />
        </div>
        <div className="offline-meta">
          <span>Expires in {secondsLeft}s</span>
          <button type="button" className="text-button" onClick={refreshCode}>
            New code
          </button>
        </div>
        <p className="offline-note">
          The retailer enters this code to accept the payment. It refreshes automatically so it
          cannot be reused.
        </p>
      </Sheet>
    </div>
  );
}
