
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ModeToggle } from '@/components/ui/ModeToggle';
import { Button } from '@/components/ui/button';
import { Search, Menu, X, Bookmark, User, LogOut, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSavedProfiles } from '@/context/SavedProfilesContext';
import { toast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { savedProfiles } = useSavedProfiles();
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Find Talent', path: '/freelancers' },
    { name: 'Browse Jobs', path: '/projects' },
    { name: 'Contests', path: '/contests' },
    { name: 'How It Works', path: '/how-it-works' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast({
        title: "Search initiated",
        description: `Searching for "${searchQuery}"`,
      });
      // Navigate to search results page (to be implemented)
      // navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate('/');
  };

  const isLoggedIn = localStorage.getItem('user') !=null;
  console.log(isLoggedIn);
  const user = JSON.parse(localStorage.getItem('user'));
  if(user)
    user.isLoggedIn = isLoggedIn || false;

  return (
    <header 
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300",
        isScrolled ? "py-2 glass-dark shadow-sm" : "py-4 bg-transparent"
      )}
    >
      <div className="container px-4 mx-auto flex items-center justify-between">
        <Link to="/" className="text-foreground font-semibold text-xl tracking-tight">
          Empleadora<span className="text-primary">.</span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          <nav className="flex space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-sm font-medium transition-colors relative",
                  location.pathname === link.path 
                    ? "text-primary after:content-[''] after:absolute after:w-full after:h-0.5 after:bg-primary after:-bottom-1 after:left-0" 
                    : "text-muted-foreground hover:text-foreground hover:after:content-[''] hover:after:absolute hover:after:w-full hover:after:h-0.5 hover:after:bg-primary/30 hover:after:scale-x-100 hover:after:-bottom-1 hover:after:left-0 hover:after:transition-transform hover:after:duration-300 hover:after:ease-in-out"
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>
          
          <ModeToggle />

          {/* Search button and form */}
          <div className="relative">
            {isSearchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center">
                <input
                  type="text"
                  placeholder="Search..."
                  className="border rounded-l-md px-3 py-1 w-48 focus:outline-none focus:ring-1 focus:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
                <Button 
                  type="submit" 
                  variant="default" 
                  size="sm" 
                  className="rounded-l-none rounded-r-md"
                >
                  <Search size={16} />
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsSearchOpen(false)}
                  className="ml-1"
                >
                  <X size={16} />
                </Button>
              </form>
            ) : (
              <Button variant="outline" size="icon" className="rounded-full" onClick={() => setIsSearchOpen(true)}>
                <Search size={18} />
              </Button>
            )}
          </div>
          
          <Link to="/saved-profiles">
            <Button variant="outline" size="icon" className="rounded-full relative">
              <Bookmark size={18} />
              {savedProfiles.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] rounded-full flex items-center justify-center">
                  {savedProfiles.length}
                </span>
              )}
            </Button>
          </Link>
          
          {user?.isLoggedIn ? (
            <>
              <Link to="/dashboard">
                <Button variant="outline" className="rounded-full gap-2">
                  Dashboard
                </Button>
              </Link>
              
              {user.type === 'client' && (
                <Link to="/post-project">
                  <Button variant="outline" className="rounded-full gap-2">
                    <Plus size={16} />
                    Post Project
                  </Button>
                </Link>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full overflow-hidden">
                      <User size={18} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/user-profile" className="w-full">
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/saved-profiles" className="w-full">
                      Saved Profiles
                    </Link>
                  </DropdownMenuItem>
                  {user.type === 'client' && (
                    <DropdownMenuItem asChild>
                      <Link to="/post-project" className="w-full">
                        Post a Project
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link to="/login">
              <Button>Sign In</Button>
            </Link>
          )}
        </div>
        
        <div className="md:hidden flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-background shadow-lg animate-slide-up">
          <div className="container px-4 py-4 flex flex-col space-y-4">
            {/* Search in mobile menu */}
            <form onSubmit={handleSearch} className="flex items-center">
              <input
                type="text"
                placeholder="Search..."
                className="border rounded-l-md px-3 py-1 flex-grow focus:outline-none focus:ring-1 focus:ring-primary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                type="submit" 
                variant="default" 
                size="sm" 
                className="rounded-l-none rounded-r-md"
              >
                <Search size={16} />
              </Button>
            </form>
          
            <nav className="flex flex-col space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cn(
                    "text-sm font-medium p-2 rounded transition-colors",
                    location.pathname === link.path 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/saved-profiles"
                className={cn(
                  "text-sm font-medium p-2 rounded transition-colors flex items-center",
                  location.pathname === "/saved-profiles" 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <Bookmark size={16} className="mr-2" />
                Saved Profiles
                {savedProfiles.length > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 bg-primary text-white text-xs rounded-full">
                    {savedProfiles.length}
                  </span>
                )}
              </Link>
              
              {user?.isLoggedIn && (
                <Link
                  to="/user-profile"
                  className={cn(
                    "text-sm font-medium p-2 rounded transition-colors flex items-center",
                    location.pathname === "/user-profile" 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <User size={16} className="mr-2" />
                  Profile Settings
                </Link>
              )}
              
              {user?.isLoggedIn && user.userType === 'client' && (
                <Link
                  to="/post-project"
                  className={cn(
                    "text-sm font-medium p-2 rounded transition-colors flex items-center",
                    location.pathname === "/post-project" 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  )}
                >
                  <Plus size={16} className="mr-2" />
                  Post a Project
                </Link>
              )}
            </nav>
            
            <div className="pt-2 pb-1 flex justify-center">
              <ModeToggle />
            </div>
            
            <div className="flex items-center gap-2">
              {user?.isLoggedIn ? (
                <Button variant="outline" className="w-full" onClick={handleLogout}>
                  <LogOut size={16} className="mr-2" />
                  Logout
                </Button>
              ) : (
                <>
                  <Link to="/login" className="flex-1">
                    <Button variant="outline" className="w-full">Sign In</Button>
                  </Link>
                  <Link to="/signup" className="flex-1">
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
