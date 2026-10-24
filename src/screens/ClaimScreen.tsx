import { MetaRow, Spinner } from '../components/ScreenChrome';
import { useDelayedAction } from '../hooks/useDelayedAction';

interface ClaimScreenProps {
  claimed: boolean;
  onClaim: () => void;
}

export function ClaimScreen({ claimed, onClaim }: ClaimScreenProps) {
  const { busy, run } = useDelayedAction();

  const claim = () => {
    if (claimed) {
      onClaim();
      return;
    }
    run(onClaim, 750);
  };

  return (
    <div className="screen claim-screen">
      <header className="screen-head">
        <MetaRow
          className="claim-meta"
          left={<span className="meta-label">02 · Confirm claim</span>}
          right={
            <span className="status-chip">
              <span className="dot dot--6" />
              Singpass verified
            </span>
          }
        />
        <MetaRow
          className="claim-status"
          left={<span className="claim-time">09:15</span>}
          right={
            <span className="logged-chip">
              <span className="dot dot--8" />
              Logged in
            </span>
          }
          bordered
        />
      </header>

      <div className="screen-scroll claim-scroll">
        <main className="claim-body">
          <h1 className="claim-title">Confirm your household</h1>

          <section className="household-card" aria-label="Household details">
            <dl className="household-list">
              <div className="household-row">
                <dt>Name</dt>
                <dd className="masked-name">TAN W•• M••</dd>
              </div>
              <div className="household-row">
                <dt>Address</dt>
                <dd>Blk 123 Bedok</dd>
              </div>
              <div className="household-row">
                <dt>Household size</dt>
                <dd>4</dd>
              </div>
              <div className="household-row">
                <dt>Mobile</dt>
                <dd className="masked-mobile">•••• 4417</dd>
              </div>
            </dl>
          </section>

          <section className="allocation-card" aria-label="Amount to claim">
            <div className="allocation-head">
              <p className="eyebrow">Amount to claim</p>
              <p className="allocation-amount">$500.00</p>
            </div>
            <div className="allocation-split">
              <div className="allocation-row">
                <span>Hawkers, heartland shops</span>
                <strong>$250</strong>
              </div>
              <div className="allocation-row">
                <span>Supermarkets</span>
                <strong>$250</strong>
              </div>
            </div>
          </section>

          <p className="claim-advisory">
            One claim per household. No one else at this address has claimed yet.
          </p>
        </main>

        <div className="claim-footer">
          <button type="button" className="claim-button" onClick={claim} disabled={busy}>
            {busy ? (
              <>
                <Spinner />
                Claiming…
              </>
            ) : claimed ? (
              'Continue to dashboard'
            ) : (
              'Claim vouchers'
            )}
          </button>
          <p className="gov-hint">Official Singapore Government Service</p>
        </div>
      </div>
    </div>
  );
}
