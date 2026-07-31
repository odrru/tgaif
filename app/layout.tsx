import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host") ??
    "localhost:3000";
  const protocol =
    requestHeaders.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const metadataBase = new URL(`${protocol}://${host}`);

  return {
    metadataBase,
    title: "TG(AI)F — The TGIF party task list",
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
}

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
