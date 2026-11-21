"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import Link from "next/link";
import { site } from "./data";
import "./information.css";

const faqGroups = [
  {
    id: "faq-product",
    title: "Máy & lưỡi cạo",
    eyebrow: "Sản phẩm",
    items: [
      {
        question: "TRIMDAY® dùng được cho vùng nào?",
        answer:
          '<p class="a">Máy được thiết kế chuyên biệt cho vùng kín, và bạn hoàn toàn có thể dùng cho đầu, ngực, nách, tay, chân hay bẹn. Mẹo nhỏ: kéo căng da một chút để máy đi mượt hơn.</p>',
      },
      {
        question: "Một máy hai lưỡi là thế nào?",
        answer:
          '<p class="a">Lưỡi cạo râu TRIMSMOOTH™ dành cho râu mỗi sáng, lưỡi thay thế TRIMBLADE™ dành cho vùng kín - khoảng một lần mỗi tháng. Bạn tháo ra gắn vào chỉ trong vài giây.</p>',
      },
      {
        question: "Có làm xước hay rát da không?",
        answer:
          '<p class="a">Không. Công nghệ TRIMGUARD® có trên cả hai lưỡi - lưỡi cắt không chạm trực tiếp vào da, nên bạn có thể yên tâm cạo sát.</p>',
      },
      {
        question: "Pin dùng được bao lâu?",
        answer:
          '<p class="a">Pin kéo dài tới 3 tháng mỗi lần sạc. Khi cần, bạn sạc đầy chỉ sau khoảng 90 phút qua cổng USB Type-C.</p>',
      },
      {
        question: "Cạo khô hay cạo ướt?",
        answer:
          '<p class="a">Cả hai đều được. Máy đạt chuẩn chống nước IPX7 nên bạn thoải mái cạo khô hay cạo ướt ngay dưới vòi sen.</p>',
      },
    ],
  },
  {
    id: "faq-usage",
    title: "Cách dùng & vệ sinh",
    eyebrow: "Sử dụng",
    items: [
      {
        question: "Lần đầu nên bắt đầu thế nào?",
        answer:
          '<p class="a">Bạn hãy bắt đầu với đầu cữ dài nhất, đi ngược chiều lông và lướt nhẹ tay. Khi da đã quen, bạn rút ngắn cữ dần là được.</p>',
      },
      {
        question: "Vệ sinh máy thế nào?",
        answer:
          '<p class="a">Bạn rửa máy trực tiếp dưới vòi nước, quét vụn lông bằng chổi mini đi kèm và lau khô trước khi cất là được.</p>',
      },
      {
        question: "Bao lâu nên thay lưỡi?",
        answer:
          '<p class="a">Khoảng 3-6 tháng một lần, hoặc ngay khi bạn thấy máy bắt đầu kéo lông.</p>',
      },
      {
        question: "Có gây lông mọc ngược không?",
        answer:
          '<p class="a">Lưỡi cắt được thiết kế cách da nên không gây đau rát, đồng thời giảm thiểu tối đa lông mọc ngược và viêm nang lông.</p>',
      },
    ],
  },
  {
    id: "faq-shipping",
    title: "Đặt hàng & giao hàng",
    eyebrow: "Đơn hàng",
    items: [
      {
        question: "Bao lâu thì nhận được hàng?",
        answer:
          '<p class="a">Nội thành TP.HCM và Hà Nội thường nhận trong 1-2 ngày, các tỉnh khác từ 2-4 ngày làm việc.</p>',
      },
      {
        question: "Phí giao hàng bao nhiêu?",
        answer:
          '<p class="a">Miễn phí giao hàng toàn quốc cho đơn từ 350.000₫. Với đơn dưới mức này, phí giao được hiển thị rõ ở bước thanh toán trước khi bạn xác nhận.</p>',
      },
      {
        question: "Có thanh toán khi nhận hàng không?",
        answer:
          '<p class="a">Có. Bạn hoàn toàn có thể kiểm tra hàng trước khi thanh toán cho shipper.</p>',
      },
      {
        question: "Theo dõi đơn ở đâu?",
        answer:
          '<p class="a">Bạn nhập mã đơn tại trang <a href="/pages/theo-doi-don-hang">Theo dõi đơn hàng</a>, hoặc bấm vào link theo dõi trong email xác nhận.</p>',
      },
    ],
  },
  {
    id: "faq-warranty",
    title: "Hoàn tiền & bảo hành",
    eyebrow: "Yên tâm",
    items: [
      {
        question: "Đổi ý sau khi mua thì sao?",
        answer:
          '<p class="a">Spotless® hoàn tiền trong 15 ngày kể từ khi bạn nhận hàng - kể cả khi bạn đã mở hộp dùng thử.</p>',
      },
      {
        question: "Ai chịu phí ship khi đổi trả?",
        answer:
          '<p class="a">Chi phí phát sinh sẽ theo thỏa thuận giữa hai bên. Bạn hãy gọi 0978 551 893 trước khi gửi hàng để đội Spotless® hướng dẫn phương án phù hợp nhất.</p>',
      },
      {
        question: "Bảo hành thế nào?",
        answer:
          '<p class="a">Máy được bảo hành 1 đổi 1 trong 365 ngày với mọi lỗi từ nhà sản xuất. Bạn chỉ cần giữ SĐT đặt hàng hoặc mã đơn để <a href="/pages/warranty">kích hoạt bảo hành</a>.</p>',
      },
      {
        question: "Máy lỗi thì làm gì?",
        answer:
          '<p class="a">Bạn gọi 0978 551 893 hoặc email support@spotless.vn kèm mã đơn. Đủ điều kiện là Spotless® đổi máy mới cho bạn, không hỏi vòng vo.</p>',
      },
      {
        question: "Nhận hàng thiếu hoặc hộp hỏng?",
        answer:
          '<p class="a">Bạn chụp ảnh kiện hàng và gửi kèm mã đơn trong vòng 48 giờ, Spotless® sẽ gửi bù ngay.</p>',
      },
    ],
  },
  {
    id: "faq-partner",
    title: "Đại lý & hợp tác",
    eyebrow: "Hợp tác",
    items: [
      {
        question: "Muốn làm đại lý hoặc phân phối?",
        answer:
          '<p class="a">Bạn gửi email tới support@spotless.vn kèm khu vực và kênh bán của mình. Đội ngũ sẽ phản hồi trong vòng 3 ngày làm việc.</p>',
      },
      {
        question: "Có chương trình cho creator?",
        answer:
          '<p class="a">Có. Bạn gửi thông tin kênh và nhóm khán giả của mình tới support@spotless.vn nhé.</p>',
      },
    ],
  },
];

function InfoIcon({ kind }: { kind: "search" | "shield" | "drop" | "box" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {kind === "search" ? (
        <>
          <circle cx="10.5" cy="10.5" r="7" />
          <path d="m16 16 5 5" />
        </>
      ) : kind === "shield" ? (
        <>
          <path d="m12 2 8 3v7c0 6-8 10-8 10S4 18 4 12V5Z" />
          <path d="m8 12 3 3 5-6" />
        </>
      ) : kind === "drop" ? (
        <path d="m12 3 6 6a8 8 0 1 1-12 0Z" />
      ) : (
        <>
          <path d="m3 7 9-5 9 5v10l-9 5-9-5Z" />
          <path d="m3 7 9 5 9-5M12 12v10M7 4.5l9 5" />
        </>
      )}
    </svg>
  );
}

function ContactCard() {
  return (
    <aside className="info-contact">
      <div>
        <strong>Cần hỗ trợ thêm?</strong>
        <p>Đội ngũ Spotless® sẵn sàng từ 8:00-21:00 mỗi ngày.</p>
      </div>
      <div className="info-contact-links">
        <a href="tel:0978551893">0978 551 893</a>
        <a href="mailto:support@spotless.vn">support@spotless.vn</a>
      </div>
    </aside>
  );
}

function AboutPage() {
  const about = site.pages.find((page) => page.path === "/pages/ve-spotless");
  return (
    <div className="info-about">
      <section className="info-about-hero">
        <div className="info-wrap">
          <span className="info-eyebrow">Spotless®</span>
          <h1>Chúng tôi không làm Spotless® để bán máy cạo.</h1>
        </div>
      </section>
      <section className="info-about-mission info-wrap">
        <p>
          Chúng tôi làm nó vì quá nhiều đàn ông đang sống dưới phong độ của
          mình, bị ghìm lại bởi sự vướng víu, e dè, và những công cụ không sinh
          ra cho việc này.
        </p>
        <p>
          Chúng tôi không chạy theo trend. Chúng tôi chế tạo sự chỉn chu, đến
          những nơi chẳng ai nhìn thấy.
        </p>
        <p>
          Chúng tôi làm ra thứ chưa từng tồn tại ở Việt Nam: hệ chăm sóc trọn
          vẹn cho vùng nhạy cảm của nam giới, từ máy cạo đến từng sản phẩm dưỡng
          đi kèm. Mỗi món được thiết kế để xứng đáng với niềm tin của bạn, mỗi
          sáng, mỗi lần dùng.
        </p>
        <p className="info-about-tag">Gọn gàng hơn. Tự tin hơn.</p>
      </section>
      {about?.image && (
        <div className="info-about-photo info-wrap">
          <div>
            <img src={about.image} alt="Spotless lifestyle" loading="lazy" />
          </div>
        </div>
      )}
      <section className="info-about-values">
        <div className="info-wrap">
          <div>
            <h2>Vững chãi</h2>
            <p>
              Sản phẩm đi trước lời hứa. Bảo hành 1 đổi 1, hoàn tiền 15 ngày -
              rủi ro thuộc về chúng tôi.
            </p>
          </div>
          <div>
            <h2>Tự do</h2>
            <p>
              Mặc gì cũng thoáng, vận động không vướng víu, không e dè trong bất
              kỳ khoảnh khắc nào.
            </p>
          </div>
          <div>
            <h2>Kín đáo</h2>
            <p>Hộp trơn, không in tên sản phẩm. Chuyện của bạn là của bạn.</p>
          </div>
        </div>
      </section>
      <div className="info-about-cta info-wrap">
        <Link className="info-button" href="/products/trimday-3-0-max">
          MUA TRIMDAY®
        </Link>
      </div>
    </div>
  );
}

function SupportPage() {
  const [query, setQuery] = useState("");
  const normalize = (value: string) =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .toLocaleLowerCase("vi");
  const search = normalize(query.trim());
  const groups = faqGroups.map((group) => ({
    ...group,
    items: group.items.filter((item) =>
      normalize(item.question + " " + item.answer).includes(search),
    ),
  }));
  const count = groups.reduce((total, group) => total + group.items.length, 0);
  return (
    <div className="info-support">
      <section className="info-support-hero">
        <div className="info-wrap">
          <span className="info-eyebrow">Trung tâm hỗ trợ</span>
          <h1>Bạn cần giúp gì?</h1>
          <div className="info-support-search" role="search">
            <InfoIcon kind="search" />
            <input
              type="search"
              aria-label="Tìm câu trả lời"
              placeholder="Tìm nhanh: pin, bảo hành, giao hàng…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="info-support-cards">
            <Link className="info-support-band" href="/pages/theo-doi-don-hang">
              <span className="info-support-icon">
                <InfoIcon kind="box" />
              </span>
              <span>
                <strong>Đơn hàng của bạn</strong>
                <p>Xem đơn đang đi tới đâu.</p>
              </span>
              <span className="info-small-button">Tra cứu đơn</span>
            </Link>
            <Link className="info-support-card" href="/pages/dang-ky-bao-hanh">
              <span className="info-support-icon">
                <InfoIcon kind="shield" />
              </span>
              <strong>Bảo hành 1 đổi 1</strong>
              <p>Kích hoạt một lần, hiệu lực 365 ngày.</p>
              <span>Kích hoạt bảo hành</span>
            </Link>
            <Link className="info-support-card" href="/blogs/huong-dan-su-dung">
              <span className="info-support-icon">
                <InfoIcon kind="drop" />
              </span>
              <strong>Dùng máy đúng cách</strong>
              <p>Cạo, thay lưỡi, vệ sinh máy.</p>
              <span>Xem hướng dẫn</span>
            </Link>
          </div>
        </div>
      </section>
      <div className="info-support-faq info-wrap">
        <nav className="info-faq-nav" aria-label="Nhóm câu hỏi">
          <strong>Nhóm câu hỏi</strong>
          <ul>
            {groups.map((group) => (
              <li key={group.id}>
                <a href={`#${group.id}`} aria-disabled={!group.items.length}>
                  <span>{group.title}</span>
                  <small>{group.items.length}</small>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="info-faq-body">
          {query.trim() && (
            <p className="info-search-results" role="status">
              {count
                ? `Tìm thấy ${count} câu trả lời cho “${query}”.`
                : `Không tìm thấy câu trả lời cho “${query}”. Hãy thử từ khóa khác hoặc liên hệ với Spotless®.`}
            </p>
          )}
          {groups
            .filter((group) => group.items.length > 0)
            .map((group) => (
              <section className="info-faq-group" id={group.id} key={group.id}>
                <span className="info-eyebrow">{group.eyebrow}</span>
                <h2>{group.title}</h2>
                {group.items.map((item) => (
                  <details className="info-faq-item" key={item.question}>
                    <summary>
                      {item.question}
                      <span aria-hidden="true">+</span>
                    </summary>
                    <div
                      className="info-faq-answer"
                      dangerouslySetInnerHTML={{ __html: item.answer }}
                    />
                  </details>
                ))}
              </section>
            ))}
          <ContactCard />
        </div>
      </div>
    </div>
  );
}

function TransactionPage({ path }: { path: string }) {
  const [submitted, setSubmitted] = useState(false);
  const isWarranty = /warranty|bao-hanh/.test(path);
  const isAccount = /tai-khoan|account/.test(path);
  const isCheckout = /thanhtoan/.test(path);
  const title = isWarranty
    ? "Kích hoạt bảo hành"
    : isAccount
      ? "Tài khoản của bạn"
      : isCheckout
        ? "Thanh toán"
        : "Theo dõi đơn hàng";
  // shortcut: transaction forms are local previews; connect an authorized commerce backend before accepting real requests.
  return (
    <section className="info-transaction info-wrap">
      <div className="info-transaction-intro">
        <span className="info-eyebrow">Spotless®</span>
        <h1>{title}</h1>
        <p>
          {isWarranty
            ? "Bảo hành 1 đổi 1 trong 365 ngày với lỗi từ nhà sản xuất."
            : isAccount
              ? "Đăng nhập để quản lý đơn hàng và thông tin bảo hành."
              : isCheckout
                ? "Kiểm tra sản phẩm trong giỏ hàng trước khi tiếp tục."
                : "Nhập thông tin đặt hàng để tra cứu hành trình giao hàng."}
        </p>
      </div>
      <div className="info-transaction-box">
        <p className="info-demo-note">
          Bản xem trước local · Chưa kết nối hệ thống{" "}
          {isAccount ? "tài khoản" : isWarranty ? "bảo hành" : "đơn hàng"}.
        </p>
        {isCheckout ? (
          <>
            <p>Thanh toán thực tế được thực hiện tại website Spotless.</p>
            <Link className="info-button" href="/cart">
              Xem giỏ hàng
            </Link>
          </>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitted(true);
            }}
          >
            {!isAccount && (
              <label>
                {isWarranty ? "Mã đơn hàng / số sê-ri" : "Mã đơn hàng"}
                <input
                  name="order"
                  autoComplete="off"
                  required
                  placeholder={
                    isWarranty ? "Nhập mã đơn hoặc số sê-ri" : "Ví dụ: #SP12345"
                  }
                />
              </label>
            )}
            <label>
              Số điện thoại
              <input
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                pattern="[+0-9 ()-]{8,20}"
                required
                placeholder="Số điện thoại đặt hàng"
              />
            </label>
            <button className="info-button" type="submit">
              {isAccount
                ? "Tiếp tục"
                : isWarranty
                  ? "Kiểm tra bảo hành"
                  : "Tra cứu đơn hàng"}
            </button>
            {submitted && (
              <p className="info-form-result" role="status">
                Thông tin chưa được gửi. Vui lòng mở website Spotless để{" "}
                {isAccount
                  ? "đăng nhập"
                  : isWarranty
                    ? "kích hoạt bảo hành"
                    : "tra cứu đơn hàng thực tế"}
                .
              </p>
            )}
          </form>
        )}
        <a className="info-original-link" href={`https://spotless.vn${path}`}>
          Mở {title.toLocaleLowerCase("vi")} trên spotless.vn
        </a>
      </div>
      <ContactCard />
    </section>
  );
}

function PolicyPage({ path }: { path: string }) {
  const page = site.pages.find((item) => item.path === path);
  const headings: { id: string; title: string }[] = [];
  const html = (page?.html ?? "").replace(
    /<h([23])\b[^>]*>([\s\S]*?)<\/h\1>/gi,
    (_match: string, level: string, content: string) => {
      const id = `section-${headings.length + 1}`;
      headings.push({
        id,
        title: content.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&"),
      });
      return `<h${level} id="${id}">${content}</h${level}>`;
    },
  );
  return (
    <div className="info-policy">
      <section className="info-policy-hero">
        <div className="info-wrap">
          <h1>{page?.title ?? "Thông tin Spotless"}</h1>
        </div>
      </section>
      <div
        className={`info-policy-main info-wrap${headings.length ? "" : " info-policy-no-toc"}`}
      >
        {headings.length > 0 && (
          <nav className="info-policy-toc" aria-label="Trên trang này">
            <strong>Trên trang này</strong>
            <ul>
              {headings.map((heading) => (
                <li key={heading.id}>
                  <a href={`#${heading.id}`}>{heading.title}</a>
                </li>
              ))}
            </ul>
          </nav>
        )}
        <article>
          <div
            className="info-policy-content"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <ContactCard />
        </article>
      </div>
    </div>
  );
}

export function InformationPage({ path }: { path: string }) {
  if (path === "/pages/ve-spotless") return <AboutPage />;
  if (path === "/pages/ho-tro" || path === "/pages/avada-faqs")
    return <SupportPage />;
  if (
    /^\/pages\/(warranty|dang-ky-bao-hanh|order-status|theo-doi-don-hang|tai-khoan|thanhtoan)$/.test(
      path,
    ) ||
    path === "/account/login"
  )
    return <TransactionPage key={path} path={path} />;
  return <PolicyPage path={path} />;
}
