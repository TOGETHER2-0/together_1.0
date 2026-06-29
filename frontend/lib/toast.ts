// ─── Toast ────────────────────────────────────────────────────
// Single imperative toast system. Reuses the .toast / .toast-wrapper
// styles already defined in globals.css — no new component, no native
// alert() anywhere in the product.

type ToastType = 'success' | 'error';

const WRAPPER_ID = 'together-toast-wrapper';

function getWrapper(): HTMLElement {
  let wrap = document.getElementById(WRAPPER_ID);
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = WRAPPER_ID;
    wrap.className = 'toast-wrapper';
    document.body.appendChild(wrap);
  }
  return wrap;
}

export function showToast(message: string, type: ToastType = 'error', duration = 3200): void {
  if (typeof document === 'undefined') return;

  const wrap = getWrapper();
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = message;
  wrap.appendChild(el);

  const remove = () => {
    el.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
    el.style.opacity = '0';
    el.style.transform = 'translateY(-8px)';
    setTimeout(() => el.remove(), 220);
  };

  setTimeout(remove, duration);
}
