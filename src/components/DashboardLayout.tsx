// src/components/DashboardLayout.tsx
import { useState } from "react";
import { Moon, Sun, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardSidebar } from "./DashboardSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { UserProgressDropdown } from "./UserProgressDropdown";
import { authService } from "@/services/authService";
import { NotesTree } from "./NotesTree";
import { NoteEditor } from "./NoteEditor";

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentView: string;
  onViewChange: (view: string) => void;
}

export const DashboardLayout = ({ children, currentView, onViewChange }: DashboardLayoutProps) => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

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
          {/* Header with level progress on the right */}
          <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="flex h-16 items-center justify-between px-6">
              {/* Left side - Logo and Title */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <span className="text-white font-bold text-xl">PS</span>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  PlayStudy
                </h1>
              </div>
              
              {/* Right side - User Progress, Theme Toggle, Logout, and Avatar */}
              <div className="flex items-center gap-3">
                <UserProgressDropdown />
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="rounded-full"
                  title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
                >
                  {theme === "light" ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="rounded-full hover:bg-destructive/10 hover:text-destructive"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </Button>
                
                <div className="w-10 h-10 rounded-full bg-gradient-card flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity">
                  <span className="text-white font-semibold">IF</span>
                </div>
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