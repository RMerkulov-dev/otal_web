import { useEffect, useId, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';

type Item = { href: string; label: string };

/**
 * Навігація рендериться на сервері, тож посилання є в HTML і без JavaScript.
 * Острівець додає лише розкривну панель для вузьких екранів.
 */
export default function NavMenu({ items, phone }: { items: Item[]; phone: Item }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const still = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <nav className="masthead__nav" aria-label="Розділи сторінки">
        <ul>
          {items.map((item) => (
            <li key={item.href}>
              <a href={item.href}>{item.label}</a>
            </li>
          ))}
        </ul>
      </nav>

      <a className="masthead__call" href={phone.href}>
        {phone.label}
      </a>
      <a className="button button--light button--small masthead__cta" href="#contacts">
        Залишити заявку
      </a>

      <button
        type="button"
        className="nav-toggle"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="nav-toggle__bars" data-open={open || undefined} aria-hidden="true">
          <span></span>
          <span></span>
        </span>
        {open ? 'Закрити' : 'Меню'}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={panelId}
            className="nav-panel"
            initial={still ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={still ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          >
            <ul className="nav-panel__list">
              {items.map((item) => (
                <li key={item.href}>
                  <a href={item.href} onClick={() => setOpen(false)}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <a className="nav-panel__call" href={phone.href}>
              {phone.label}
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
