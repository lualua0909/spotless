import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { site } from "@/components/sites/spotless/data";
import {
  ProductPage,
  CollectionPage,
  SearchPage,
} from "@/components/sites/spotless/shop";
import { BlogPage, ArticlePage } from "@/components/sites/spotless/blog";
import { InformationPage } from "@/components/sites/spotless/information";
import { CartPage } from "@/components/sites/spotless/shell";

type Props = {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};
const aliases: Record<string, string> = {
  "/products/dịu-cool": "/products/diu-cool",
  "/products/kem-duong-sau-cao": "/products/diu-cool",
  "/pages/chinh-sach-bao-mat": "/pages/chinh-sach-bảo-mật",
  "/account/login": "/pages/tai-khoan",
  "/account": "/pages/tai-khoan",
  "/checkout": "/pages/thanhtoan",
};
function route(slug: string[]) {
  const path = "/" + slug.map((s) => decodeURIComponent(s)).join("/");
  return aliases[path] || path;
}
export function generateStaticParams() {
  return Array.from(
    new Set([
      ...site.products.map((p) => p.path),
      ...site.pages.map((p) => p.path),
      ...site.collections.map((p) => p.path),
      ...site.blogs.map((p) => p.path),
      ...site.articles.map((p) => p.path),
      "/cart",
      "/search",
      ...Object.keys(aliases),
    ]),
  ).map((path) => ({ slug: decodeURI(path).split("/").filter(Boolean) }));
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const path = route((await params).slug);
  const item = [
    ...site.products,
    ...site.pages,
    ...site.collections,
    ...site.blogs,
    ...site.articles,
  ].find((p) => decodeURI(p.path) === path);
  return {
    title:
      item?.title ||
      (path === "/search"
        ? "Tìm kiếm"
        : path === "/cart"
          ? "Giỏ hàng"
          : "Spotless"),
  };
}
export default async function Page({ params, searchParams }: Props) {
  const path = route((await params).slug);
  const query = await searchParams;
  const product = site.products.find((p) => p.path === path);
  if (product) return <ProductPage key={path} product={product} />;
  const collection = site.collections.find((c) => decodeURI(c.path) === path);
  if (collection)
    return (
      <CollectionPage
        path={path}
        sort={typeof query.sort_by === "string" ? query.sort_by : "manual"}
      />
    );
  if (
    path === "/pages/huong-dan-su-dung" ||
    site.blogs.some((b) => b.path === path)
  )
    return <BlogPage path={path} />;
  const article = site.articles.find((a) => a.path === path);
  if (article) return <ArticlePage article={article} />;
  if (site.pages.some((p) => decodeURI(p.path) === path))
    return <InformationPage key={path} path={path} />;
  if (path === "/search")
    return <SearchPage query={typeof query.q === "string" ? query.q : ""} />;
  if (path === "/cart") return <CartPage />;
  notFound();
}
