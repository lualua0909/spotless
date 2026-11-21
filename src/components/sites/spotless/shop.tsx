"use client";

/* eslint-disable @next/next/no-img-element -- Keep the downloaded source media and picture crops unchanged. */

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  Truck,
  X,
  Zap,
  Droplets,
} from "lucide-react";
import {
  site,
  type Product,
  money,
  ratingCounts,
  featuredHandles,
} from "./data";
import { Modal, useStore } from "./store";
import { ReviewRail } from "./reviews";
import "./shop.css";

export function ProductCard({ product }: { product: Product }) {
  const variant = product.variants[0];
  const discount =
    variant.compare_at_price &&
    Number(variant.compare_at_price) > Number(variant.price)
      ? Math.round(
          (1 - Number(variant.price) / Number(variant.compare_at_price)) * 100,
        )
      : 0;
  return (
    <article className="product-card">
      <Link className="card-media" href={product.path}>
        <img src={product.images[0]?.src} alt={product.title} loading="lazy" />
        {discount > 0 && <span className="sale-badge">-{discount}%</span>}
      </Link>
      <div className="card-body">
        <div className="card-rating">
          {ratingCounts[product.handle] ? (
            <>
              <span className="stars">★★★★★</span>
              <small>({ratingCounts[product.handle]})</small>
            </>
          ) : (
            <span aria-hidden="true">&nbsp;</span>
          )}
        </div>
        <h3>
          <Link href={product.path}>{product.title}</Link>
        </h3>
        <div className="price">
          <strong>{money(variant.price)}</strong>
          {discount > 0 && <del>{money(variant.compare_at_price!)}</del>}
        </div>
        <Link className="btn wide" href={product.path}>
          Mua ngay
        </Link>
      </div>
    </article>
  );
}

export function CollectionPage({
  path,
  sort = "manual",
}: {
  path: string;
  sort?: string;
}) {
  const router = useRouter();
  const collection = site.collections.find((c) => decodeURI(c.path) === path)!;
  let products = collection.products
    .map((h) => site.products.find((p) => p.handle === h))
    .filter((p): p is Product => !!p);
  if (sort === "price-ascending")
    products = [...products].sort(
      (a, b) => Number(a.variants[0].price) - Number(b.variants[0].price),
    );
  if (sort === "price-descending")
    products = [...products].sort(
      (a, b) => Number(b.variants[0].price) - Number(a.variants[0].price),
    );
  if (sort === "best-selling")
    products = [...products].sort(
      (a, b) => (ratingCounts[b.handle] || 0) - (ratingCounts[a.handle] || 0),
    );
  if (sort === "created-descending")
    products = [...products].sort((a, b) =>
      b.created_at.localeCompare(a.created_at),
    );
  return (
    <section className="collection-page container">
      <div className="collection-heading">
        <h1>{collection.title}</h1>
        {collection.description && <p>{collection.description}</p>}
      </div>
      <div className="collection-bar">
        <span>{products.length} sản phẩm</span>
        <label>
          Sắp xếp
          <select
            value={sort}
            onChange={(e) =>
              router.replace(`${path}?sort_by=${e.target.value}`, {
                scroll: false,
              })
            }
          >
            <option value="manual">Nổi bật</option>
            <option value="best-selling">Bán chạy</option>
            <option value="price-ascending">Giá tăng dần</option>
            <option value="price-descending">Giá giảm dần</option>
            <option value="created-descending">Mới nhất</option>
          </select>
        </label>
      </div>
      <div className="collection-grid">
        {products.map((p) => (
          <ProductCard key={p.handle} product={p} />
        ))}
      </div>
      {!products.length && (
        <p className="empty-collection">
          Chưa có sản phẩm trong bộ sưu tập này.{" "}
          <Link href="/collections/all">Xem tất cả sản phẩm</Link>
        </p>
      )}
    </section>
  );
}

export function ProductPage({ product }: { product: Product }) {
  const { add } = useStore();
  const [image, setImage] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [comparison, setComparison] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [variantIndex, setVariantIndex] = useState(0);
  const [review, setReview] = useState(0);
  const variant = product.variants[variantIndex];
  const gallery = product.gallery;
  const shaving = product.handle.startsWith("trimday");
  useEffect(() => {
    if (!lightbox) return;
    function key(e: KeyboardEvent) {
      if (e.key === "ArrowRight") setImage((i) => (i + 1) % gallery.length);
      if (e.key === "ArrowLeft")
        setImage((i) => (i - 1 + gallery.length) % gallery.length);
    }
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [lightbox, gallery.length]);
  const quotes = [
    {
      name: "Chí Hùng",
      quote:
        "Giao hàng nhanh chóng sản phẩm dễ dùng đi lông khá là sạch mà vẫn khá mướt",
    },
    {
      name: "Minh Tuấn",
      quote:
        "Sạch sẽ gọn gàng nên tự tin hẳn lên, mây mưa đều đặn. Người yêu mê tít, cứ tấm tắc khen. Tiếc là biết tới hơi muộn.",
    },
    {
      name: "Khải",
      quote:
        "Dùng máy cạo để tiết kiệm thời gian. Máy cạo còn lại tầm 1 phân chứ không nhẵn mịn như cạo bằng lưỡi lam được. Phù hợp ae trim mỗi tuần nhanh gọn.",
    },
  ];
  return (
    <>
      <section className="product-page">
        <div className="pdp-top">
          <div className="gallery-column">
            <button
              className="gallery-stage"
              aria-label={`Phóng to ảnh ${product.title}`}
              onClick={() => setLightbox(true)}
            >
              <img
                src={gallery[image]}
                alt={`${product.title} — ảnh ${image + 1}`}
                fetchPriority="high"
              />
            </button>
            <div className="gallery-thumbnails">
              {gallery.map((src, i) => (
                <button
                  key={src}
                  className={i === image ? "active" : ""}
                  aria-label={`Xem ảnh ${i + 1}`}
                  aria-pressed={i === image}
                  onClick={() => setImage(i)}
                >
                  <img src={src} alt="" loading="lazy" />
                </button>
              ))}
            </div>
            <nav className="breadcrumbs" aria-label="Đường dẫn">
              <Link href="/">Trang chủ</Link>
              <span>/</span>
              <Link href="/collections/all">TRIMDAY® SERIES</Link>
              <span>/</span>
              <span>{product.title}</span>
            </nav>
          </div>
          <div className="pdp-buy">
            <div className="pdp-title">
              <div>
                <div className="eyebrow">
                  {shaving
                    ? "Máy cạo lông cơ thể"
                    : product.handle.includes("cool")
                      ? "Chăm sóc nam giới"
                      : "Phụ kiện TRIMDAY®"}
                </div>
                <h1>
                  {product.title.includes("®") ? (
                    <>
                      {product.title.split("®")[0]}
                      <sup>®</sup>
                      {product.title.split("®")[1]}
                    </>
                  ) : (
                    product.title
                  )}
                </h1>
              </div>
              <div
                className={`warranty-seal ${product.sealImage ? "source-seal" : ""}`}
              >
                {product.sealImage ? (
                  <img
                    src={product.sealImage}
                    alt="Bảo hành 12 tháng 1 đổi 1"
                  />
                ) : (
                  <>
                    <ShieldCheck size={22} />
                    <small>
                      BẢO HÀNH
                      <br />
                      <b>
                        12 THÁNG
                        <br />1 ĐỔI 1
                      </b>
                    </small>
                  </>
                )}
              </div>
            </div>
            <div className="pdp-rating">
              <span className="stars">★★★★★</span>
              <a href="#product-reviews">
                {ratingCounts[product.handle] || 0} đánh giá
              </a>
              {shaving && (
                <>
                  <span>Đã bán 77.7k</span>
                  <strong>Best Seller Shopee & TikTok Shop</strong>
                </>
              )}
            </div>
            {product.summary && (
              <p className="pdp-description">{product.summary}</p>
            )}
            {product.features.length > 0 && (
              <div className="product-features">
                {product.features.map((feature, i) => {
                  const Icon = [Zap, ShieldCheck, Droplets, Heart][i % 4];
                  return (
                    <span key={feature}>
                      <Icon size={24} strokeWidth={1} />
                      {feature}
                    </span>
                  );
                })}
              </div>
            )}
            {shaving && (
              <>
                <div className="pinned-review">
                  <button
                    aria-label="Review trước"
                    onClick={() => setReview((review + 2) % 3)}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div>
                    <strong>
                      {quotes[review].name} <span className="stars">★★★★★</span>
                    </strong>
                    <p>{quotes[review].quote}</p>
                  </div>
                  <button
                    aria-label="Review sau"
                    onClick={() => setReview((review + 1) % 3)}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
                <div className="version-heading">
                  <span>Phiên bản</span>
                  <button onClick={() => setComparison(true)}>So sánh</button>
                </div>
                <div className="product-versions">
                  {["trimday-lite", "trimday-3-0-max"].map((handle, i) => {
                    const p = site.products.find((p) => p.handle === handle)!;
                    return (
                      <Link
                        key={handle}
                        className={handle === product.handle ? "active" : ""}
                        href={p.path}
                      >
                        <span className="version-badge">
                          {i ? "Mạnh nhất" : "Gọn nhẹ"}
                        </span>
                        <img
                          src={product.switchImages[i] || p.images[0].src}
                          alt={p.title}
                        />
                        <span className="version-caption">
                          {p.title}
                          <small>
                            {handle === product.handle
                              ? "Bạn đang xem"
                              : `Chỉ từ ${Number(p.variants[0].price) / 1000}k`}
                          </small>
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
            <p className="pdp-shipping">
              <Truck size={16} />
              {Number(variant.price) >= 350000
                ? "Freeship"
                : "Miễn phí giao hàng từ 350.000₫"}
            </p>
            <div className="purchase-panel" id="mua">
              <div className="purchase-product">
                <img src={product.images[0].src} alt="" />
                <strong>{product.title}</strong>
                <div>
                  <strong>{money(variant.price)}</strong>
                  {variant.compare_at_price &&
                    Number(variant.compare_at_price) >
                      Number(variant.price) && (
                      <del>{money(variant.compare_at_price)}</del>
                    )}
                </div>
              </div>
              {product.variants.length > 1 && (
                <label className="variant-select">
                  Lựa chọn
                  <select
                    value={variantIndex}
                    onChange={(e) => setVariantIndex(Number(e.target.value))}
                  >
                    {product.variants.map((v, i) => (
                      <option key={v.id} value={i}>
                        {v.title} — {money(v.price)}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <div className="purchase-actions">
                <div className="quantity">
                  <button
                    aria-label="Giảm số lượng"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(quantity - 1)}
                  >
                    <Minus size={16} />
                  </button>
                  <span aria-label="Số lượng">{quantity}</span>
                  <button
                    aria-label="Tăng số lượng"
                    disabled={quantity >= 99}
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <button
                  className="btn"
                  disabled={!variant.available}
                  onClick={() => add(product, quantity)}
                >
                  {variant.available ? "Thêm vào giỏ hàng" : "Hết hàng"}
                </button>
              </div>
              <div className="purchase-trust">
                <span>
                  <Check size={15} />
                  Đóng gói kín đáo
                </span>
                <span>
                  <ShieldCheck size={15} />
                  Bảo hành 1 đổi 1
                </span>
              </div>
            </div>
            <div className="product-accordions">
              {product.details
                .filter(
                  (d, i, a) =>
                    d.title &&
                    d.kind === "spec" &&
                    a.findIndex((x) => x.title === d.title) === i,
                )
                .map((detail, i) => (
                  <details key={i}>
                    <summary>{detail.title}</summary>
                    <div
                      className="prose"
                      dangerouslySetInnerHTML={{ __html: detail.html }}
                    />
                  </details>
                ))}
              {product.body_html && (
                <details>
                  <summary>Thông tin sản phẩm</summary>
                  <div
                    className="prose"
                    dangerouslySetInnerHTML={{ __html: product.body_html }}
                  />
                </details>
              )}
            </div>
          </div>
        </div>
      </section>
      <section id="product-reviews" className="product-social">
        <div>
          <strong>4.88</strong>
          <span className="stars">★★★★★</span>
          <span>
            Dựa trên {ratingCounts[product.handle] || 0} đánh giá đã xác minh
          </span>
        </div>
        <h2>Đánh giá từ người đã mua hàng</h2>
        <Link href="/pages/ho-tro">Bạn cần tư vấn? Liên hệ Spotless</Link>
      </section>
      {product.sections
        .filter(
          (s) =>
            s.title &&
            !/Chia sẻ thật|Câu hỏi thường gặp|Đánh giá từ người/.test(s.title),
        )
        .map((section, i) => (
          <section
            className={`product-story ${i % 2 ? "reverse" : ""}`}
            key={i}
          >
            <div>
              <span className="eyebrow">SPOTLESS® · {product.title}</span>
              <h2>{section.title}</h2>
              {section.text && <p>{section.text}</p>}
              {section.points
                ?.filter((point: string) => point !== section.text)
                .map((point: string) => (
                  <p key={point}>{point}</p>
                ))}
            </div>
            {section.comparison.length > 0 && (
              <div className="product-comparison">
                <table>
                  <thead>
                    <tr>
                      {section.comparison.slice(0, 5).map((cell, i) => (
                        <th key={i}>{cell || "Tiêu chí"}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from(
                      { length: (section.comparison.length - 5) / 5 },
                      (_, row) => (
                        <tr key={row}>
                          {section.comparison
                            .slice(5 + row * 5, 10 + row * 5)
                            .map((cell, i) => (
                              <td key={i}>{cell}</td>
                            ))}
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            )}
            {section.image && (
              <img src={section.image} alt={section.title} loading="lazy" />
            )}
          </section>
        ))}
      {product.details.some((d) => d.kind === "faq") && (
        <section className="pdp-faq container narrow">
          <span className="eyebrow">Giải đáp nhanh</span>
          <h2>Câu hỏi thường gặp</h2>
          {product.details
            .filter((d) => d.kind === "faq")
            .map((detail, i) => (
              <details key={i}>
                <summary>{detail.title}</summary>
                <div
                  className="prose"
                  dangerouslySetInnerHTML={{ __html: detail.html }}
                />
              </details>
            ))}
        </section>
      )}
      {shaving && <ReviewRail />}
      <section className="pdp-related container">
        <h2>Cùng chăm sóc toàn diện</h2>
        <div className="collection-grid">
          {featuredHandles
            .filter((h) => h !== product.handle)
            .slice(0, 3)
            .map((h) => (
              <ProductCard
                key={h}
                product={site.products.find((p) => p.handle === h)!}
              />
            ))}
        </div>
      </section>
      {lightbox && (
        <Modal
          label={`Ảnh ${product.title}`}
          onClose={() => setLightbox(false)}
          className="gallery-modal"
        >
          <button
            className="icon-button modal-close"
            aria-label="Đóng ảnh"
            onClick={() => setLightbox(false)}
          >
            <X />
          </button>
          <img
            src={gallery[image]}
            alt={`${product.title} — ảnh ${image + 1}`}
          />
          <div className="gallery-modal-nav">
            <button
              className="icon-button"
              aria-label="Ảnh trước"
              onClick={() =>
                setImage((image - 1 + gallery.length) % gallery.length)
              }
            >
              <ChevronLeft />
            </button>
            <span>
              {image + 1} / {gallery.length}
            </span>
            <button
              className="icon-button"
              aria-label="Ảnh tiếp"
              onClick={() => setImage((image + 1) % gallery.length)}
            >
              <ChevronRight />
            </button>
          </div>
        </Modal>
      )}
      {comparison && (
        <Modal
          label="So sánh phiên bản TRIMDAY"
          onClose={() => setComparison(false)}
          className="comparison-modal"
        >
          <button
            className="icon-button modal-close"
            aria-label="Đóng so sánh"
            onClick={() => setComparison(false)}
          >
            <X />
          </button>
          <h2>Chọn TRIMDAY® của bạn</h2>
          <div className="comparison-products">
            {["trimday-lite", "trimday-3-0-max"].map((h) => {
              const p = site.products.find((p) => p.handle === h)!;
              return (
                <div key={h}>
                  <img src={p.images[0].src} alt={p.title} />
                  <h3>{p.title}</h3>
                  <strong>{money(p.variants[0].price)}</strong>
                  <p>{p.summary}</p>
                  <Link
                    className="btn"
                    href={p.path}
                    onClick={() => setComparison(false)}
                  >
                    Xem chi tiết
                  </Link>
                </div>
              );
            })}
          </div>
        </Modal>
      )}
    </>
  );
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}
export function SearchPage({ query = "" }: { query?: string }) {
  const needle = normalize(query.trim());
  const products = needle
    ? site.products.filter((p) =>
        normalize(`${p.title} ${p.summary}`).includes(needle),
      )
    : [];
  const articles = needle
    ? site.articles.filter((a) =>
        normalize(`${a.title} ${a.excerpt}`).includes(needle),
      )
    : [];
  return (
    <section className="search-page container">
      <h1>Tìm kiếm</h1>
      <form action="/search" role="search">
        <label htmlFor="search-query">Bạn đang tìm gì?</label>
        <div>
          <input
            id="search-query"
            type="search"
            name="q"
            placeholder="Tìm sản phẩm, bài viết..."
            defaultValue={query}
            required
          />
          <button className="btn" type="submit">
            Tìm kiếm
          </button>
        </div>
      </form>
      {needle && (
        <>
          <p>
            {products.length + articles.length} kết quả cho “{query}”
          </p>
          <div className="collection-grid">
            {products.map((p) => (
              <ProductCard key={p.handle} product={p} />
            ))}
          </div>
          <div className="search-articles">
            {articles.map((a) => (
              <Link key={a.path} href={a.path}>
                <img src={a.image} alt="" />
                <div>
                  <h2>{a.title}</h2>
                  <p>{a.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
          {!products.length && !articles.length && (
            <p>Không tìm thấy kết quả. Bạn thử từ khóa khác nhé.</p>
          )}
        </>
      )}
      <Link href="/collections/all" className="search-back">
        <ArrowLeft size={16} /> Xem tất cả sản phẩm
      </Link>
    </section>
  );
}
