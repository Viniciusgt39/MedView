import * as React from "react"

// Standard mobile breakpoint (adjust if needed)
const MOBILE_BREAKPOINT = 768 // Corresponds to Tailwind's `md` breakpoint

/**
 * Custom hook to determine if the current viewport width is considered mobile.
 * Returns `true` if the width is less than the mobile breakpoint, `false` otherwise.
 * Returns `undefined` during server-side rendering or before the first client-side check.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Function to check and update the state
    const checkDeviceSize = () => {
        setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Check on initial mount
    checkDeviceSize();

    // Add event listener for window resize
    window.addEventListener('resize', checkDeviceSize);

    // Cleanup function to remove the event listener
    return () => {
        window.removeEventListener('resize', checkDeviceSize);
    };
  }, []); // Empty dependency array ensures this runs only once on mount and cleans up on unmount

  return isMobile; // Return the boolean state (or undefined initially)
}
