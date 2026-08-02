import type { Metadata } from "next";
import "./globals.css";

function getMetadataBase() {
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000");
    return url.protocol === "http:" || url.protocol === "https:"
      ? url
      : new URL("http://localhost:3000");
  } catch {
    return new URL("http://localhost:3000");
  }
}

export const metadata: Metadata = {
  metadataBase: getMetadataBase(),
  title: "TG(AI)F | The TGIF party task list",
  description:
    "Tick tasks at the TGIF party. Grow bamboo clumps on your plot.",
  openGraph: {
    type: "website",
    title: "TG(AI)F",
    description: "Tick tasks at the TGIF party. Grow bamboo clumps on your plot.",
    images: [
      {
        url: "/og.png",
        width: 1660,
        height: 954,
        alt: "TG(AI)F — The TGIF party task list",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TG(AI)F",
    description: "Tick tasks at the TGIF party. Grow bamboo clumps on your plot.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
