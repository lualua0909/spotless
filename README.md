# Spotless

Bản dựng local của [spotless.vn](https://spotless.vn/), phát triển từ [ai-website-cloner-template](https://github.com/JCodesMore/ai-website-cloner-template). Dự án đã đổi tên thành `spotless` và gỡ remote `origin`.

Yêu cầu Node.js 24+ và npm. Dependencies đã được cài.

```sh
npm run dev -- --hostname 127.0.0.1
# http://127.0.0.1:3000
```

```sh
npm run check          # ESLint + TypeScript + production build
npm run build
npm start             # chạy production build
```

Có 55 route trong bản đồ nguồn, bao gồm trang chủ, 8 sản phẩm, 5 danh mục, 5 chuyên mục blog, 21 trang thông tin/hỗ trợ, các alias và trang tiện ích. Blog chỉ giữ đúng **10 bài tiêu biểu**: 2 hướng dẫn, 2 sức khỏe, 4 chăm sóc nam giới, 1 tin tức, 1 tuyển dụng. Nội dung và asset được lưu trong repository; không cần Shopify để render.

Menu desktop/mobile, bộ lọc sắp xếp, tìm kiếm, gallery/phóng to ảnh, so sánh phiên bản, FAQ, video và giỏ hàng hoạt động local. Giỏ hàng lưu trong trình duyệt, hỗ trợ thêm/xóa/đổi số lượng và tính tổng. Các form tài khoản/bảo hành/tra cứu cùng thanh toán là bản xem trước, chưa kết nối backend hay gửi thông tin đến hệ thống thật.

| Vị trí | Nội dung |
| --- | --- |
| `src/app/` | Route Next.js, metadata và layout |
| `src/components/sites/spotless/` | Component React, CSS, font và giỏ hàng |
| `src/data/spotless.json` | Dữ liệu trang, sản phẩm, 10 bài viết dưới dạng JSON local |
| `public/sites/spotless/` | 166 asset đã tải, gồm ảnh, font và video |
| [docs/research/spotless/README.md](docs/research/spotless/README.md) | Bản đồ route, kiểm tra, ảnh so sánh và khác biệt còn lại |

Để kiểm tra bằng Chrome đang cài trên máy, chạy dev server ở terminal thứ nhất, sau đó:

```sh
npm run check:browser
```

Playwright đã được cài dưới dạng dev dependency. Lệnh kiểm tra 55 route ở desktop/mobile, ảnh, link nội bộ, tìm kiếm/sắp xếp, gallery, FAQ, giỏ hàng và video cuộn hai chiều; chặn request ra ngoài để xác minh asset local.

Giỏ hàng và tùy chọn cookie dùng JSON trong `localStorage` của trình duyệt. Để chuyển ảnh mới sang WebP chất lượng 70, chạy `node scripts/compress-images.cjs`. Tùy chọn `--include-webp` mã hóa lại cả ảnh WebP hiện có.

Dữ liệu nguồn đã được lưu. Nếu cần tạo lại snapshot từ cache và tải asset còn thiếu:

```sh
python3 -m venv .venv
.venv/bin/pip install beautifulsoup4
.venv/bin/python scripts/import-spotless.py
```

Hướng dẫn clone cho agent vẫn nằm ở [.agents/skills/clone-website/SKILL.md](.agents/skills/clone-website/SKILL.md); bridge Claude ở [.claude/commands/clone-website.md](.claude/commands/clone-website.md).

Một ảnh minh họa trong chính sách vận chuyển dùng CDN cũ không truy cập được; bản local giữ liên kết ảnh gốc thay vì tạo ảnh lỗi. Chi tiết nằm trong `docs/research/spotless/import-errors.json`. Các bố cục chi tiết sản phẩm được dựng lại bằng React; widget deal/combo, loyalty, OTP, thanh toán và đánh giá của nhà cung cấp chưa được nối vào dịch vụ thật. Đây là bản tái dựng, chưa xác nhận khớp tuyệt đối từng pixel.

Next.js và ESLint config đã cập nhật lên 16.4.6 theo bản vá. `npm audit --omit=dev` không còn cảnh báo; 4 cảnh báo mức moderate còn nằm trong chuỗi dependency của CLI shadcn dùng khi phát triển. Không áp dụng downgrade phá vỡ tương thích mà `audit --force` đề xuất.

Giữ nguyên giấy phép MIT và thông tin tác giả template trong [LICENSE](LICENSE). Nội dung, nhận diện và hình ảnh nguồn thuộc về chủ sở hữu tương ứng.
