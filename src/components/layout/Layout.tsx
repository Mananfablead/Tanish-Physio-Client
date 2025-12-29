import { Header } from "./Header";
import { Footer } from "./Footer";
import { TooltipProvider } from "@/components/ui/tooltip";

interface LayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export function Layout({ children, showFooter = true }: LayoutProps) {
  return (
    <TooltipProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        {showFooter && <Footer />}
      </div>
    </TooltipProvider>
  );
}
