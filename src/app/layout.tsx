import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";

export const metadata: Metadata = {
  title: "Mini Shop - Tinh Hoa Thủ Công Việt & Nội Thất Decor",
  description: "Cửa hàng đồ thủ công mỹ nghệ, gốm sứ Bát Tràng, mây tre đan & nội thất decor phong cách Bắc Âu kết hợp hồn Việt mộc mạc.",
  keywords: ["thủ công mỹ nghệ", "gốm sứ Bát Tràng", "mây tre đan", "decor phòng khách", "mini shop"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <main style={{ flex: 1 }}>
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
