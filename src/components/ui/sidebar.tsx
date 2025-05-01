"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { PanelLeft } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 1 week
const SIDEBAR_WIDTH = "16rem" // Default width
const SIDEBAR_WIDTH_MOBILE = "18rem" // Width on mobile offcanvas
const SIDEBAR_WIDTH_ICON = "3.5rem" // Width when collapsed to icons (adjust as needed)
const SIDEBAR_KEYBOARD_SHORTCUT = "b" // Ctrl/Cmd + B to toggle

type SidebarContext = {
  state: "expanded" | "collapsed"
  open: boolean // Desktop state (expanded/collapsed)
  setOpen: (open: boolean) => void
  openMobile: boolean // Mobile state (offcanvas open/closed)
  setOpenMobile: (open: boolean) => void
  isMobile: boolean | undefined // Check if currently mobile view
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }
  return context
}

// Reads sidebar state from cookie
const getInitialSidebarState = (defaultOpen: boolean): boolean => {
    if (typeof window === 'undefined') return defaultOpen; // Default on server
    try {
        const cookieValue = document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${SIDEBAR_COOKIE_NAME}=`))
            ?.split('=')[1];
        return cookieValue ? cookieValue === 'true' : defaultOpen;
    } catch (error) {
        console.error("Error reading sidebar cookie:", error);
        return defaultOpen;
    }
};


const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean // Initial state on desktop
    open?: boolean // Controlled state for desktop
    onOpenChange?: (open: boolean) => void // Callback for desktop state change
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile() // Hook to check if mobile view
    const [openMobile, setOpenMobile] = React.useState(false) // State for mobile offcanvas

    // Internal state for desktop sidebar (expanded/collapsed)
    const [_open, _setOpen] = React.useState(() => getInitialSidebarState(defaultOpen));
    const open = openProp ?? _open // Use controlled prop if available

    // Function to set desktop state and update cookie
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === "function" ? value(open) : value
        if (setOpenProp) {
          setOpenProp(openState)
        } else {
          _setOpen(openState)
        }
        // Set cookie to persist state
        try {
            document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}; SameSite=Lax`;
        } catch (error) {
             console.error("Error setting sidebar cookie:", error);
        }
      },
      [setOpenProp, open]
    )

    // Toggle sidebar based on device type
    const toggleSidebar = React.useCallback(() => {
      if (isMobile === undefined) return; // Avoid toggling during SSR or initial undefined state
      return isMobile
        ? setOpenMobile((prev) => !prev)
        : setOpen((prev) => !prev)
    }, [isMobile, setOpen, setOpenMobile])

    // Keyboard shortcut (Cmd/Ctrl + B) to toggle sidebar
    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key && // Check if event.key exists
          typeof event.key === 'string' && // Check if event.key is a string
          event.key.toLowerCase() === SIDEBAR_KEYBOARD_SHORTCUT &&
          (event.metaKey || event.ctrlKey)
        ) {
          event.preventDefault()
          toggleSidebar()
        }
      }
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }, [toggleSidebar])

    // Determine state string for styling based on desktop 'open' status
    const state = open ? "expanded" : "collapsed"

    // Provide context values to children
    const contextValue = React.useMemo<SidebarContext>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={100}> {/* Standard tooltip delay */}
          <div
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH,
                "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                ...style,
              } as React.CSSProperties
            }
            className={cn(
              "group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar", // Inset variant background
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"

// Sidebar component itself (handles mobile sheet and desktop container)
const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    side?: "left" | "right" // Which side the sidebar appears on
    variant?: "sidebar" | "floating" | "inset" // Visual style
    collapsible?: "offcanvas" | "icon" | "none" // How it collapses
  }
>(
  (
    {
      side = "left",
      variant = "sidebar", // Default style
      collapsible = "icon", // Default collapse behavior
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

    // Non-collapsible variant
    if (collapsible === "none") {
      return (
        <div
          className={cn(
            "sticky top-0 flex h-svh w-[--sidebar-width] flex-col border-r bg-sidebar text-sidebar-foreground", // Basic styling for non-collapsible
            side === 'right' && 'border-l border-r-0', // Adjust border for right side
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </div>
      )
    }

    // Mobile view: Render as a Sheet (offcanvas)
    if (isMobile) {
      return (
        <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
          <SheetContent
            data-sidebar="sidebar"
            data-mobile="true"
            className="w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden" // Sheet styling
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
              } as React.CSSProperties
            }
            side={side}
          >
            <div className="flex h-full w-full flex-col">{children}</div>
          </SheetContent>
        </Sheet>
      )
    }

    // Desktop view: Render the collapsible sidebar
    return (
      <div
        ref={ref}
        className="group peer hidden md:block text-sidebar-foreground sticky top-0 h-svh" // Sticky position
        data-state={state} // expanded or collapsed
        data-collapsible={state === "collapsed" ? collapsible : ""}
        data-variant={variant}
        data-side={side}
      >
        {/* Spacer div to push content (adapts width based on state) */}
        <div
          className={cn(
            "relative h-svh bg-transparent transition-[width] duration-300 ease-in-out", // Smooth transition
            "w-[--sidebar-width]", // Default width
            "group-data-[collapsible=offcanvas]:w-0", // Width when offcanvas collapsed
            collapsible === "icon" && variant !== "inset" && "group-data-[state=collapsed]:w-[--sidebar-width-icon]", // Icon-only width
            collapsible === "icon" && (variant === "floating" || variant === "inset") && "group-data-[state=collapsed]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]" // Icon width for floating/inset
          )}
        />
         {/* Actual sidebar container (fixed position) */}
        <div
          className={cn(
            "fixed inset-y-0 z-40 flex h-svh transition-[left,right,width] duration-300 ease-in-out", // Smooth transition
            // Positioning based on side and state
             side === "left" ? "left-0" : "right-0",
             collapsible === "offcanvas" && (side === "left" ? "group-data-[state=collapsed]:-left-[--sidebar-width]" : "group-data-[state=collapsed]:-right-[--sidebar-width]"),
             // Width based on state and variant
            "w-[--sidebar-width]",
            collapsible === "icon" && "group-data-[state=collapsed]:w-[--sidebar-width-icon]",
             // Padding and border for floating/inset variants
            (variant === "floating" || variant === "inset") && "p-2",
            (variant === "floating" || variant === "inset") && collapsible === "icon" && "group-data-[state=collapsed]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]",
            // Default border for sidebar variant
            variant === "sidebar" && (side === 'left' ? "border-r" : "border-l"),
            className
          )}
          {...props}
        >
          <div
            data-sidebar="sidebar" // Apply sidebar-specific styles from globals.css
            className={cn(
                "flex h-full w-full flex-col bg-sidebar",
                variant === "floating" && "rounded-lg border border-sidebar-border shadow-md", // Floating styles
                variant === "inset" && "rounded-lg" // Inset only needs rounding
            )}
          >
            {children}
          </div>
        </div>
      </div>
    )
  }
)
Sidebar.displayName = "Sidebar"

// Trigger button to toggle the sidebar (usually shown on mobile)
const SidebarTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn("size-7", className)} // Smaller trigger button
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeft className="size-4" /> {/* Icon for toggling */}
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

// Draggable rail (not implemented in this version, placeholder)
const SidebarRail = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button">
>(({ className, ...props }, ref) => {
  const { toggleSidebar } = useSidebar()
    // This component is complex and often unused, returning null for simplicity
    // If needed, the original Shadcn example code can be used here.
    return null;
})
SidebarRail.displayName = "SidebarRail"

// Main content area that adapts to the sidebar
const SidebarInset = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"main">
>(({ className, ...props }, ref) => {
  const { state, isMobile } = useSidebar(); // Get sidebar state

  return (
    <main
      ref={ref}
      className={cn(
        "flex-1 transition-[margin-left,margin-right] duration-300 ease-in-out", // Smooth margin transition
         // Adjust margin based on sidebar state, only on desktop
        !isMobile && state === 'expanded' && "md:ml-[--sidebar-width]",
        !isMobile && state === 'collapsed' && "md:ml-[--sidebar-width-icon]", // Adjust for collapsed width
        // Handle right-side sidebar if implemented (add md:mr-[...])
        className
      )}
      {...props}
    />
  )
})
SidebarInset.displayName = "SidebarInset"


const SidebarInput = React.forwardRef<
  React.ElementRef<typeof Input>,
  React.ComponentProps<typeof Input>
>(({ className, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      data-sidebar="input"
      className={cn(
        "h-8 w-full bg-sidebar-accent border-sidebar-border shadow-none focus-visible:ring-1 focus-visible:ring-sidebar-ring", // Input specific styles
        "group-data-[state=collapsed]:hidden", // Hide input when collapsed
        className
      )}
      {...props}
    />
  )
})
SidebarInput.displayName = "SidebarInput"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn("flex flex-col gap-2 p-3", // Adjusted padding
       "group-data-[state=collapsed]:px-[calc(theme(spacing.3)_-_2px)]", // Adjust padding when collapsed
       className)}
      {...props}
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn("mt-auto flex flex-col gap-2 p-3 border-t border-sidebar-border", // Added top border
       "group-data-[state=collapsed]:px-[calc(theme(spacing.3)_-_2px)]", // Adjust padding when collapsed
       className)}
      {...props}
    />
  )
})
SidebarFooter.displayName = "SidebarFooter"

const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => {
  return (
    <Separator
      ref={ref}
      data-sidebar="separator"
      className={cn("mx-3 my-1 w-auto bg-sidebar-border", // Adjusted margin/padding
       "group-data-[state=collapsed]:mx-auto group-data-[state=collapsed]:my-2 group-data-[state=collapsed]:h-6 group-data-[state=collapsed]:w-px", // Style as vertical line when collapsed
       className)}
      {...props}
    />
  )
})
SidebarSeparator.displayName = "SidebarSeparator"

// Main scrollable content area of the sidebar
const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overflow-x-hidden px-3", // Adjusted padding and gap
        // "group-data-[state=collapsed]:overflow-visible group-data-[state=collapsed]:px-auto", // Allow tooltips to overflow when collapsed
        "group-data-[state=collapsed]:px-[calc(theme(spacing.3)_-_2px)]", // Adjust padding when collapsed
        className
      )}
      {...props}
    />
  )
})
SidebarContent.displayName = "SidebarContent"

const SidebarGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="group"
      className={cn("relative flex w-full min-w-0 flex-col py-2 first:pt-0 last:pb-0", // Adjusted padding
       className)}
      {...props}
    />
  )
})
SidebarGroup.displayName = "SidebarGroup"

const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "div"

  return (
    <Comp
      ref={ref}
      data-sidebar="group-label"
      className={cn(
        "mb-1 flex h-6 shrink-0 items-center px-2 text-xs font-medium text-sidebar-foreground/60 transition-opacity duration-200 ease-linear", // Styling for group labels
        "group-data-[state=collapsed]:opacity-0 group-data-[state=collapsed]:h-0 group-data-[state=collapsed]:invisible", // Hide when collapsed
        className
      )}
      {...props}
    />
  )
})
SidebarGroupLabel.displayName = "SidebarGroupLabel"

// Action button within a group (e.g., add item)
const SidebarGroupAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      ref={ref}
      data-sidebar="group-action"
      className={cn(
        "absolute right-2 top-2 flex size-5 items-center justify-center rounded-md p-0 text-sidebar-foreground/60 outline-none ring-sidebar-ring transition-opacity hover:text-sidebar-foreground focus-visible:ring-1 [&>svg]:size-3.5",
        "group-data-[state=collapsed]:opacity-0 group-data-[state=collapsed]:invisible", // Hide when collapsed
        className
      )}
      {...props}
    />
  )
})
SidebarGroupAction.displayName = "SidebarGroupAction"

const SidebarGroupContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="group-content"
    className={cn("w-full text-sm", className)}
    {...props}
  />
))
SidebarGroupContent.displayName = "SidebarGroupContent"

// UL element for the menu items
const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu"
    className={cn("flex w-full min-w-0 flex-col gap-0.5", className)} // Reduced gap
    {...props}
  />
))
SidebarMenu.displayName = "SidebarMenu"

// LI element for each menu item
const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-sidebar="menu-item"
    className={cn("group/menu-item relative", className)}
    {...props}
  />
))
SidebarMenuItem.displayName = "SidebarMenuItem"

// Base styles for menu buttons (links or buttons)
const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-inset ring-sidebar-ring transition-colors duration-100 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-1 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: { // Added variants if needed later
      variant: {
        default: "",
      },
      size: { // Added size variants if needed later
        default: "h-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// Component for the actual menu button/link with tooltip support
const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement, // Default element type
  React.ComponentProps<"button"> & { // Default props
    asChild?: boolean // Allow rendering as a child component (e.g., Link)
    isActive?: boolean // Indicate active state
    tooltip?: string | React.ReactNode | React.ComponentProps<typeof TooltipContent> // Tooltip content or props
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(
  (
    {
      asChild = false,
      isActive = false,
      variant = "default",
      size = "default",
      tooltip,
      className,
      children, // Ensure children are passed
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    const { isMobile, state } = useSidebar()

    const buttonContent = (
         <>
            {children}
         </>
    );


    const button = (
      <Comp
        ref={ref}
        data-sidebar="menu-button" // Removed: data-sidebar prop is invalid on Slot/button
        data-size={size}
        data-active={isActive}
        className={cn(sidebarMenuButtonVariants({ variant, size }), className,
         state === "collapsed" && "justify-center group-data-[state=collapsed]:w-8" // Center icon when collapsed
         )}
        {...props}
      >
        {buttonContent}
      </Comp>
    )

    // If no tooltip, return the button directly
    if (!tooltip) {
      return button
    }

    // Prepare tooltip props
    const tooltipProps: Partial<React.ComponentProps<typeof TooltipContent>> = typeof tooltip === 'string'
        ? { children: <span className="text-xs">{tooltip}</span> } // Wrap string in span for styling
        : React.isValidElement(tooltip)
        ? { children: tooltip }
        : (tooltip as React.ComponentProps<typeof TooltipContent>);


    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent
          side="right"
          align="center"
          sideOffset={8} // Add offset
          className="text-xs" // Ensure tooltip text is small
          // Hide tooltip if sidebar is expanded or on mobile
          // Use 'hidden' prop for conditional rendering within TooltipPrimitive
          // Note: TooltipPrimitive doesn't have a direct 'hidden' prop. We manage visibility via the Tooltip's open state or conditional rendering *outside* if needed.
          // For simplicity here, we rely on the visual hiding when collapsed via CSS, but Tooltip might still render.
          // A more robust solution might involve controlling Tooltip's `open` prop based on `state`.
          {...tooltipProps}
        />
      </Tooltip>
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

// Action button appearing inside a menu item (e.g., settings icon)
const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    showOnHover?: boolean // Only show on hover/focus
  }
>(({ className, asChild = false, showOnHover = true, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-action"
      className={cn(
        "absolute right-1 top-1/2 -translate-y-1/2 flex size-5 items-center justify-center rounded-md p-0 text-sidebar-foreground/60 outline-none ring-inset ring-sidebar-ring transition-opacity hover:text-sidebar-foreground focus-visible:ring-1 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-3.5",
        "group-data-[state=collapsed]:hidden", // Hide when collapsed
        showOnHover &&
          "opacity-0 group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
        className
      )}
      {...props}
    />
  )
})
SidebarMenuAction.displayName = "SidebarMenuAction"

// Badge appearing inside a menu item (e.g., notification count)
const SidebarMenuBadge = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="menu-badge"
    className={cn(
      "absolute right-2 top-1/2 -translate-y-1/2 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-medium tabular-nums text-sidebar-foreground select-none pointer-events-none", // Badge styles
      "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
      "group-data-[state=collapsed]:hidden", // Hide when collapsed
      className
    )}
    {...props}
  />
))
SidebarMenuBadge.displayName = "SidebarMenuBadge"

// Skeleton loader for menu items
const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    showIcon?: boolean // Whether to show an icon skeleton
  }
>(({ className, showIcon = true, ...props }, ref) => {
  const width = React.useMemo(() => `${Math.floor(Math.random() * 40) + 50}%`, []) // Random width for text

  return (
    <div
      ref={ref}
      data-sidebar="menu-skeleton"
      className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 shrink-0 rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 flex-1 max-w-[--skeleton-width]"
        data-sidebar="menu-skeleton-text"
        style={{ "--skeleton-width": width } as React.CSSProperties}
      />
    </div>
  )
})
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton"

// UL for submenu items
const SidebarMenuSub = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
  <ul
    ref={ref}
    data-sidebar="menu-sub"
    className={cn(
      "ml-[1.125rem] flex min-w-0 flex-col gap-0.5 border-l border-sidebar-border pl-3 pr-1 py-1", // Submenu styling with left border
      "group-data-[state=collapsed]:hidden", // Hide when collapsed
      className
    )}
    {...props}
  />
))
SidebarMenuSub.displayName = "SidebarMenuSub"

// LI for submenu items
const SidebarMenuSubItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
     <li ref={ref} className={cn("relative", className)} {...props} /> // Added relative positioning if needed
))
SidebarMenuSubItem.displayName = "SidebarMenuSubItem"

// Button/Link for submenu items
const SidebarMenuSubButton = React.forwardRef<
  HTMLAnchorElement, // Default element
  React.ComponentProps<"a"> & { // Default props
    asChild?: boolean
    size?: "sm" | "md" // Size options
    isActive?: boolean
  }
>(({ asChild = false, size = "md", isActive, className, ...props }, ref) => {
  const Comp = asChild ? Slot : "a"

  return (
    <Comp
      ref={ref}
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "flex h-7 min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground/80 outline-none ring-inset ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-1 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground",
        "data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground", // Active state styles
        size === "sm" && "text-xs h-6", // Small size styles
        size === "md" && "text-sm h-7", // Medium size styles
        "group-data-[state=collapsed]:hidden", // Hide when collapsed
        className
      )}
      {...props}
    />
  )
})
SidebarMenuSubButton.displayName = "SidebarMenuSubButton"

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}
