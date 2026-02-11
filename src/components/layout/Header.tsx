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
  Calendar,
  User,
  LogOut
} from "lucide-react";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@/store/slices/authSlice';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

  // Get user from Redux store
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = !!user;

  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Navigate to home or login
    navigate('/');
    // Refresh the page to clear any remaining state
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 md:h-24 items-center justify-between">
        <Link to="/" className="flex items-center gap-5">
          <img
            src="https://tanishphysio.fableadtech.com/public/uploads/clinic_logos/1758630536_logo%20(1).png"
            alt="Tanish Physio Logo"
            className="h-16 md:h-20 w-auto object-contain"
          />
        </Link>


        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to}>
              <Button
                variant={location.pathname === link.to ? "secondary" : "ghost"}
                className="px-4 py-2 text-base font-medium"
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Show profile dropdown when authenticated */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-12 w-12 md:h-16 md:w-auto md:px-3 rounded-full
                  flex items-center gap-2 md:gap-3
                  hover:bg-transparent
                  focus:bg-transparent
                  active:bg-transparent
                  transition-all duration-200"
                >
                  {user?.profilePicture ? (
                    <img
                      src={user?.profilePicture}
                      alt={user?.name || "User profile"}
                      className="h-10 w-10 md:h-14 md:w-14 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="flex h-10 w-10 md:h-14 md:w-14 items-center justify-center rounded-full bg-primary text-white">
                      <User className="h-5 w-5 md:h-7 md:w-7" />
                    </div>
                  )}

                  {/* Name / Email (desktop only) */}
                  <div className="hidden md:flex flex-col items-start gap-0.5">
                    <span className="text-base font-medium truncate max-w-[100px] md:max-w-[120px]">
                      {user?.name || user?.email?.split("@")[0]}
                    </span>
                    <span className="text-xs text-slate-500 truncate max-w-[100px] md:max-w-[120px]">
                      {user?.email}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 md:w-64" align="end" forceMount>
                <div className="p-3 border-b border-gray-100">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[180px]">{user?.email}</p>
                </div>
                <DropdownMenuItem className="p-3" onClick={() => navigate('/profile')}>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="p-3 cursor-pointer"
                  onClick={handleLogout}
                >
                  <div className="flex items-center gap-2">
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="hidden md:flex px-4 py-2 text-sm"
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
                  <Link to="/register" className="hidden md:block">
                    <Button variant="hero" className="px-4 py-2 text-sm">
                      Get Started
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Start your clinical assessment today</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}

          {/* Mobile Navigation */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="h-10 w-10">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <div className="flex flex-col gap-2 ">
                {/* Mobile Logo */}
                <div className="flex items-center justify-center mb-6">
                  <img
                    src="https://tanishphysio.fableadtech.com/public/uploads/clinic_logos/1758630536_logo%20(1).png"
                    alt="Tanish Physio Logo"
                    className="h-16 w-auto object-contain"
                  />
                </div>

                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                  >
                    <Button
                      variant={location.pathname === link.to ? "secondary" : "ghost"}
                      className="w-full justify-start py-3 text-base"
                    >
                      {link.label}
                    </Button>
                  </Link>
                ))}

                <div className="border-t border-border pt-4 mt-4">
                  {isAuthenticated ? (
                    <>
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full py-3"
                          onClick={() => {
                            setOpen(false);
                            navigate('/profile');
                          }}
                        >
                          <User className="h-4 w-4 mr-2" />
                          Profile
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full py-3"
                          onClick={() => {
                            setOpen(false);
                            handleLogout();
                          }}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Log Out
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        className="w-full py-3 mb-3"
                        onClick={() => {
                          setOpen(false);
                          navigate('/login');
                        }}
                      >
                        Sign In
                      </Button>
                      <Link to="/questionnaire" onClick={() => setOpen(false)}>
                        <Button variant="hero" className="w-full py-3">
                          Get Started
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}