
import { SidebarProvider } from "@/context/SidebarContext"; // Ajusta el path si es necesario
import { DialogProvider } from "@/context/DialogContext";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-primary`}
      >
       <SidebarProvider>
        <DialogProvider>
          {children}
        </DialogProvider>
       </SidebarProvider>
        
      </body>
    </html>
  );
}
