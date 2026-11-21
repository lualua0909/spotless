"use client";

/* eslint-disable @next/next/no-img-element -- Keep the downloaded source media and picture crops unchanged. */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Search,
  UserRound,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  Minus,
  Plus,
  Trash2,
  Phone,
  Mail,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { site, money } from "./data";
import { Modal, useStore } from "./store";
import "./shell.css";

const shopLinks = [
  ["Máy cạo", "/collections/may-cạo"],
  ["Phụ kiện", "/collections/phụ-kiện"],
  ["Chăm sóc da", "/collections/cham-soc-da"],
  ["Hướng dẫn sử dụng", "/pages/huong-dan-su-dung"],
];
const policyLinks = [
  ["Chính sách bảo hành", "/pages/chinh-sach-bao-hanh"],
  ["Chính sách vận chuyển", "/pages/chinh-sach-van-chuyen"],
  ["Chính sách bảo mật", "/pages/chinh-sach-bảo-mật"],
  ["Điều khoản dịch vụ", "/pages/dieu-khoan-dich-vu"],
  ["Chính sách đổi trả hàng", "/pages/chinh-sach-dổi-trả-hang"],
];
const messages = [
  "Miễn phí giao hàng toàn quốc cho đơn từ 350.000₫",
  "365 ngày bảo hành 1 đổi 1",
  "Đổi trả miễn phí trong 15 ngày",
];

export function Header() {
  const path = usePathname();
  const home = path === "/";
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [message, setMessage] = useState(0);
  const { lines, setOpen } = useStore();
  useEffect(() => {
    function update() {
      setScrolled(window.scrollY > 24);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
    const t = setInterval(
      () => setMessage((i) => (i + 1) % messages.length),
      5000,
    );
    return () => {
      window.removeEventListener("scroll", update);
      clearInterval(t);
    };
  }, []);
  const close = () => {
    setMega(false);
    setMobile(false);
  };
  return (
    <>
      <div className="announcement">{messages[message]}</div>
      <header
        className={`site-header ${home && !scrolled && !mega ? "overlay" : ""} ${home ? "home-header" : ""}`}
        onMouseLeave={() => setMega(false)}
      >
        <div className="header-row">
          <div className="header-left">
            <button
              className="icon-button mobile-toggle"
              aria-label="Mở menu"
              onClick={() => setMobile(true)}
            >
              <Menu size={24} />
            </button>
            <nav className="desktop-navigation" aria-label="Điều hướng chính">
              <div onMouseEnter={() => setMega(true)}>
                <Link
                  href="/collections/all"
                  onFocus={() => setMega(true)}
                  onClick={close}
                >
                  MUA HÀNG <ChevronDown size={12} />
                </Link>
              </div>
              <Link
                href="/pages/ve-spotless"
                onMouseEnter={() => setMega(false)}
                onClick={close}
              >
                VỀ SPOTLESS<sup>®</sup>
              </Link>
              <Link
                href="/pages/ho-tro"
                onMouseEnter={() => setMega(false)}
                onClick={close}
              >
                HỖ TRỢ
              </Link>
            </nav>
          </div>
          <Link
            className="header-logo"
            href="/"
            aria-label="Spotless — Trang chủ"
            onClick={close}
          >
            <img
              src={site.home.logo}
              alt="SPOTLESS VIỆT NAM"
              width={90}
              height={34}
            />
          </Link>
          <div className="header-right">
            <Link
              className="icon-button"
              aria-label="Tìm kiếm"
              href="/search"
              onClick={close}
            >
              <Search size={21} />
            </Link>
            <Link
              className="icon-button account-link"
              aria-label="Tài khoản"
              href="/pages/tai-khoan"
              onClick={close}
            >
              <UserRound size={21} />
            </Link>
            <button
              className="icon-button"
              aria-label="Giỏ hàng"
              onClick={() => {
                close();
                setOpen(true);
              }}
            >
              <ShoppingBag size={21} />
              <span className="cart-count">
                {lines.reduce((n, l) => n + l.quantity, 0)}
              </span>
            </button>
          </div>
        </div>
        {mega && (
          <div className="mega-menu">
            <div className="mega-grid">
              {["trimday-3-0-max", "trimday-lite", "trimblade"].map(
                (handle) => {
                  const p = site.products.find((p) => p.handle === handle)!;
                  return (
                    <Link href={p.path} key={handle} onClick={close}>
                      <span className="eyebrow">
                        {handle === "trimblade" ? "Phụ kiện" : "Máy cạo"}
                      </span>
                      <div className="mega-tile">
                        <img src={p.images[0].src} alt={p.title} />
                      </div>
                      <small>
                        {handle === "trimday-3-0-max"
                          ? "7000 RPM · IPX7"
                          : handle === "trimday-lite"
                            ? "Gọn nhẹ mỗi ngày"
                            : "Lưỡi thay thế TRIMBLADE™"}
                      </small>
                      <strong>{p.title}</strong>
                    </Link>
                  );
                },
              )}
              <Link
                className="mega-feature"
                href="/collections/may-cạo"
                onClick={close}
              >
                <img
                  src={site.home.categories[0].image}
                  alt="Bộ sưu tập TRIMDAY®"
                />
                <h3>Bộ sưu tập TRIMDAY® đang lớn dần</h3>
                <span>Khám phá máy cạo</span>
              </Link>
            </div>
            <nav className="mega-links">
              {shopLinks.map(([label, href]) => (
                <Link key={href} href={href} onClick={close}>
                  {label}
                </Link>
              ))}
            </nav>
            <button
              className="mega-close icon-button"
              aria-label="Đóng menu mua hàng"
              onClick={close}
            >
              <X size={20} />
            </button>
          </div>
        )}
      </header>
      {mobile && (
        <Modal
          label="Menu điều hướng"
          onClose={() => setMobile(false)}
          className="drawer mobile-menu"
        >
          <div className="drawer-head">
            <strong>MUA HÀNG</strong>
            <button
              className="icon-button"
              aria-label="Đóng menu"
              onClick={close}
            >
              <X />
            </button>
          </div>
          <nav>
            {[
              ...shopLinks,
              ["Tất cả sản phẩm", "/collections/all"],
              ["VỀ SPOTLESS®", "/pages/ve-spotless"],
              ["Trung tâm hỗ trợ", "/pages/ho-tro"],
              ["Chăm sóc nam giới", "/blogs/cham-soc-nam-gioi"],
              ["Sức khỏe", "/blogs/suc-khoe"],
              ["Tài khoản", "/pages/tai-khoan"],
            ].map(([label, href]) => (
              <Link key={href} href={href} onClick={close}>
                {label}
              </Link>
            ))}
          </nav>
          <img src={site.home.categories[0].image} alt="Máy cạo TRIMDAY" />
          <p>Bộ sưu tập TRIMDAY® đang lớn dần</p>
        </Modal>
      )}
    </>
  );
}

export function CartContents() {
  const { lines, update, setOpen } = useStore();
  const total = lines.reduce(
    (sum, l) =>
      sum +
      Number(
        site.products.find((p) => p.handle === l.handle)!.variants[0].price,
      ) *
        l.quantity,
    0,
  );
  return (
    <>
      <div className="cart-lines">
        {!lines.length ? (
          <div className="cart-empty">
            <ShoppingBag size={48} strokeWidth={1} />
            <p>Giỏ hàng của bạn đang trống.</p>
            <Link
              className="btn"
              href="/collections/all"
              onClick={() => setOpen(false)}
            >
              Khám phá sản phẩm
            </Link>
          </div>
        ) : (
          lines.map((line) => {
            const p = site.products.find((p) => p.handle === line.handle)!;
            return (
              <div className="cart-line" key={line.handle}>
                <Link href={p.path} onClick={() => setOpen(false)}>
                  <img src={p.images[0].src} alt={p.title} />
                </Link>
                <div>
                  <Link href={p.path} onClick={() => setOpen(false)}>
                    <strong>{p.title}</strong>
                  </Link>
                  <p>{money(p.variants[0].price)}</p>
                  <div className="quantity">
                    <button
                      aria-label={`Giảm số lượng ${p.title}`}
                      onClick={() => update(line.handle, line.quantity - 1)}
                    >
                      <Minus size={14} />
                    </button>
                    <span>{line.quantity}</span>
                    <button
                      aria-label={`Tăng số lượng ${p.title}`}
                      onClick={() => update(line.handle, line.quantity + 1)}
                      disabled={line.quantity >= 99}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <button
                  className="icon-button"
                  aria-label={`Xóa ${p.title}`}
                  onClick={() => update(line.handle, 0)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })
        )}
      </div>
      {lines.length > 0 && (
        <div className="cart-total">
          <p className="shipping-hint">
            {total >= 350000
              ? "Bạn được miễn phí giao hàng toàn quốc."
              : `Mua thêm ${money(350000 - total)} để được miễn phí giao hàng.`}
          </p>
          <p>
            <span>Tổng cộng</span>
            <strong>{money(total)}</strong>
          </p>
          <Link
            className="btn wide"
            href="/pages/thanhtoan"
            onClick={() => setOpen(false)}
          >
            Thanh toán
          </Link>
          <small>Phí vận chuyển được tính ở bước tiếp theo.</small>
        </div>
      )}
    </>
  );
}
export function CartDrawer() {
  const { open, setOpen, lines } = useStore();
  return open ? (
    <Modal
      label="Giỏ hàng"
      onClose={() => setOpen(false)}
      className="drawer cart-drawer"
    >
      <div className="drawer-head">
        <h2>Giỏ hàng ({lines.reduce((n, l) => n + l.quantity, 0)})</h2>
        <button
          className="icon-button"
          aria-label="Đóng giỏ hàng"
          onClick={() => setOpen(false)}
        >
          <X />
        </button>
      </div>
      <CartContents />
    </Modal>
  ) : null;
}
export function CartPage() {
  return (
    <section className="cart-page container narrow">
      <h1>Giỏ hàng của bạn</h1>
      <CartContents />
    </section>
  );
}

export function CookieSettings() {
  const [visible, setVisible] = useState(false);
  const [custom, setCustom] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  useEffect(() => {
    const show = () => setVisible(true);
    try {
      if (!localStorage.getItem("spotless-consent")) queueMicrotask(show);
    } catch {
      queueMicrotask(show);
    }
    window.addEventListener("spotless-cookie-settings", show);
    return () => window.removeEventListener("spotless-cookie-settings", show);
  }, []);
  function save(all: boolean) {
    try {
      localStorage.setItem(
        "spotless-consent",
        JSON.stringify({
          necessary: true,
          analytics: all || analytics,
          marketing: all || marketing,
        }),
      );
    } catch {}
    setVisible(false);
    setCustom(false);
  }
  return visible ? (
    <aside className="cookie-panel" aria-label="Cài đặt cookie">
      <h3>Chúng tôi tôn trọng dữ liệu của bạn</h3>
      <p>
        Spotless® dùng cookie cần thiết để website hoạt động. Ngoài ra chúng tôi
        muốn dùng thêm cookie phân tích và tiếp thị - chỉ khi bạn đồng ý. Bạn có
        thể thay đổi lựa chọn bất kỳ lúc nào. Xem{" "}
        <Link href="/pages/chinh-sach-bảo-mật">Chính sách bảo mật.</Link>
      </p>
      {custom && (
        <div className="cookie-options">
          <label>
            <input type="checkbox" checked disabled /> Cookie cần thiết
          </label>
          <label>
            <input
              type="checkbox"
              checked={analytics}
              onChange={(e) => setAnalytics(e.target.checked)}
            />{" "}
            Phân tích
          </label>
          <label>
            <input
              type="checkbox"
              checked={marketing}
              onChange={(e) => setMarketing(e.target.checked)}
            />{" "}
            Tiếp thị
          </label>
        </div>
      )}
      <div className="cookie-actions">
        <button onClick={() => save(true)}>Đồng ý tất cả</button>
        <button onClick={() => save(false)}>
          {custom ? "Lưu lựa chọn" : "Chỉ cookie cần thiết"}
        </button>
      </div>
      <button className="cookie-custom" onClick={() => setCustom(!custom)}>
        {custom ? "Thu gọn" : "Tuỳ chỉnh"}
      </button>
    </aside>
  ) : null;
}
export function ContactWidget() {
  const [open, setOpen] = useState(false);
  return (
    <div className="contact-widget">
      {open && (
        <div className="contact-panel">
          <h3>Spotless có thể giúp gì cho bạn?</h3>
          <p>Chúng tôi luôn sẵn sàng hỗ trợ.</p>
          <Link href="/pages/ho-tro" onClick={() => setOpen(false)}>
            Trung tâm hỗ trợ
          </Link>
          <a href="tel:0978551893">Gọi 0978 551 893</a>
          <a href="mailto:admin@spotless.vn">admin@spotless.vn</a>
        </div>
      )}
      <button
        aria-label={open ? "Đóng hỗ trợ" : "Mở hỗ trợ"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={24} /> : <MessageCircle size={26} />}
      </button>
    </div>
  );
}
export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-contact">
          <h3>Liên hệ chúng tôi</h3>
          <strong>HỘ KINH DOANH SPOTLESS VIỆT NAM:</strong>
          <p>MST: 024099005266</p>
          <p>
            <MapPin size={17} />
            Số 14 ngách 46 ngõ 89 Lạc Long Quân, Tây Hồ, Hà Nội
          </p>
          <a href="tel:0978551893">
            <Phone size={17} />
            0978 551 893
          </a>
          <a href="mailto:admin@spotless.vn">
            <Mail size={17} />
            admin@spotless.vn
          </a>
        </div>
        <nav aria-label="Liên kết cuối trang">
          <div>
            <h4>MUA HÀNG</h4>
            {shopLinks.map(([name, path]) => (
              <Link href={path} key={path}>
                {name}
              </Link>
            ))}
          </div>
          <div>
            <h4>ĐIỀU KHOẢN</h4>
            {policyLinks.map(([name, path]) => (
              <Link href={path} key={path}>
                {name}
              </Link>
            ))}
          </div>
          <div>
            <h4>VỀ SPOTLESS</h4>
            <Link href="/blogs/cham-soc-nam-gioi">Chăm sóc nam giới</Link>
            <Link href="/blogs/suc-khoe">Sức khỏe</Link>
            <Link href="/pages/ve-spotless">Về Spotless</Link>
          </div>
          <div>
            <h4>TUYỂN DỤNG</h4>
            <Link href="/blogs/tuyen-dung-viec-lam">Việc làm</Link>
          </div>
        </nav>
      </div>
      <div className="container footer-bottom">
        <Link href="/">
          <img src={site.home.logo} alt="Spotless" width={60} height={24} />
        </Link>
        <span>© 2026 SPOTLESS VIỆT NAM · Hàng đầu cho hàng dưới.</span>
        <button
          onClick={() =>
            window.dispatchEvent(new Event("spotless-cookie-settings"))
          }
        >
          Cài đặt cookie
        </button>
      </div>
    </footer>
  );
}
