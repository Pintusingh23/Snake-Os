import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata = {
  title: "Snake-OS — Bare-Metal Terminal Snake Game in C",
  description:
    "A fully playable Snake game written in pure C with zero standard library dependencies. Custom memory allocator, loop-based arithmetic, and raw ANSI terminal rendering.",
  keywords: [
    "Snake",
    "Operating Systems",
    "C Programming",
    "Bare Metal",
    "Custom Memory Allocator",
    "Terminal Game",
  ],
  authors: [
    { name: "Pintu Singh" },
    { name: "Pranay Sarkar" },
    { name: "Shah Fathal" },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrains.variable}`}>
      <body>
        {children}
        <ScrollObserver />
      </body>
    </html>
  );
}

function ScrollObserver() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            var observer = new IntersectionObserver(function(entries) {
              entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                  entry.target.classList.add('visible');
                }
              });
            }, { threshold: 0.1 });
            
            function observe() {
              document.querySelectorAll('.fade-in').forEach(function(el) {
                observer.observe(el);
              });
            }
            
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', observe);
            } else {
              observe();
            }
            
            // Re-observe on route changes (for Next.js)
            var mo = new MutationObserver(function() {
              document.querySelectorAll('.fade-in:not(.visible)').forEach(function(el) {
                observer.observe(el);
              });
            });
            mo.observe(document.body, { childList: true, subtree: true });
          })();
        `,
      }}
    />
  );
}
