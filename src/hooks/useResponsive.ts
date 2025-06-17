
import { useState, useEffect } from 'react';

interface BreakpointConfig {
  xs: boolean;
  sm: boolean;
  md: boolean;
  lg: boolean;
  xl: boolean;
  '2xl': boolean;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export const useResponsive = (): BreakpointConfig => {
  const [breakpoints, setBreakpoints] = useState<BreakpointConfig>({
    xs: false,
    sm: false,
    md: false,
    lg: false,
    xl: false,
    '2xl': false,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  });

  useEffect(() => {
    const checkBreakpoints = () => {
      const width = window.innerWidth;
      
      const newBreakpoints = {
        xs: width >= 475,
        sm: width >= 640,
        md: width >= 768,
        lg: width >= 1024,
        xl: width >= 1280,
        '2xl': width >= 1536,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
      };

      setBreakpoints(newBreakpoints);
    };

    checkBreakpoints();
    window.addEventListener('resize', checkBreakpoints);
    
    return () => window.removeEventListener('resize', checkBreakpoints);
  }, []);

  return breakpoints;
};
