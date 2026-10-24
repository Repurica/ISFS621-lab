import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { MoreMenu } from './components/MoreMenu';
import { Toast } from './components/Toast';
import { useHashRoute } from './hooks/useHashRoute';
import { formatMoney } from './lib/payment';
import { ClaimScreen } from './screens/ClaimScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { LoginScreen } from './screens/LoginScreen';
import { RetailerScreen } from './screens/RetailerScreen';
import { ReviewScreen } from './screens/ReviewScreen';
import { ScanScreen } from './screens/ScanScreen';
import { appReducer } from './state/reducer';
import { createSeedState } from './state/seed';
import { clearState, loadState, saveState } from './state/storage';
import type { Payment, Screen } from './types';

const SCREEN_TITLES: Record<Screen, string> = {
  login: 'Login',
  claim: 'Confirm claim',
  dashboard: 'Your vouchers',
  scan: 'Scan to pay',
  review: 'Review and confirm',
  retailer: 'Retailer view',
};

export default function App() {
  const [state, dispatch] = useReducer(appReducer, null, () => loadState() ?? createSeedState());
  const { screen, navigate } = useHashRoute();
  const [menuOpen, setMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    if (!state.claimed && screen !== 'login' && screen !== 'claim') {
      navigate('login', true);
    } else if (state.claimed && screen === 'retailer' && !state.lastPayment) {
      navigate('dashboard', true);
    }
  }, [navigate, screen, state.claimed, state.lastPayment]);

  useEffect(() => {
    const scrollArea = document.querySelector<HTMLElement>('.screen-scroll');
    if (scrollArea) scrollArea.scrollTop = 0;
    document.title = `CDC Vouchers 2027 · ${SCREEN_TITLES[screen]}`;
  }, [screen]);

  useEffect(() => {
    return () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => {
      toastTimer.current = null;
      setToastMessage(null);
    }, 3200);
  }, []);

  const handleLogin = useCallback(() => {
    navigate(state.claimed ? 'dashboard' : 'claim');
  }, [navigate, state.claimed]);

  const handleClaim = useCallback(() => {
    dispatch({ type: 'claim' });
    navigate('dashboard');
  }, [navigate]);

  const handleConfirm = useCallback(
    (payment: Payment) => {
      dispatch({ type: 'pay', payment });
      navigate('retailer');
    },
    [navigate],
  );

  const handleNextCustomer = useCallback(() => {
    const remaining = state.allocations.hawker + state.allocations.supermarket - state.used.hawker - state.used.supermarket;
    navigate('dashboard');
    showToast(`Payment complete · ${formatMoney(remaining)} left`);
  }, [navigate, showToast, state.allocations, state.used]);

  const handleRestart = useCallback(() => {
    clearState();
    dispatch({ type: 'reset' });
    setMenuOpen(false);
    navigate('login', true);
    showToast('Demo reset.');
  }, [navigate, showToast]);

  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const renderScreen = () => {
    switch (screen) {
      case 'login':
        return (
          <LoginScreen onLogin={handleLogin} onOpenMenu={openMenu} showToast={showToast} />
        );

      case 'claim':
        return <ClaimScreen claimed={state.claimed} onClaim={handleClaim} />;

      case 'scan':
        return (
          <ScanScreen
            onScanned={() => navigate('review')}
            onCancel={() => navigate('dashboard')}
            onOpenMenu={openMenu}
          />
        );

      case 'review':
        return (
          <ReviewScreen
            state={state}
            onBack={() => navigate('scan')}
            onConfirm={handleConfirm}
            onOpenMenu={openMenu}
          />
        );

      case 'retailer':
        return state.lastPayment ? (
          <RetailerScreen
            state={state}
            payment={state.lastPayment}
            onNext={handleNextCustomer}
            onOpenMenu={openMenu}
            showToast={showToast}
          />
        ) : null;

      case 'dashboard':
      default:
        return (
          <DashboardScreen
            state={state}
            onNavigate={navigate}
            onOpenMenu={openMenu}
            showToast={showToast}
          />
        );
    }
  };

  return (
    <div className="stage">
      <div className="phone">
        <div className="screen-frame" key={screen}>
          {renderScreen()}
        </div>

        <Toast message={toastMessage} />

        <MoreMenu
          open={menuOpen}
          onClose={closeMenu}
          soundOn={state.soundOn}
          onToggleSound={() => dispatch({ type: 'toggle-sound' })}
          onRestart={handleRestart}
        />
      </div>
    </div>
  );
}
