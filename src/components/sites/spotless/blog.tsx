import Image from "next/image";
import Link from "next/link";
import { site, type Article } from "./data";
import { ArticleContent } from "./article-content";
import "./blog.css";

function categoryName(category: string) {
  return (
    site.blogs.find((blog) => blog.path === `/blogs/${category}`)?.title ??
    "Spotless Blog"
  );
}

function ArticleDate({ date }: { date: string }) {
  if (!date) return null;
  const [year, month, day] = date.slice(0, 10).split("-");
  return (
    <time dateTime={date}>
      {day}.{month}.{year}
    </time>
  );
}

function ArticleCover({
  article,
  featured = false,
}: {
  article: Article;
  featured?: boolean;
}) {
  return (
    <div
      className={featured ? "spot-blog-feature-media" : "spot-blog-card-media"}
    >
      {article.image ? (
        <Image
          src={article.image}
          alt={article.title}
          {...(featured ? { width: 900, height: 900 } : { fill: true })}
          unoptimized
          sizes={
            featured
              ? "(max-width: 860px) 100vw, 590px"
              : "(max-width: 520px) 100vw, (max-width: 860px) 50vw, 340px"
          }
        />
      ) : (
        <div className="spot-blog-text-cover">
          <span>spotless</span>
          <small>{categoryName(article.category)}</small>
        </div>
      )}
    </div>
  );
}

function ArticleCard({ article }: { article: Article }) {
  return (
    <Link className="spot-blog-card" href={article.path}>
      <ArticleCover article={article} />
      <div className="spot-blog-card-body">
        <div className="spot-blog-meta">
          <span className="spot-blog-category">
            {categoryName(article.category)}
          </span>
          <span aria-hidden="true">·</span>
          <ArticleDate date={article.date} />
        </div>
        <h3>{article.title}</h3>
        {article.excerpt && <p>{article.excerpt}</p>}
        <span className="spot-blog-more">Đọc tiếp</span>
      </div>
    </Link>
  );
}

export function BlogPage({ path }: { path: string }) {
  const category =
    path === "/pages/huong-dan-su-dung"
      ? "huong-dan-su-dung"
      : path.split("/")[2];
  const articles = site.articles.filter(
    (article) => article.category === category,
  );
  const [featured, ...remaining] = articles;

  return (
    <section className="spot-blog">
      <div className="spot-blog-wrap">
        <header className="spot-blog-heading">
          <p className="spot-blog-eyebrow">Blog · Tin tức</p>
          <h1>{categoryName(category)}</h1>
        </header>
        {featured && (
          <Link className="spot-blog-feature" href={featured.path}>
            <ArticleCover article={featured} featured />
            <div className="spot-blog-feature-body">
              <div className="spot-blog-meta">
                <span className="spot-blog-badge">Nổi bật</span>
                <span className="spot-blog-category">
                  {categoryName(category)}
                </span>
                <span aria-hidden="true">·</span>
                <ArticleDate date={featured.date} />
              </div>
              <h2>{featured.title}</h2>
              {featured.excerpt && <p>{featured.excerpt}</p>}
              <span className="spot-blog-more">Đọc bài viết</span>
            </div>
          </Link>
        )}
        <div className="spot-blog-grid">
          {remaining.map((article) => (
            <ArticleCard key={article.path} article={article} />
          ))}
        </div>
        <nav className="spot-blog-categories" aria-label="Chuyên mục blog">
          {site.blogs.map((blog) => (
            <Link
              key={blog.path}
              href={blog.path}
              aria-current={
                blog.path === `/blogs/${category}` ? "page" : undefined
              }
            >
              {blog.title}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}

export function ArticlePage({ article }: { article: Article }) {
  const related = site.articles
    .filter(
      (item) =>
        item.path !== article.path && item.category === article.category,
    )
    .slice(0, 3);
  const sourceUrl = `https://spotless.vn${article.path}`;

  return (
    <article className="spot-article">
      <header className="spot-article-head">
        <nav aria-label="Đường dẫn" className="spot-article-breadcrumb">
          <ol>
            <li>
              <Link href="/">Trang chủ</Link>
            </li>
            <li>
              <Link href={`/blogs/${article.category}`}>
                {categoryName(article.category)}
              </Link>
            </li>
            <li aria-current="page">{article.title}</li>
          </ol>
        </nav>
        <div className="spot-blog-meta">
          <Link
            className="spot-blog-category"
            href={`/blogs/${article.category}`}
          >
            {categoryName(article.category)}
          </Link>
          <span aria-hidden="true">·</span>
          <ArticleDate date={article.date} />
        </div>
        <h1>{article.title}</h1>
      </header>
      {article.image && (
        <div className="spot-article-hero">
          <div>
            <Image
              src={article.image}
              alt={article.title}
              fill
              unoptimized
              sizes="(max-width: 980px) 100vw, 932px"
              priority
            />
          </div>
        </div>
      )}
      <ArticleContent html={article.html} />
      <div className="spot-article-share">
        <span>Chia sẻ bài viết</span>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(sourceUrl)}`}
          target="_blank"
          rel="noreferrer"
        >
          Facebook
        </a>
        <a
          href={`mailto:?subject=${encodeURIComponent(article.title)}&body=${encodeURIComponent(sourceUrl)}`}
        >
          Email
        </a>
        <Link href={`/blogs/${article.category}`}>Về chuyên mục</Link>
      </div>
      {related.length > 0 && (
        <section className="spot-article-related">
          <div>
            <h2>Bài viết liên quan</h2>
            <div className="spot-blog-grid">
              {related.map((item) => (
                <ArticleCard key={item.path} article={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
