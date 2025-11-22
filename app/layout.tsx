/**
 * Root Layout
 * Next.js 16 root layout with metadata and fonts
 */

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: {
		template: "%s | Next.js Quick Starter",
		default: "Next.js Quick Starter",
	},
	description:
		"Modern Next.js starter with React 19, Drizzle ORM, TanStack libraries, Vercel AI SDK, and best practices built-in",
	keywords: [
		"Next.js 16",
		"React 19",
		"TypeScript",
		"Drizzle ORM",
		"Zod",
		"TanStack",
		"Tailwind CSS",
		"shadcn/ui",
	],
	authors: [{ name: "Your Name" }],
	creator: "Your Name",
	openGraph: {
		type: "website",
		locale: "en_US",
		url: "http://localhost:3000",
		title: "Next.js Quick Starter",
		description:
			"Modern Next.js starter with React 19, Drizzle ORM, TanStack libraries, and best practices",
		siteName: "Next.js Quick Starter",
	},
	twitter: {
		card: "summary_large_image",
		title: "Next.js Quick Starter",
		description:
			"Modern Next.js starter with React 19, Drizzle ORM, TanStack libraries, and best practices",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${geistSans.variable} antialiased`}>
				<NuqsAdapter>{children}</NuqsAdapter>
				<Toaster position="bottom-right" richColors />
			</body>
		</html>
	);
}
