import type { Metadata } from "next";
import { StoreProvider } from "@/components/sites/spotless/store";
import {
  Header,
  Footer,
  CartDrawer,
  CookieSettings,
  ContactWidget,
} from "@/components/sites/spotless/shell";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SPOTLESS VIỆT NAM - Thức Tỉnh Nghệ Thuật Chăm Sóc Vùng Kín",
    template: "%s - SPOTLESS VIỆT NAM",
  },
  description:
    "Hàng đầu cho hàng dưới. Máy cạo TRIMDAY® và hệ chăm sóc toàn diện cho nam giới của Spotless Việt Nam.",
  icons: { icon: { url: "/icon.webp", type: "image/webp" } },
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <StoreProvider>
          <a className="skip-link" href="#main-content">
            Bỏ qua, tới nội dung chính
          </a>
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
          <CartDrawer />
          <CookieSettings />
          <ContactWidget />
        </StoreProvider>
      </body>
    </html>
  );
}
