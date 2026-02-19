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
  LogOut,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDispatch, useSelector } from "react-redux";
import { selectCurrentUser } from "@/store/slices/authSlice";
import {

  fetchProfile,
} from "@/store/slices/authSlice";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/plans", label: "Plans" },
  // { to: "/schedule", label: "Schedule" },
  { to: "/about", label: "About Us" },
  { to: "/contact", label: "Contact Us" },
  { to: "/testimonials", label: "Testimonials" },
];

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  // Get user from Redux store
  const user = useSelector(selectCurrentUser);
  const isAuthenticated = !!user;

  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Navigate to home or login
    navigate("/");
    // Refresh the page to clear any remaining state
    window.location.reload();
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      dispatch(fetchProfile());
    }
  }, [dispatch]);

  return (
    <header className="sticky top-0 left-0 right-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-md shadow-sm">
      <div className="container flex items-center justify-between px-4 py-3 sm:py-3 md:py-3 lg:py-3">
        <Link
          to="/"
          className="flex flex-col items-center gap-1 md:gap-1 flex-shrink-0"
        >
          <img
            src="https://tanishphysio.fableadtech.com/public/uploads/clinic_logos/1758630536_logo%20(1).png"
            alt="Tanish Physio Logo"
            className="h-12 sm:h-14 md:h-16 lg:h-16 w-auto object-contain"
          />
          <span className="text-[8px] md:text-[10px] font-semibold tracking-wider text-emerald-700">
            Practising Since 2004
          </span>



        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:hidden lg:flex items-center gap-2 lg:gap-3">
          {navLinks.map((link) => (
            <Link key={link.to} to={link.to}>
              <Button
                variant={location.pathname === link.to ? "secondary" : "ghost"}
                size="sm"
                className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base font-medium">
                {link.label}
              </Button>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">

          {/* Show profile dropdown when authenticated */}
          <div className="hidden md:flex">
            {isAuthenticated ? (
              <DropdownMenu>
             <DropdownMenuTrigger asChild>
  <div
    className="flex items-center gap-3 cursor-pointer
    hover:ring-2 hover:ring-primary/40 
    transition-all duration-200 px-2 py-1 rounded-lg"
  >
    {user?.profilePicture ? (
      <img
        src={user?.profilePicture}
        alt={user?.name || "User profile"}
        className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover border-2 border-border shadow-sm"
      />
    ) : (
      <div className="h-10 w-10 sm:h-12 sm:w-12 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
        <User className="h-5 w-5 sm:h-6 sm:w-6" />
      </div>
    )}

    {/* Name & Email */}
    <div className="hidden md:block">
      <p className="text-sm font-semibold truncate">
        {user?.name || user?.email?.split("@")[0]}
      </p>
      <p className="text-xs text-muted-foreground truncate">
        {user?.email}
      </p>
    </div>
  </div>
</DropdownMenuTrigger>

                <DropdownMenuContent
                  className="w-56 sm:w-64 md:w-72 mt-2 shadow-lg rounded-lg border border-border bg-popover text-popover-foreground"
                  align="end"
                  sideOffset={5}
                  forceMount
                >
                  <div className="px-4 py-3 bg-muted/50">
                    <div className="flex items-center gap-3 mb-2">
                      {user?.profilePicture ? (
                        <img
                          src={user.profilePicture}
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
                    className="px-4 py-3 cursor-pointer
  hover:bg-primary/10 hover:text-primary
  focus:bg-primary/10 focus:text-primary
  data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary
  transition-colors"
                    onClick={() => navigate('/profile')}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <User className="h-4 w-4" />
                      <span className="font-medium">Profile Settings</span>
                    </div>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    className="px-4 py-3 cursor-pointer
  hover:bg-primary/10 hover:text-destructive
  focus:bg-primary/10 focus:text-destructive
  data-[highlighted]:bg-primary/10 data-[highlighted]:text-destructive
  transition-colors"
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
                      className="hidden md:flex px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-medium"
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
                      <Button variant="default" size="sm" className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-medium">
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
          </div>

          {/* Mobile Navigation */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button

                size="icon"
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg md:flex lg:hidden [&_svg]:size-8"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-[280px] sm:w-[300px] md:w-[320px] p-0 flex flex-col"
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
                        <p className="text-base font-semibold truncate">
                          {user?.name || user?.email?.split("@")[0]}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {user?.email}
                        </p>
                        {/* <p className="text-xs font-medium text-primary mt-0.5">
                          {user?.role || "Patient"}
                        </p> */}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() => {
                        setOpen(false);
                        navigate("/profile");
                      }}
                    >
                      {/* <div className="p-1 rounded bg-primary/10 mr-2">
                        <User className="h-4 w-4 text-primary" />
                      </div> */}
                      View Profile
                    </Button>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto py-4 px-1 mt-5">
                  <div className="space-y-1">
                    {navLinks.map((link) => (
                      <Link
                        key={link.to}
                        to={link.to}
                        onClick={() => setOpen(false)}
                        className="block"
                      >
                        <Button
                          variant={
                            location.pathname === link.to
                              ? "secondary"
                              : "ghost"
                          }
                          className="w-full justify-start h-10 sm:h-12 px-2 text-left"
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
                          navigate("/login");
                        }}
                      >
                        Sign In
                      </Button>
                      <Link
                        to="/questionnaire"
                        onClick={() => setOpen(false)}
                        className="block"
                      >
                        <Button variant="default" className="w-full h-12">
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
