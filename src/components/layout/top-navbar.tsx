import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sun, Moon, ChevronDown, LogOut } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

export function TopNavbar() {
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  // Mock username - in real app this would come from auth context
  const username = "john.doe";

  const navItems = [
    { title: "Dashboard", path: "/" },
    { title: "Streams", path: "/streams" },
    { title: "Alerts", path: "/alerts" },
    { title: "Reports", path: "/reports" },
    { title: "DevTool", path: "/devtool" },
  ];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    // Handle logout logic
    console.log("Logging out...");
  };

  return (
    <nav className="bg-success text-success-foreground border-b border-success">
      <div className="flex h-16 items-center px-6">
        {/* Logo/Brand */}
        <div className="flex items-center space-x-4 mr-8">
          <h1 className="text-xl font-bold text-success-foreground">Safaricom ET Pipeline</h1>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={`text-sm font-medium transition-colors px-3 py-2 rounded-md ${
                isActive(item.path)
                  ? "bg-success-foreground/20 text-success-foreground font-semibold"
                  : "text-success-foreground/80 hover:text-success-foreground hover:bg-success-foreground/10"
              }`}
            >
              {item.title}
            </NavLink>
          ))}
        </div>

        {/* Right side - Theme toggle and User menu */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            className="text-success-foreground hover:bg-success-foreground/10"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2 text-success-foreground hover:bg-success-foreground/10">
                <span className="text-sm font-medium">{username}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleLogout} className="flex items-center space-x-2">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}