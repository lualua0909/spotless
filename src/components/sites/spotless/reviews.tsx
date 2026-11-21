"use client";
/* eslint-disable @next/next/no-img-element -- Render the downloaded source media. */
import Link from "next/link";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { site } from "./data";
import "./home.css";

export function ReviewRail() {
  const rail = useRef<HTMLDivElement>(null);
  return (
    <section className="review-section">
      <div className="review-wrap">
        <span className="eyebrow-pill">Đánh giá thật</span>
        <h2>
          Chia sẻ thật. <span>Trải nghiệm thật.</span>
        </h2>
        <p className="muted">
          Hơn 70.000+ khách hàng tin tưởng - và đây là cảm nhận thật của họ.
        </p>
        <div className="review-rail-wrap">
          <button
            className="rail-arrow prev"
            aria-label="Đánh giá trước"
            onClick={() =>
              rail.current?.scrollBy({ left: -330, behavior: "smooth" })
            }
          >
            <ChevronLeft />
          </button>
          <div className="review-rail" ref={rail}>
            {site.home.reviews.map((review) => {
              const product = site.products.find(
                (p) => p.path === review.product,
              );
              return (
                <article className="review-card" key={review.name}>
                  <video
                    src={review.video}
                    controls
                    playsInline
                    preload="metadata"
                    loop
                    aria-label={`Video đánh giá của ${review.name}`}
                  />
                  <h3>{review.name}</h3>
                  <span className="eyebrow">{review.role}</span>
                  <p>{review.quote}</p>
                  {product && (
                    <Link className="review-product" href={product.path}>
                      <img src={product.images[0].src} alt={product.title} />
                      <div>
                        <span className="stars">★★★★★</span>
                        <strong>{product.title}</strong>
                        <small>{product.summary.slice(0, 48)}</small>
                      </div>
                    </Link>
                  )}
                </article>
              );
            })}
          </div>
          <button
            className="rail-arrow next"
            aria-label="Đánh giá tiếp theo"
            onClick={() =>
              rail.current?.scrollBy({ left: 330, behavior: "smooth" })
            }
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
}
