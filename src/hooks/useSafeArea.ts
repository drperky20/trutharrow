import { useEffect, useState } from "react";

/**
 * Hook to read iOS safe-area-inset-bottom and apply minimum padding
 */
export function useSafeAreaBottom(min = 8) {
  const [pad, setPad] = useState(min);
  
  useEffect(() => {
    const read = () => {
      // Read the CSS custom property set by our root styles
      const envInset = parseInt(
        getComputedStyle(document.documentElement)
          .getPropertyValue("--safe-bottom")
          .replace("px", "") || "0"
      );
      setPad(Math.max(min, envInset || 0));
    };
    
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, [min]);
  
  return pad;
}

