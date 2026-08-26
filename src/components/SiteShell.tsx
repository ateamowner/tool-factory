import { AdSlot } from "@/components/AdSlot";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <div className="flex-1">{children}</div>
      <AdSlot />
      <Footer />
    </div>
  );
}
