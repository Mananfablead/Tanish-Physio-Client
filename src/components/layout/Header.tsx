import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Menu, 
  Activity, 
  Users,
  ArrowRight,
  LayoutDashboard,
  Settings,
  Mail,
  Calendar
} from "lucide-react";
import { useState } from "react";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";




const navLinks = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/plans", label: "Plans" },
  // { to: "/schedule", label: "Schedule" },
];

export function Header() {
  
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);



  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-5">
          <img 
            src="https://tanishphysio.fableadtech.com/public/uploads/clinic_logos/1758630536_logo%20(1).png" 
            alt="Tanish Physio Logo" 
            className="h-10 w-auto object-contain"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to}>
              <Button
                variant={location.pathname === link.to ? "secondary" : "ghost"}
                size="sm"
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="hidden md:flex"
                onClick={() => navigate('/login')}
              >
                Sign In
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Access your professional or patient portal</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Link to="/questionnaire" className="hidden md:block">
                <Button variant="hero" size="sm">
                  Get Started
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Start your clinical assessment today</p>
            </TooltipContent>
          </Tooltip>

          {/* Mobile Navigation */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px]">
              <div className="flex flex-col gap-4 mt-8">

                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                  >
                    <Button
                      variant={location.pathname === link.to ? "secondary" : "ghost"}
                      className="w-full justify-start"
                    >
                      {link.label}
                    </Button>
                  </Link>
                ))}
                <div className="border-t border-border pt-4 mt-2">
                  <Button 
                    variant="outline" 
                    className="w-full mb-3"
                    onClick={() => {
                      setOpen(false);
                      navigate('/login');
                    }}
                  >
                    Sign In
                  </Button>
                  <Link to="/questionnaire" onClick={() => setOpen(false)}>
                    <Button variant="hero" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
