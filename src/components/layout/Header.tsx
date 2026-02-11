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
      <div className="container flex  h-28 items-center justify-between">
        <Link to="/" className="flex items-center gap-5">
          <img
            src="https://tanishphysio.fableadtech.com/public/uploads/clinic_logos/1758630536_logo%20(1).png"
            alt="Tanish Physio Logo"
            className="h-24 w-auto object-contain"
          />
        </Link>


        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to}>
              <Button
                variant={location.pathname === link.to ? "secondary" : "ghost"}
                size="lg"
              >
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Show profile dropdown when authenticated */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="lg"
                  className="relative h-16 w-16 md:w-auto md:px-4 rounded-full
                  flex items-center gap-3
                  hover:bg-transparent
                  focus:bg-transparent
                  active:bg-transparent
  "
                >
                  {user?.profilePicture ? (
                    <img
                      src={`data:image/jpeg;base64,${user.profilePicture}`}
                      alt={user?.name || "User profile"}
                      className="h-14 w-14 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white">
                      <User className="h-8 w-8" />
                    </div>
                  )}

                  {/* Name / Email (desktop only) */}
                  <div className="flex flex-col items-start gap-1">
                    <span className="hidden md:inline text-sm font-medium truncate max-w-[120px]">
                      {user?.name || user?.email?.split("@")[0]}
                    </span>

                    <span className="hidden md:inline text-xs text-slate-500 truncate max-w-[120px]">
                      {user?.email}
                    </span>
                  </div>

                </Button>

              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="p-2 border-b border-gray-100">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate max-w-[150px]">{user?.email}</p>
                </div>
                <DropdownMenuItem className="p-2" onClick={() => navigate('/profile')}>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Profile</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="p-2 cursor-pointer"
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
                    size="lg"
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
                  <Link to="/register" className="hidden md:block">
                    <Button variant="hero" size="lg">
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
                  {isAuthenticated ? (
                    <>
                      <div className="mb-3">
                        <Button
                          variant="outline"
                          className="w-full mb-2"
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
                          className="w-full"
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