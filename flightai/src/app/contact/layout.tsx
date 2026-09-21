import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the AERVYN team for support, enterprise inquiries, or technical assistance regarding our flight tracking platform.",
  openGraph: { title: "Contact Us", description: "Get in touch with the AERVYN team for support, enterprise inquiries, or technical assistance regarding our flight tracking platform.", url: "https://aervyn.in/contact" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
