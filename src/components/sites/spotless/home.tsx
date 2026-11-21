"use client";

/* eslint-disable @next/next/no-img-element -- Keep the downloaded source media and picture crops unchanged. */

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { site, featuredHandles } from "./data";
import { ProductCard } from "./shop";
import { ReviewRail } from "./reviews";
import "./home.css";

function ScrollProduct() {
  const root = useRef<HTMLElement>(null);
  const clip = useRef<HTMLDivElement>(null);
  const head = useRef<HTMLHeadingElement>(null);
  const roller = useRef<HTMLDivElement>(null);
  const cta = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const section = root.current,
      media = video.current;
    if (!section || !media) return;
    let frame = 0;
    let viewport = { width: window.innerWidth, height: window.innerHeight };
    const clamp = (v: number) => Math.min(1, Math.max(0, v));
    const smooth = (v: number) => v * v * (3 - 2 * v);
    function draw() {
      frame = 0;
      if (!section || !media) return;
      const { width: w, height: h } = viewport;
      const progress = clamp(
        -section.getBoundingClientRect().top / (section.offsetHeight - h),
      );
      if (head.current)
        head.current.style.opacity = String(clamp(1 - progress / 0.16));
      if (clip.current && w > 820) {
        const t = smooth(clamp(progress / 0.3));
        const size =
          Math.min(h * 0.82, w * 0.52) * (1 - t) +
          Math.min(h * 0.9, w * 0.5) * t;
        Object.assign(clip.current.style, {
          width: `${size}px`,
          height: `${size}px`,
          left: `${((w - size) / 2) * (1 - t) + (w * 0.73 - size / 2) * t}px`,
          top: `${(h - size) / 2}px`,
        });
      } else if (clip.current) {
        clip.current.removeAttribute("style");
        media.style.objectPosition = `${50 - 36 * smooth(clamp(progress / 0.26))}% center`;
      }
      const lines = roller.current
        ? (Array.from(roller.current.children) as HTMLElement[])
        : [];
      if (roller.current && lines.length) {
        const first = lines[0].offsetTop + lines[0].offsetHeight / 2;
        const last = lines.at(-1)!;
        const end = last.offsetTop + last.offsetHeight / 2;
        const y =
          (h * 1.02 - first) * (1 - progress) + (h * 0.6 - end) * progress;
        roller.current.style.transform = `translateY(${y}px)`;
        const range = (lines[1].offsetTop - lines[0].offsetTop) * 0.92;
        for (const line of lines) {
          const near = smooth(
            clamp(
              1 -
                Math.abs(y + line.offsetTop + line.offsetHeight / 2 - h * 0.6) /
                  range,
            ),
          );
          line.style.color = `rgb(${[199, 196, 189].map((v, i) => Math.round(v + ([22, 21, 29][i] - v) * near)).join(",")})`;
          line.style.transform = `scale(${0.84 + 0.26 * near})`;
        }
      }
      if (cta.current) {
        const t = smooth(clamp((progress - 0.82) / 0.12));
        cta.current.style.opacity = String(t);
        cta.current.style.transform = `translateY(${(1 - t) * 16}px)`;
        cta.current.style.visibility = t > 0.6 ? "visible" : "hidden";
      }
      if (
        Number.isFinite(media.duration) &&
        media.readyState >= 2 &&
        !media.seeking
      ) {
        const time = progress * (media.duration - 0.05);
        if (Math.abs(media.currentTime - time) > 0.025)
          media.currentTime = time;
      }
    }
    function schedule() {
      if (!frame) frame = requestAnimationFrame(draw);
    }
    function resize() {
      if (
        window.innerWidth !== viewport.width ||
        Math.abs(window.innerHeight - viewport.height) > 140
      ) {
        viewport = { width: window.innerWidth, height: window.innerHeight };
        schedule();
      }
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          media!.preload = "auto";
          media!.load();
          observer.disconnect();
        }
      },
      { rootMargin: "150% 0px" },
    );
    observer.observe(section);
    media.addEventListener("loadeddata", schedule);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", resize);
    schedule();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      media.removeEventListener("loadeddata", schedule);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return (
    <section
      className="scroll-product"
      ref={root}
      aria-label="Công nghệ TRIMDAY"
    >
      <div className="scroll-stage">
        <h2 ref={head}>
          Chuẩn mực mới của
          <br />
          chăm sóc nam giới.
        </h2>
        <div className="scroll-clip" ref={clip}>
          <video
            ref={video}
            src={site.home.scrub.video}
            poster={site.home.scrub.poster}
            muted
            playsInline
            preload="none"
          />
        </div>
        <div className="scroll-lines" ref={roller}>
          {site.home.scrub.lines.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
        <div className="scroll-cta" ref={cta}>
          <Link className="btn" href="/collections/may-cạo">
            Mua TRIMDAY®
          </Link>
        </div>
      </div>
    </section>
  );
}

function FeatureSplit({ index }: { index: number }) {
  const split = site.home.splits[index];
  return (
    <section className={`feature-split ${index === 1 ? "reverse" : ""}`}>
      <div className="feature-image">
        <img src={split.image} alt={split.title} loading="lazy" />
      </div>
      <div className="feature-copy">
        <span className="eyebrow-pill">
          {split.eyebrow ||
            (index === 0 ? "Công nghệ TRIMGUARD®" : "Chống nước IPX7")}
        </span>
        <h2>{split.title}</h2>
        <p>{split.text}</p>
        <Link className="btn secondary" href={split.path}>
          {split.cta}
        </Link>
      </div>
    </section>
  );
}

export function HomePage() {
  const products = useRef<HTMLDivElement>(null);
  return (
    <>
      <section className="home-hero">
        <picture>
          <source media="(max-width:700px)" srcSet={site.home.heroMobile} />
          <img
            src={site.home.hero}
            alt="Nâng cấp toàn diện cho vùng kín"
            fetchPriority="high"
          />
        </picture>
        <div className="hero-scrim" />
        <div className="hero-copy">
          <h1>Nâng cấp toàn diện cho vùng kín</h1>
          <Link className="btn" href="/collections/may-cạo">
            Mua TRIMDAY<sup>®</sup>
          </Link>
        </div>
      </section>
      <section className="categories-section">
        <div className="container">
          <h2>Hàng đầu cho hàng dưới</h2>
          <div className="category-rail">
            {site.home.categories.map((category) => (
              <Link
                className="category-card"
                href={category.path}
                key={category.path}
              >
                <img src={category.image} alt={category.title} loading="lazy" />
                <h3>{category.title}</h3>
                <span>Xem thêm</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <ScrollProduct />
      <ReviewRail />
      <FeatureSplit index={0} />
      <section className="bestsellers">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow-pill">Khách chọn nhiều nhất</span>
            <h2>Bán chạy nhất</h2>
            <p className="muted">Được thiết kế cho vùng da nhạy cảm nhất.</p>
          </div>
          <div className="product-rail" ref={products}>
            {featuredHandles.map((handle) => (
              <ProductCard
                key={handle}
                product={site.products.find((p) => p.handle === handle)!}
              />
            ))}
          </div>
          <div className="rail-navigation">
            <button
              aria-label="Sản phẩm trước"
              onClick={() =>
                products.current?.scrollBy({ left: -640, behavior: "smooth" })
              }
            >
              <ChevronLeft size={18} />
            </button>
            <button
              aria-label="Sản phẩm tiếp theo"
              onClick={() =>
                products.current?.scrollBy({ left: 640, behavior: "smooth" })
              }
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <Link className="all-products" href="/collections/all">
            Xem tất cả sản phẩm
          </Link>
        </div>
      </section>
      <FeatureSplit index={1} />
      <section className="benefits-section">
        <div className="container narrow benefits-grid">
          <div>
            <span className="eyebrow-pill">Đặc quyền khách hàng</span>
            <h2>
              Mua một lần,
              <br />
              an tâm dài lâu
            </h2>
            <ul>
              {(site.home.benefits.items.length
                ? site.home.benefits.items
                : [
                    "Đổi trả & hoàn tiền không mất phí trong 15 ngày",
                    "Bảo hành 1 đổi 1 trong 12 tháng với lỗi nhà sản xuất",
                    "Miễn phí giao hàng toàn quốc cho đơn từ 350.000₫",
                    "Đóng gói kín đáo, tế nhị - trải nghiệm unbox cao cấp",
                    "Hỗ trợ tư vấn riêng tư, nhanh chóng qua tin nhắn",
                  ]
              ).map((item) => (
                <li key={item}>
                  <Check size={19} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <img
            src={site.home.benefits.image}
            alt="Mua một lần, an tâm dài lâu"
            loading="lazy"
          />
        </div>
      </section>
    </>
  );
}
