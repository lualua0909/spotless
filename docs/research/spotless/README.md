# Nghiên cứu và kiểm tra Spotless

Nguồn: https://spotless.vn/ · Snapshot ngày 20/11/2026. Thực hiện trong repository local, không publish.

## Phạm vi và route

Đường dẫn nguồn được giữ nguyên ở local. [routes.json](routes.json) liệt kê đầy đủ 55 đường dẫn trong bản đồ nguồn, gồm các alias và trang tiện ích.

| Nguồn → local | Dữ liệu | Component sở hữu |
| --- | --- | --- |
| `/` → `/` | Hero, danh mục, video cuộn, nhận xét, công nghệ, bán chạy, quyền lợi | `home.tsx`, `reviews.tsx` |
| `/products/*` → cùng pathname | Đủ 8 sản phẩm, gallery, giá/tình trạng, thông số, nội dung và FAQ | `shop.tsx` |
| `/collections/*` → cùng pathname | Tất cả, máy cạo, phụ kiện, chăm sóc da, Best Sellers | `shop.tsx` |
| `/blogs/{cham-soc-nam-gioi,suc-khoe,news,huong-dan-su-dung,tuyen-dung-viec-lam}` | Danh sách chỉ gồm 10 bài đã chọn | `blog.tsx` |
| 10 pathname bài viết → cùng pathname | Toàn bộ nội dung 10 bài, hình và đường dẫn video hướng dẫn | `blog.tsx`, `article-content.tsx` |
| `/pages/*` trong sitemap → cùng pathname | 21 trang chính sách/giới thiệu/hỗ trợ và các tiện ích nguồn | `information.tsx` |
| `/pages/huong-dan-su-dung` | Alias giao diện chuyên mục hướng dẫn | `blog.tsx` |
| `/pages/chinh-sach-bao-mat` | Alias trang chính sách có dấu | `[...slug]/page.tsx` |
| `/search`, `/cart` | Tìm kiếm, giỏ hàng local | `shop.tsx`, `shell.tsx` |

Các alias tiện ích `/account`, `/account/login`, `/checkout` cũng hoạt động. Hai liên kết sản phẩm cũ `/products/dịu-cool`, `/products/kem-duong-sau-cao` được đưa về DỊU COOL. Slug tiếng Việt được giữ cả khi URL có percent encoding.

Header, footer, consent cookie, menu, chat hỗ trợ và cart drawer nằm trong `shell.tsx`; trạng thái giỏ hàng và dialog ở `store.tsx`. Data dùng chung nằm trong `src/data/spotless.json`; ảnh/font/video ở `public/sites/spotless/`.

## 10 bài tiêu biểu

| Chuyên mục | Bài viết |
| --- | --- |
| Hướng dẫn | TRIMDAY 3.0 MAX - Hướng Dẫn Sử Dụng |
| Hướng dẫn | TRIMDAY LITE - Hướng Dẫn Sử Dụng |
| Sức khỏe | Tóc Bạc Sớm Có Phải Dấu Hiệu Sức Khỏe Đang Gặp Nguy Hiểm? |
| Sức khỏe | Tạm Biệt Tóc Bết – 22 Cách Giúp Tóc Anh Em Đỡ Dầu Mà Vẫn Khỏe Mượt |
| Chăm sóc nam giới | Cạo lông nách có bị thâm không? Cách tránh thâm sần |
| Chăm sóc nam giới | Cạo Lông Vùng Kín Nam Có Mọc Lại Không? Sự Thật Về “Rừng Rậm” |
| Chăm sóc nam giới | Cách cạo lông vùng kín nam không bị mẩn đỏ: 6 bước chuẩn y khoa |
| Chăm sóc nam giới | Cách cạo lông vùng kín nam không bị mọc ngược: Hướng dẫn từ A-Z |
| Tin tức | 6 Điều Cần Lưu Ý Khi Mua Máy Cạo Lông Cho Nam |
| Tuyển dụng | VJ - Content Creator Fulltime - (Upto 18M) |

Các bài khác không tải nội dung/ảnh; liên kết tham khảo tới chúng giữ đích trên website gốc.

## Ghi nhận thiết kế

- Nền `#FDFCF9`, chữ `#16151D`, cream `#F0E1CE`, màu CTA `#A34D16`, navy `#142E47`.
- Font đúng nguồn: Oswald cho heading và Google Sans Flex cho nội dung; WOFF2 lấy từ CSS thực tế của Chrome, lưu local.
- Announcement 38px, navigation 70px desktop; mobile cũng giữ 38px/70px. Header trên hero trong suốt, đổi nền khi cuộn; menu desktop hover/focus, mobile dùng drawer.
- Hero `clamp(620px,92vh,980px)`, ảnh desktop/mobile riêng, crop `center 68%`, heading 34–56px.
- Danh mục 3 cột trên desktop; mobile trượt ngang. Video TRIMDAY ghim trong section 460vh, currentTime và vị trí chữ/clip thay đổi theo tiến độ cuộn, hỗ trợ cuộn ngược.
- Trang sản phẩm có gallery sticky desktop và bố cục 1.12fr/1fr, gap64px; xếp dọc dưới900px. Danh mục 3 cột desktop, 2 cột mobile.
- Blog có bài nổi bật, grid và nội dung đọc cột hẹp. Chính sách có mục lục; FAQ dùng native details và tìm kiếm bỏ dấu.

HTML/CSS/JS production lưu trong `source/` chỉ dùng làm bằng chứng; frontend chạy component React tự dựng. HTML bài viết/chính sách được lọc script, form, handler và media bên ngoài không phục vụ clone.

## Asset

[asset-map.json](asset-map.json) ánh xạ URL gốc tới 166 file local. File ảnh, font, video đều được tải về. Chrome được dùng để lấy lại 11 trang nguồn trả 429 cho HTTP client; [source-status.json](source-status.json) hiện không còn trang thiếu.

[import-errors.json](import-errors.json) ghi một ảnh minh họa của chính sách vận chuyển trên `image.optcdn.me` bị timeout cả HTTP lẫn Chrome. Bản local thay ảnh hỏng bằng liên kết tới ảnh gốc. Các video YouTube trong hai bài hướng dẫn vẫn dùng đúng nguồn embed khi bấm phát, cần Internet; video trang chủ/nhận xét nằm local.

## So sánh giao diện

Ảnh chụp cùng viewport desktop1440×1000 và mobile390×844. Các ảnh `*-top` chụp đầu trang sau khi đóng cookie; bộ source còn có menu, FAQ mở và các trạng thái cuộn. Ảnh full page ban đầu có vùng chưa reveal, nên dùng ảnh top/trạng thái cuộn cho đối chiếu.

| Trang | Nguồn desktop | Local desktop | Nguồn mobile | Local mobile |
| --- | --- | --- | --- | --- |
| Trang chủ | [Ảnh](screenshots/source-home-desktop-top.webp) | [Ảnh](screenshots/local-home-desktop-top.webp) | [Ảnh](screenshots/source-home-mobile-top.webp) | [Ảnh](screenshots/local-home-mobile-top.webp) |
| Sản phẩm | [Ảnh](screenshots/source-product-desktop-top.webp) | [Ảnh](screenshots/local-product-desktop-top.webp) | [Ảnh](screenshots/source-product-mobile-top.webp) | [Ảnh](screenshots/local-product-mobile-top.webp) |
| Danh mục | [Ảnh](screenshots/source-collection-desktop-top.webp) | [Ảnh](screenshots/local-collection-desktop-top.webp) | [Ảnh](screenshots/source-collection-mobile-top.webp) | [Ảnh](screenshots/local-collection-mobile-top.webp) |
| Hỗ trợ | [Ảnh](screenshots/source-support-desktop-top.webp) | [Ảnh](screenshots/local-support-desktop-top.webp) | [Ảnh](screenshots/source-support-mobile-top.webp) | [Ảnh](screenshots/local-support-mobile-top.webp) |
| Giới thiệu | [Ảnh](screenshots/source-about-desktop-top.webp) | [Ảnh](screenshots/local-about-desktop-top.webp) | [Ảnh](screenshots/source-about-mobile-top.webp) | [Ảnh](screenshots/local-about-mobile-top.webp) |
| Blog | [Ảnh](screenshots/source-blog-desktop-top.webp) | [Ảnh](screenshots/local-blog-desktop-top.webp) | [Ảnh](screenshots/source-blog-mobile-top.webp) | [Ảnh](screenshots/local-blog-mobile-top.webp) |
| Bài viết | [Ảnh](screenshots/source-article-desktop-top.webp) | [Ảnh](screenshots/local-article-desktop-top.webp) | [Ảnh](screenshots/source-article-mobile-top.webp) | [Ảnh](screenshots/local-article-mobile-top.webp) |

## Cách kiểm tra

```sh
npm run check
# Terminal 1:
npm run dev -- --hostname 127.0.0.1
# Terminal 2 (Chrome đã cài):
npm run check:browser
```

Kết quả `npm run check` được lưu ở [check-output.txt](check-output.txt). Kiểm tra header ở 5 chiều rộng, video hướng dẫn và favicon có tại [header-video-verification.json](header-video-verification.json). Kết quả browser được ghi trong [verification.json](verification.json), bao gồm HTTP từng route, ảnh/link nội bộ, overflow desktop/mobile, lỗi runtime và yêu cầu mạng ra ngoài. Test tương tác kiểm tra sắp xếp, tìm kiếm/không có kết quả, gallery/lightbox, so sánh, thông số, thêm/tăng/xóa giỏ hàng, reload, hết hàng, FAQ, form local và scrub video tiến/lùi.

## Khác biệt và giới hạn

- Bố cục một số section phía dưới trang sản phẩm được giản lược khi dựng native React; không khẳng định pixel-perfect. Bộ icon điều khiển và một số khoảng cách cũng có thể khác nguồn.
- Widget deal/combo/quà tặng, loyalty/credit, OTP, đánh giá bên thứ ba, gửi bảo hành, tra cứu đơn và thanh toán thật chưa được nối backend. Form local thông báo rõ trạng thái; không xác nhận giả giao dịch hoặc gửi dữ liệu đến nguồn.
- Banner ưu đãi/quà tặng trong ảnh nguồn được giữ như ảnh gốc. Giỏ hàng local tính giá sản phẩm từ snapshot, chưa thực thi quy tắc khuyến mãi động của Shopify/Baseform.
- Một ảnh CDN cũ chưa tải được; YouTube cần mạng khi phát. Các bài ngoài 10 bài đã chọn dẫn ra nguồn.
- `npm audit --omit=dev`: 0 cảnh báo. Còn4 cảnh báo moderate từ CLI shadcn ở devDependencies; không dùng `audit --force` để downgrade phá tương thích.
