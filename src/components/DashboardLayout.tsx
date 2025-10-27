// src/components/DashboardLayout.tsx
import { useState } from "react";
import { Moon, Sun, LogOut, Settings, CreditCard, BookOpen, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardSidebar } from "./DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { authService } from "@/services/authService";
import { NotesTree } from "./NotesTree";
import { NoteEditor } from "./NoteEditor";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGameContext } from "@/contexts/GameContext";
import { Badge } from "@/components/ui/badge";

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
}

export const DashboardLayout = ({ children, currentView, onViewChange }: DashboardLayoutProps) => {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const { userProgress } = useGameContext();

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      authService.logout();
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar currentView={currentView} onViewChange={onViewChange} />

        <main className="flex-1 flex flex-col">
          {/* Header with cleaner design */}
          <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center justify-between px-6">
              {/* Left side - Logo and Title */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <div className="flex flex-col">
                  <h1 className="text-xl font-bold leading-none">StudyGame</h1>
                  <p className="text-xs text-muted-foreground">Learn through play</p>
                </div>
              </div>

              {/* Right side - Level, Theme Toggle, User Menu */}
              <div className="flex items-center gap-3">
                {/* Level Display */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/30">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                    <span className="text-sm font-medium">Level {userProgress.level}</span>
                  </div>
                  <div className="h-4 w-px bg-border"></div>
                  <span className="text-xs text-muted-foreground">{userProgress.totalPoints} pts</span>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="rounded-lg"
                  title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
                >
                  {theme === "light" ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                </Button>

                {/* User Menu Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20 hover:border-primary/40 transition-colors">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">Student User</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          student@example.com
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onViewChange('settings')} className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onViewChange('subscription')} className="cursor-pointer">
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Subscription</span>
                      <Badge variant="outline" className="ml-auto text-xs bg-primary/10 text-primary border-primary/20">
                        Pro
                      </Badge>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>
          
          {/* Main content area */}
          {currentView === "notes" ? (
            // Notes view - Full width with tree sidebar and editor
            <div className="flex-1 flex overflow-hidden">
              <div className="w-64 flex-shrink-0">
                <NotesTree />
              </div>
              <div className="flex-1 overflow-auto">
                <NoteEditor />
              </div>
            </div>
          ) : (
            // Default views - Centered container
            <div className="flex-1 overflow-auto">
              <div className="container max-w-7xl mx-auto p-6">
                {children}
              </div>
            </div>
          )}
        </main>
      </div>
    </SidebarProvider>
  );
};