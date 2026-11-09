import type { Metadata } from "next";
import "./globals.css";
import { SmoothScrollProvider } from "@/components/motion/SmoothScrollProvider";

export const metadata: Metadata = {
  title: "YwD — Own Less. Experience More. | Premium Rental & Recommerce Marketplace",
  description:
    "YwD makes high-performance electronics, academic tools, cameras, and lifestyle equipment accessible on flexible terms—from hourly rentals to entire semesters, with protected deposit security.",
  keywords: [
    "YwD",
    "Own Less Experience More",
    "rental marketplace",
    "recommerce",
    "equipment rental",
    "macbook rental",
    "camera rental",
    "refundable deposit",
    "deposit protection",
  ],
  icons: {
    icon: "/images/ywd-logo.png",
    apple: "/images/ywd-logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#F5F0E8] text-[#18352D] antialiased selection:bg-[#18352D] selection:text-[#F5F0E8]">
        <SmoothScrollProvider>{children}</SmoothScrollProvider>
      </body>
    </html>
  );
}
