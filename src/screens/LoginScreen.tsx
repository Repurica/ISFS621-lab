import { useState } from 'react';
import { AssetIcon, EyeOffIcon } from '../components/icons';
import { MetaRow, MoreButton, Spinner } from '../components/ScreenChrome';
import { useDelayedAction } from '../hooks/useDelayedAction';

interface LoginScreenProps {
  onLogin: () => void;
  onOpenMenu: () => void;
  showToast: (message: string) => void;
}

export function LoginScreen({ onLogin, onOpenMenu, showToast }: LoginScreenProps) {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const { busy, run } = useDelayedAction();

  const submit = () => {
    run(onLogin, 650);
  };

  return (
    <div className="screen login-screen">
      <header className="screen-head">
        <MetaRow
          left={<span className="meta-label">01 · Login</span>}
          right={<MoreButton onClick={onOpenMenu} />}
        />
        <MetaRow
          className="login-meta"
          left={<span className="meta-time">09:14</span>}
          right={<span className="meta-domain">voucher.redeem.gov.sg</span>}
          bordered
        />
      </header>

      <div className="screen-scroll login-scroll">
        <div className="login-content">
          <h1 className="login-title">CDC Vouchers 2027</h1>
          <p className="login-subtitle">Claim on behalf of your household.</p>

          <form
            className="login-card"
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <div className="field">
              <label className="field-label" htmlFor="singpass-id">
                Singpass ID
              </label>
              <input
                id="singpass-id"
                className="field-input"
                value="S••••567D"
                readOnly
                aria-readonly="true"
                autoComplete="username"
              />
            </div>

            <div className="field">
              <label className="field-label" htmlFor="singpass-password">
                Password
              </label>
              <div className="password-shell">
                <input
                  id="singpass-password"
                  className={`password-input${passwordVisible ? ' is-visible' : ''}`}
                  type={passwordVisible ? 'text' : 'password'}
                  defaultValue="cdcv2027"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="icon-button eye-button"
                  onClick={() => setPasswordVisible((visible) => !visible)}
                  aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                  aria-pressed={passwordVisible}
                >
                  {passwordVisible ? <EyeOffIcon size={16} /> : <AssetIcon name="eye" size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login-submit" disabled={busy}>
              {busy ? (
                <>
                  <Spinner />
                  Logging in…
                </>
              ) : (
                'Log in'
              )}
            </button>
          </form>

          <button
            type="button"
            className="login-alt"
            onClick={() => showToast('Singpass app login is not part of this prototype.')}
          >
            or scan with Singpass app
          </button>
        </div>

        <footer className="login-foot">
          <p>
            Check the link starts with <span>voucher.redeem.gov.sg</span>
          </p>
          <p>No bank details are ever requested.</p>
        </footer>
      </div>
    </div>
  );
}
