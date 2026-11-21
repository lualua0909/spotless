"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { site, type Product } from "./data";

type CartLine = { handle: string; quantity: number };
type Store = {
  lines: CartLine[];
  open: boolean;
  ready: boolean;
  setOpen: (open: boolean) => void;
  add: (product: Product, quantity?: number) => void;
  update: (handle: string, quantity: number) => void;
};
const CartContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const parsed: unknown = JSON.parse(
          localStorage.getItem("spotless-cart") || "[]",
        );
        if (Array.isArray(parsed))
          setLines(
            parsed.filter(
              (line): line is CartLine =>
                !!line &&
                typeof line === "object" &&
                typeof line.handle === "string" &&
                site.products.some(
                  (p) =>
                    p.handle === line.handle &&
                    p.variants.some((v) => v.available),
                ) &&
                Number.isInteger(line.quantity) &&
                line.quantity > 0 &&
                line.quantity <= 99,
            ),
          );
      } catch {
        /* An invalid or unavailable saved cart starts empty. */
      }
      setReady(true);
    });
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        localStorage.setItem("spotless-cart", JSON.stringify(lines));
      } catch {
        /* Cart still works if browser storage is unavailable. */
      }
    }
  }, [lines, ready]);
  function add(product: Product, quantity = 1) {
    if (!product.variants.some((v) => v.available)) return;
    const count = Math.min(99, Math.max(1, Math.floor(quantity)));
    setLines((current) => {
      const found = current.find((l) => l.handle === product.handle);
      return found
        ? current.map((l) =>
            l.handle === product.handle
              ? { ...l, quantity: Math.min(99, l.quantity + count) }
              : l,
          )
        : [...current, { handle: product.handle, quantity: count }];
    });
    setOpen(true);
  }
  function update(handle: string, quantity: number) {
    if (!Number.isFinite(quantity)) return;
    setLines((current) =>
      quantity <= 0
        ? current.filter((l) => l.handle !== handle)
        : current.map((l) =>
            l.handle === handle
              ? { ...l, quantity: Math.min(99, Math.floor(quantity)) }
              : l,
          ),
    );
  }
  return (
    <CartContext.Provider value={{ lines, open, ready, setOpen, add, update }}>
      {children}
    </CartContext.Provider>
  );
}
export function useStore() {
  const value = useContext(CartContext);
  if (!value) throw new Error("StoreProvider is required");
  return value;
}

export function Modal({
  label,
  onClose,
  children,
  className = "",
}: {
  label: string;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    const previous = document.activeElement;
    d?.showModal();
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      d?.close();
      document.body.style.overflow = old;
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label={label}
      className={`modal ${className}`}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-inner">{children}</div>
    </dialog>
  );
}
