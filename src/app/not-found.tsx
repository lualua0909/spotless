import Link from "next/link";
export default function NotFound() {
  return (
    <section
      className="container"
      style={{ paddingTop: 100, paddingBottom: 100, textAlign: "center" }}
    >
      <p className="eyebrow">404</p>
      <h1 style={{ fontSize: 46 }}>Không tìm thấy trang</h1>
      <p>Trang bạn tìm không có trong bản dựng này.</p>
      <Link href="/" className="btn">
        Về trang chủ
      </Link>
    </section>
  );
}
