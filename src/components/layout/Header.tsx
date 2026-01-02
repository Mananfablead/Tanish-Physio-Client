import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Menu, 
  Activity, 
  User, 
  Users, 
  ArrowRight,
  LogOut,
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
import { useAuth } from "../../context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"; 

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/therapists", label: "Find Therapists" },
  { to: "/plans", label: "Plans" },
  // { to: "/schedule", label: "Schedule" },
];

export function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [signoutOpen, setSignoutOpen] = useState(false); 

  const handleLogout = () => {
    // open confirmation dialog instead of immediate logout
    setSignoutOpen(true);
  };

  const confirmLogout = () => {
    // perform logout and navigate home
    setSignoutOpen(false);
    logout();
    navigate('/');
  }; 

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
          {!isAuthenticated ? (
            <>
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
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-auto flex items-center gap-3 pl-2 pr-4 rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-all">
                  <Avatar className="h-8 w-8 border-2 border-green-500">
                    <AvatarImage src={user?.image} alt={user?.name} />
                    <AvatarFallback className="bg-green-100 text-green-700 font-bold">
                      {user?.name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start leading-none">
                    <span className="text-sm font-bold text-slate-900">{user?.name}</span>
                    <span className="text-[10px] text-slate-500 truncate max-w-[120px]">{user?.email}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 p-2 rounded-2xl" align="end" sideOffset={8}>
                <DropdownMenuLabel className="px-3 py-3">
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-bold text-slate-900">My Account</p>
                    <p className="text-xs text-slate-500 truncate font-medium">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1 bg-slate-100" />
              
                {/* <DropdownMenuItem className="py-3 px-3 rounded-xl cursor-pointer focus:bg-green-50 group transition-colors" asChild>
                  <Link to="/schedule" className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center group-focus:bg-green-100 group-focus:text-green-600 transition-colors">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 group-focus:text-green-700">My Schedule</span>
                  </Link>
                </DropdownMenuItem> */}
                <DropdownMenuItem className="py-3 px-3 rounded-xl cursor-pointer focus:bg-green-50 group transition-colors" asChild>
                  <Link to="/profile" className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center group-focus:bg-green-100 group-focus:text-green-600 transition-colors">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 group-focus:text-green-700">Account Profile</span>
                  </Link>
                </DropdownMenuItem>
                {/* <DropdownMenuItem className="py-3 px-3 rounded-xl cursor-pointer focus:bg-green-50 group transition-colors" asChild>
                  <Link to="/settings" className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-slate-100 flex items-center justify-center group-focus:bg-green-100 group-focus:text-green-600 transition-colors">
                      <Settings className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 group-focus:text-green-700">Platform Settings</span>
                  </Link>
                </DropdownMenuItem> */}
                <DropdownMenuSeparator className="my-1 bg-slate-100" />
                <DropdownMenuItem 
                  className="py-3 px-3 rounded-xl cursor-pointer focus:bg-red-50 group transition-colors"
                  onClick={handleLogout}
                >
                  <div className="flex items-center gap-3 w-full text-red-600">
                    <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center group-focus:bg-red-100 group-focus:text-red-700 transition-colors">
                      <LogOut className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-bold">Sign Out</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <Avatar className="h-10 w-10 border-2 border-green-500">
                          <AvatarImage src={user?.image} alt={user?.name} />
                          <AvatarFallback className="bg-green-100 text-green-700 font-bold">
                            {user?.name?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">{user?.name}</span>
                          <span className="text-[10px] text-slate-500 truncate max-w-[150px]">{user?.email}</span>
                        </div>
                      </div>
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
                  {!isAuthenticated ? (
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
                  ) : (
                    <div className="space-y-4">
                      
                      <div className="grid grid-cols-1 gap-2">
                        {/* <Link to="/schedule" onClick={() => setOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start gap-3 py-6 rounded-xl">
                            <Calendar className="h-5 w-5 text-slate-500" />
                            My Schedule
                          </Button>
                        </Link> */}
                        <Link to="/profile" onClick={() => setOpen(false)}>
                          <Button variant="ghost" className="w-full justify-start gap-3 py-6 rounded-xl">
                            <User className="h-5 w-5 text-slate-500" />
                            My Profile
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start gap-3 py-6 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => { setOpen(false); handleLogout(); }}
                        >
                          <LogOut className="h-5 w-5" />
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Sign out confirmation dialog */}
        <Dialog open={signoutOpen} onOpenChange={setSignoutOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Sign Out</DialogTitle>
              <DialogDescription>Are you sure you want to sign out? You will need to sign in again to access your account.</DialogDescription>
            </DialogHeader>
            <div className="pt-2">
              <DialogFooter>
                <Button variant="outline" onClick={() => setSignoutOpen(false)}>Cancel</Button>
                <Button variant="destructive" className="ml-2" onClick={confirmLogout}>Sign Out</Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </header>
  );
}
