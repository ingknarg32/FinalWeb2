import Navbar from "@/components/Navbar";
import Toasts from "@/components/Toasts";
import { AppProvider } from "@/lib/store";
import "./globals.css";

export const metadata = {
  title: "TrazaUni · Trazabilidad de solicitudes",
  description:
    "Radica solicitudes y sigue su estado (Nueva, En proceso, Resuelta) en tiempo real, con el historial de observaciones de los responsables.",
};

export const viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <AppProvider>
          <a href="#contenido" className="skip">Saltar al contenido</a>
          <Navbar />
          <main id="contenido">{children}</main>
          <footer className="footer">
            <div className="container">
              <p>TrazaUni · Prototipo inicial · Ingeniería Web</p>
            </div>
          </footer>
          <Toasts />
        </AppProvider>
      </body>
    </html>
  );
}
