import snapshot from "@/data/spotless.json";

export const site = snapshot;
export type Product = (typeof site.products)[number];
export type Article = (typeof site.articles)[number];
export type Page = (typeof site.pages)[number];
export const money = (value: string | number) =>
  new Intl.NumberFormat("vi-VN").format(Number(value)) + "₫";
export const featuredHandles = [
  "trimday-3-0-max",
  "trimday-lite",
  "trimsmooth",
  "trimblade",
  "sach-cool",
  "diu-cool",
];
export const ratingCounts: Record<string, number> = {
  "trimday-3-0-max": 1661,
  "trimday-lite": 1671,
  trimsmooth: 5,
  trimblade: 2,
  "sach-cool": 317,
  "diu-cool": 56,
  "trimday-2-0": 4,
};
