"use client";

import * as React from "react";
import { PanelLeft } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../../components/ui/button";

// Constants
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";

// Context
type SidebarContextType = {
  isOpen: boolean;
  toggleSidebar: () => void;
  isMobile: boolean;
};

const SidebarContext = React.createContext<SidebarContextType | undefined>(
  undefined
);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

// Simple hook to detect mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

// Provider
const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const isMobile = useIsMobile();

  const toggleSidebar = React.useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <SidebarContext.Provider value={{ isOpen, toggleSidebar, isMobile }}>
      <div
        className="flex min-h-screen w-full"
        style={
          {
            "--sidebar-width": SIDEBAR_WIDTH,
          } as React.CSSProperties
        }
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
};

// Main Sidebar Component
const Sidebar = ({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { isOpen, isMobile } = useSidebar();

  if (isMobile) {
    return (
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[--sidebar-width] transform bg-white border-r shadow-lg transition-transform duration-200 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
        style={
          { "--sidebar-width": SIDEBAR_WIDTH_MOBILE } as React.CSSProperties
        }
        {...props}
      >
        <div className="flex h-full flex-col">{children}</div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "hidden md:flex h-screen flex-col w-[--sidebar-width] bg-white border-r transition-all duration-200 ease-in-out",
        isOpen ? "w-[--sidebar-width]" : "w-0 overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

// Sidebar Header
const SidebarHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col p-4 border-b", className)} {...props} />
);

// Sidebar Content
const SidebarContent = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex-1 overflow-auto p-2", className)} {...props} />
);

// Sidebar Group
const SidebarGroup = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mb-4", className)} {...props} />
);

// Sidebar Group Label
const SidebarGroupLabel = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "px-2 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider",
      className
    )}
    {...props}
  />
);

// Sidebar Group Content
const SidebarGroupContent = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mt-1", className)} {...props} />
);

// Sidebar Menu
const SidebarMenu = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLUListElement>) => (
  <ul className={cn("space-y-1", className)} {...props} />
);

// Sidebar Menu Item
const SidebarMenuItem = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLLIElement>) => (
  <li className={cn("", className)} {...props} />
);

// Sidebar Menu Button
interface SidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
}

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  SidebarMenuButtonProps
>(({ className, isActive, children, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-gray-100",
      isActive && "bg-gray-100 font-medium",
      className
    )}
    {...props}
  >
    {children}
  </button>
));
SidebarMenuButton.displayName = "SidebarMenuButton";

// Sidebar Inset (Main Content)
const SidebarInset = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { isOpen, isMobile } = useSidebar();

  return (
    <div
      className={cn(
        "flex flex-1 flex-col transition-all duration-200 ease-in-out",
        isMobile ? "w-full" : isOpen ? "md:ml-[--sidebar-width]" : "md:ml-0",
        className
      )}
      {...props}
    />
  );
};

// Sidebar Trigger
const SidebarTrigger = ({
  className,
  ...props
}: React.ComponentProps<typeof Button>) => {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8", className)}
      onClick={toggleSidebar}
      {...props}
    >
      <PanelLeft className="h-4 w-4" />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
};

export {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
};
