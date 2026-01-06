import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    // Scroll to top on all navigation types (PUSH, POP, REPLACE)
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth' // Optional: adds smooth scrolling animation
    });
  }, [pathname, navigationType]);

  return null;
};

export default ScrollToTop;