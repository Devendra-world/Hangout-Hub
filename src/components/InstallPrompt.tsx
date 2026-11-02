import { useEffect, useState } from 'react';

// ---- Settings: yahan se numbers badal sakte ho ----
const VISIT_TARGET = 10;   // kitni qualified visits ke baad popup
const VISIT_SECONDS = 60;  // ek visit ke liye kitne second explore karna hai

// ---- Storage keys ----
const VISITS_KEY = 'hh_qualified_visits'; // localStorage: total qualified visits
const INSTALLED_KEY = 'hh_installed';     // localStorage: install ho chuka hai?
const COUNTED_KEY = 'hh_session_counted'; // sessionStorage: is tab ki visit gin li?
const SHOWN_KEY = 'hh_popup_shown';       // sessionStorage: is tab mein popup dikha diya?

// ---- Chhote helpers (try/catch kyunki kabhi storage block hota hai) ----
const getNum = (k: string) => {
  try { return parseInt(localStorage.getItem(k) || '0', 10) || 0; } catch { return 0; }
};
const setLocal = (k: string, v: string | number) => {
  try { localStorage.setItem(k, String(v)); } catch {}
};
const getLocal = (k: string) => {
  try { return localStorage.getItem(k); } catch { return null; }
};
const getSession = (k: string) => {
  try { return sessionStorage.getItem(k); } catch { return null; }
};
const setSession = (k: string, v: string) => {
  try { sessionStorage.setItem(k, v); } catch {}
};

// App already home screen se khuli hai? (to popup nahi dikhana)
const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as any).standalone === true;

const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

// ---- Browser ka install event pakadna (Android Chrome) ----
// Ye file app start par load hoti hai, isliye event miss nahi hota
let deferredPrompt: any = null;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();     // browser ka default mini-bar rok do
  deferredPrompt = e;     // baad mein apne button se dikhayenge
});
window.addEventListener('appinstalled', () => {
  setLocal(INSTALLED_KEY, '1'); // install ho gaya, ab popup kabhi nahi
  deferredPrompt = null;
});

export default function InstallPrompt() {
  const [open, setOpen] = useState(false);
  const [showSteps, setShowSteps] = useState(false); // manual steps wala view

  useEffect(() => {
    if (isStandalone() || getLocal(INSTALLED_KEY) === '1') return;

    // CASE 1: 10 visits poori ho chuki hain -> popup dikhao
    if (getNum(VISITS_KEY) >= VISIT_TARGET && getSession(SHOWN_KEY) !== '1') {
      const t = setTimeout(() => {
        setSession(SHOWN_KEY, '1');
        setSession(COUNTED_KEY, '1'); // is visit ko count nahi karna
        setOpen(true);
      }, 1500); // 1.5 sec baad popup, taaki page pehle load ho jaye
      return () => clearTimeout(t);
    }

    // CASE 2: is tab ki visit pehle hi gin li gayi ho to kuch nahi karna
    if (getSession(COUNTED_KEY) === '1') return;

    // CASE 3: 60 second ka active time gino
    let seconds = 0;
    const id = setInterval(() => {
      if (document.visibilityState !== 'visible') return; // background tab count nahi
      seconds += 1;
      if (seconds >= VISIT_SECONDS) {
        clearInterval(id);
        setSession(COUNTED_KEY, '1');             // ek tab = ek visit
        setLocal(VISITS_KEY, getNum(VISITS_KEY) + 1);
      }
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // "No thanks" ya popup band: counter 0 -> process dubara shuru
  const restartCycle = () => {
    setLocal(VISITS_KEY, 0);
    setOpen(false);
    setShowSteps(false);
  };

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Android Chrome: asli install dialog
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      deferredPrompt = null;
      if (outcome === 'accepted') {
        setLocal(INSTALLED_KEY, '1');
        setOpen(false);
      } else {
        restartCycle(); // dialog cancel kiya = No thanks jaisa
      }
    } else {
      // iPhone Safari ya jab browser event na de: manual steps dikhao
      setShowSteps(true);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <h2 className="text-lg font-bold text-slate-900">
          Add Hangout Hub to your home screen
        </h2>

        {!showSteps ? (
          <>
            <p className="mt-2 text-sm text-slate-600">
              Open it like an app: faster, full screen, one tap away.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={restartCycle}
                className="flex-1 rounded-xl border border-slate-300 py-2.5 text-sm font-medium text-slate-700"
              >
                No thanks
              </button>
              <button
                onClick={handleInstall}
                className="flex-1 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white"
              >
                Install
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-slate-600">
              {isIOS()
                ? 'Tap the Share button, then choose "Add to Home Screen".'
                : 'Tap the ⋮ menu, then choose "Add to Home screen" or "Install app".'}
            </p>
            <button
              onClick={restartCycle}
              className="mt-4 w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white"
            >
              Got it
            </button>
          </>
        )}
      </div>
    </div>
  );
}