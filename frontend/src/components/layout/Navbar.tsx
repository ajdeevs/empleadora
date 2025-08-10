
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ModeToggle } from '@/components/ui/ModeToggle';
import { useUserMode } from '@/context/UserModeContext';
import { useAuth } from '@/context/AuthContext';
import { WalletConnectButton } from '@/components/shared/WalletAdapter';
import { Menu, User, LogOut, Settings, Briefcase, Users, Award, Shield, TrendingUp } from 'lucide-react';

export function Navbar() {
  const location = useLocation();
  const { mode, toggleMode } = useUserMode();
  const { user, isAuthenticated, logout } = useAuth();


  const handleLogout = () => {
    logout();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 mr-8">
          <span className="font-bold text-xl">Empleadora</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 flex-1">
          <Link 
            to="/" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive('/') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Home
          </Link>
          <Link 
            to="/projects" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive('/projects') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Projects
          </Link>
          <Link 
            to="/freelancers" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive('/freelancers') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Freelancers
          </Link>
          <Link 
            to="/contests" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive('/contests') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            Contests
          </Link>
          <Link 
            to="/how-it-works" 
            className={`text-sm font-medium transition-colors hover:text-primary ${
              isActive('/how-it-works') ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            How It Works
          </Link>
        </nav>



        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Wallet Connect Button */}
          <WalletConnectButton />

          {/* User Mode Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleMode}
            className="hidden sm:flex"
          >
            {mode === 'client' ? 'Hire' : 'Work'}
          </Button>

          {/* Theme Toggle */}
          <ModeToggle />

          {/* User Menu */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatars/01.png" alt={user?.email} />
                    <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.wallet_address?.slice(0, 8)}...{user?.wallet_address?.slice(-6)}
                    </p>
                    <Badge variant="secondary" className="w-fit mt-1">
                      {user?.role}
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {/* Role-specific menu items */}
                {user?.role === 'client' && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/project-management" className="flex items-center">
                        <Briefcase className="mr-2 h-4 w-4" />
                        Project Management
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/funding-management" className="flex items-center">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Funding Management
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                
                {user?.role === 'freelancer' && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/available-projects" className="flex items-center">
                        <Briefcase className="mr-2 h-4 w-4" />
                        Available Projects
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/milestone-management" className="flex items-center">
                        <Award className="mr-2 h-4 w-4" />
                        Milestone Management
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                
                {user?.role === 'admin' && (
                  <>
                    <DropdownMenuItem asChild>
                      <Link to="/admin-panel" className="flex items-center">
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/user-profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="flex items-center">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/signup">Sign up</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-4 mt-8">
                <Link to="/" className="text-lg font-medium">Home</Link>
                <Link to="/projects" className="text-lg font-medium">Projects</Link>
                <Link to="/freelancers" className="text-lg font-medium">Freelancers</Link>
                <Link to="/contests" className="text-lg font-medium">Contests</Link>
                <Link to="/how-it-works" className="text-lg font-medium">How It Works</Link>
                
                {isAuthenticated && (
                  <>
                    <div className="border-t pt-4 mt-4">
                      <p className="text-sm text-muted-foreground mb-2">Management</p>
                      {user?.role === 'client' && (
                        <>
                          <Link to="/project-management" className="block text-lg font-medium mb-2">
                            Project Management
                          </Link>
                          <Link to="/funding-management" className="block text-lg font-medium mb-2">
                            Funding Management
                          </Link>
                        </>
                      )}
                      {user?.role === 'freelancer' && (
                        <Link to="/milestone-management" className="block text-lg font-medium mb-2">
                          Milestone Management
                        </Link>
                      )}
                      {user?.role === 'admin' && (
                        <Link to="/admin-panel" className="block text-lg font-medium mb-2">
                          Admin Panel
                        </Link>
                      )}
                    </div>
                    
                    <div className="border-t pt-4">
                      <Link to="/user-profile" className="block text-lg font-medium mb-2">Profile</Link>
                      <Link to="/dashboard" className="block text-lg font-medium mb-2">Dashboard</Link>
                      <Button onClick={handleLogout} variant="ghost" className="w-full justify-start p-0 h-auto text-lg font-medium">
                        Log out
                      </Button>
                    </div>
                  </>
                )}
                
                {!isAuthenticated && (
                  <div className="border-t pt-4">
                    <Button asChild variant="ghost" className="w-full justify-start p-0 h-auto text-lg font-medium">
                      <Link to="/login">Sign in</Link>
                    </Button>
                    <Button asChild className="w-full justify-start p-0 h-auto text-lg font-medium mt-2">
                      <Link to="/signup">Sign up</Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
