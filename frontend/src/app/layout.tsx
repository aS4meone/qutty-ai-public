import {Metadata} from "next";
import {Manrope} from "next/font/google";
import "./globals.css";
import React from "react";
import Header from "@/components/Header";

const inter = Manrope({subsets: ["latin"]});

export const metadata: Metadata = {
    title: "Qutty.net",
    description: "New level of a dementia testing. Our online dementia assessment helps you identify potential cognitive issues faster and earlier. Get started with a simple test today.",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <body className={inter.className}>
        <div className="bg-[hsl(210_100%_97%)]">{children}</div>
        </body>
        </html>
    );
}
