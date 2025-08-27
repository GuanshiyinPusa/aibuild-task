import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import CustomThemeProvider from '@/components/ThemeProvider';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Analytics Dashboard",
    description: "Product analytics dashboard with data visualization",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <CustomThemeProvider>
                    {children}
                </CustomThemeProvider>
            </body>
        </html>
    );
}
