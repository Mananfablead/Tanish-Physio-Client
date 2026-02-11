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
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/testimonials", label: "Testimonials" }
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
      <div className="container flex h-20 md:h-28 items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-3 md:gap-5 flex-shrink-0">
          <img
            src="https://tanishphysio.fableadtech.com/public/uploads/clinic_logos/1758630536_logo%20(1).png"
            alt="Tanish Physio Logo"
            className="h-16 md:h-24 w-auto object-contain"
          />
        </Link>


        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-3">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to}>
              <Button
                variant={location.pathname === link.to ? "secondary" : "ghost"}
                size="sm"
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
                  size="sm"
                  className="relative h-12 w-12 md:h-14 md:w-auto md:px-3 rounded-full
                  flex items-center gap-2 md:gap-3
                  hover:bg-accent hover:text-accent-foreground
                  focus:ring-2 focus:ring-ring focus:ring-offset-2
                  transition-all duration-200
                  border border-transparent hover:border-border"
                >
                  {user?.profilePicture ? (
                    <img
                      src={`data:image/jpeg;base64,${user.profilePicture}`}
                      alt={user?.name || "User profile"}
                      className="h-10 w-10 md:h-12 md:w-12 rounded-full object-cover border-2 border-border shadow-sm"
                    />
                  ) : (
                    <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                      <User className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                  )}

                  {/* Name / Email (desktop only) */}
                  <div className="hidden md:flex flex-col items-start gap-0.5 min-w-0">
                    <span className="text-sm font-semibold truncate max-w-[140px] text-foreground">
                      {user?.name || user?.email?.split("@")[0]}
                    </span>
                    <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                      {user?.email}
                    </span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-64 md:w-72 mt-2 shadow-lg rounded-lg border border-border bg-popover text-popover-foreground" 
                align="end" 
                sideOffset={5}
                forceMount
              >
                <div className="px-4 py-3 border-b border-border bg-muted/50">
                  <div className="flex items-center gap-3 mb-2">
                    {user?.profilePicture ? (
                      <img
                        src={`data:image/jpeg;base64,${user.profilePicture}`}
                        alt={user?.name || "User profile"}
                        className="h-12 w-12 rounded-full object-cover border-2 border-border"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <User className="h-6 w-6" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{user?.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>
                </div>
                <DropdownMenuItem 
                  className="px-4 py-3 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors"
                  onClick={() => navigate('/profile')}
                >
                  <div className="flex items-center gap-3 w-full">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Profile Settings</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="px-4 py-3 cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors text-destructive hover:text-destructive focus:text-destructive"
                  onClick={handleLogout}
                >
                  <div className="flex items-center gap-3 w-full">
                    <LogOut className="h-4 w-4" />
                    <span className="font-medium">Sign Out</span>
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
                    size="sm"
                    className="hidden md:flex px-4 py-2 text-sm font-medium"
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
                    <Button variant="default" size="sm" className="px-4 py-2 text-sm font-medium">
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
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-15 w-10 rounded-lg"
              >
                <Menu className="h-12 w-12" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="right" 
              className="w-[300px] sm:w-[320px] p-0 flex flex-col"
            >
              <div className="flex flex-col h-full">
                {/* Mobile Header with User Info */}
                {isAuthenticated && (
                  <div className="border-b border-border p-4 bg-gradient-to-r from-primary/5 to-primary/10">
                    <div className="flex items-center gap-3 mb-3">
                      {user?.profilePicture ? (
                        <img
                          src={`data:image/jpeg;base64,${user.profilePicture}`}
                          alt={user?.name || "User profile"}
                          className="h-12 w-12 rounded-full object-fit border-2 border-primary/20"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                          <User className="h-6 w-6" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-semibold truncate">{user?.name || user?.email?.split("@")[0]}</p>
                        <p className="text-sm text-muted-foreground truncate">{user?.email}</p>
                        <p className="text-xs font-medium text-primary mt-0.5">{user?.role || 'Patient'}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setOpen(false);
                        navigate('/profile');
                      }}
                    >
                      <div className="p-1 rounded bg-primary/10 mr-2">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      View Profile
                    </Button>
                  </div>
                )}
                
                <div className="flex-1 overflow-y-auto py-4 px-2 mt-5">
                  <div className="space-y-1">
                    {navLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setOpen(false)}
                        className="block"
                      >
                        <Button
                          variant={location.pathname === link.to ? "secondary" : "ghost"}
                          className="w-full justify-start h-12 px-4 text-left"
                        >
                          {link.label}
                        </Button>
                      </Link>
                    ))}
                  </div>
                </div>
                
                <div className="border-t border-border p-4 bg-background">
                  {isAuthenticated ? (
                    <Button
                      variant="outline"
                      className="w-full h-12 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                      onClick={() => {
                        setOpen(false);
                        handleLogout();
                      }}
                    >
                      <div className="p-1 rounded bg-destructive/10 mr-2">
                        <LogOut className="h-4 w-4 text-destructive" />
                      </div>
                      Sign Out
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full h-12"
                        onClick={() => {
                          setOpen(false);
                          navigate('/login');
                        }}
                      >
                        Sign In
                      </Button>
                      <Link to="/questionnaire" onClick={() => setOpen(false)} className="block">
                        <Button 
                          variant="default" 
                          className="w-full h-12"
                        >
                          Get Started
                        </Button>
                      </Link>
                    </div>
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