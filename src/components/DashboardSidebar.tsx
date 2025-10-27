import { BookOpen, Gamepad2, Library, Clock, Play, BarChart3, HelpCircle } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useGameContext } from "@/contexts/GameContext";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { title: "Game Library", icon: Library, view: "library" },
  { title: "My Stats", icon: BarChart3, view: "stats" },
  { title: "Question Demo", icon: HelpCircle, view: "question-demo" },
  { title: "My Notes", icon: BookOpen, view: "notes" },
];

interface DashboardSidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function DashboardSidebar({ currentView, onViewChange }: DashboardSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { userGames, setSelectedGameId } = useGameContext();

  const handleGameClick = (gameId: string) => {
    setSelectedGameId(gameId);
    onViewChange("game-detail");
  };

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    isActive={currentView === item.view}
                    onClick={() => onViewChange(item.view)}
                  >
                    <item.icon className="h-4 w-4" />
                    {!isCollapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {!isCollapsed && userGames.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="flex items-center gap-2">
              <Gamepad2 className="h-4 w-4" />
              My Games ({userGames.length})
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="space-y-2 px-2">
                {userGames.map((game) => (
                  <div
                    key={game.id}
                    className="p-3 rounded-lg bg-sidebar-accent hover:bg-sidebar-accent/80 cursor-pointer transition-colors group"
                    onClick={() => handleGameClick(game.id)}
                  >
                    <div className="flex items-start gap-2">
                      <Play className="h-4 w-4 mt-0.5 text-primary flex-shrink-0 group-hover:scale-110 transition-transform" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {game.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs px-1.5 py-0">
                            {game.questionsCount}Q
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {game.accuracy ?? game.currentProgress}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
