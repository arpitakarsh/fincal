import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata = {
  title: "FinCal — Goal-Based Investment Calculator",
  description: "Plan your financial goals with smart SIP calculations",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={montserrat.variable} style={{ fontFamily: 'Arial, sans-serif', margin: 0, padding: 0, background: '#f8f9fb' }}>
        {children}
      </body>
    </html>
  );
}