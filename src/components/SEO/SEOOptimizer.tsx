import { useEffect } from "react";

const SEOOptimizer = () => {
  useEffect(() => {
    // Optimize resource loading
    optimizeResourceLoading();

    // Add performance monitoring
    addPerformanceMonitoring();

    // Add cache headers simulation (would be implemented on server)
    addCacheHeaders();

    // Add Google Analytics
    addGoogleAnalytics();

    // Add HTTP/2 readiness indicators
    prepareForHTTP2();
  }, []);

  const optimizeResourceLoading = () => {
    // Preload critical resources
    const preloadCriticalResources = () => {
      const criticalResources = [
        { href: "/favicon.png", as: "image" },
        { href: "/assets/main.css", as: "style" },
      ];

      criticalResources.forEach((resource) => {
        const link = document.createElement("link");
        link.rel = "preload";
        link.href = resource.href;
        link.as = resource.as;
        document.head.appendChild(link);
      });
    };

    preloadCriticalResources();

    // Defer non-critical CSS and JS
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    links.forEach((link: any) => {
      if (link.href.includes("non-critical")) {
        link.setAttribute("media", "print");
        link.onload = () => link.removeAttribute("media");
      }
    });
  };

  const addPerformanceMonitoring = () => {
    // Monitor First Contentful Paint (FCP)
    if ("performance" in window) {
      const measureFCP = () => {
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const fcpEntry = entries[entries.length - 1];

          // Log FCP to console (in production, send to analytics)
          console.log(`First Contentful Paint: ${fcpEntry.startTime}ms`);

          // Alert if FCP is too slow (>1.8s as recommended)
          if (fcpEntry.startTime > 1800) {
            console.warn("FCP is too slow:", fcpEntry.startTime, "ms");
          }
        }).observe({ entryTypes: ["paint"] });
      };

      // Wait for page to be interactive before measuring
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", measureFCP);
      } else {
        measureFCP();
      }
    }
  };

  const addCacheHeaders = () => {
    // This would typically be handled by the server
    // But we can add cache-related meta tags
    const addMetaTags = () => {
      const metaTags = [
        { name: "cache-control", content: "public, max-age=31536000" }, // 1 year for static assets
      ];

      metaTags.forEach((tag) => {
        const meta = document.createElement("meta");
        meta.name = tag.name;
        meta.content = tag.content;
        document.head.appendChild(meta);
      });
    };

    addMetaTags();
  };

  const addGoogleAnalytics = () => {
    // Add Google Analytics script (replace with your GA ID)
    const gaId = import.meta.env.VITE_GA_ID || "GA_MEASUREMENT_ID";

    if (gaId && gaId !== "GA_MEASUREMENT_ID") {
      // Load Google Analytics
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script);

      script.onload = () => {
        (window as any).dataLayer = (window as any).dataLayer || [];
        function gtag(...args: any[]) {
          (window as any).dataLayer.push(args);
        }
        gtag("js", new Date());
        gtag("config", gaId);
      };
    }
  };

  const prepareForHTTP2 = () => {
    // Add HTTP/2 Server Push hints (these are hints for the server)
    // In practice, HTTP/2 optimizations are handled at the server level
    const addResourceHints = () => {
      const hints = [
        { href: "/api/data", rel: "preconnect" },
        {
          href: "https://fonts.googleapis.com",
          rel: "preconnect",
          crossorigin: "anonymous",
        },
      ];

      hints.forEach((hint) => {
        const link = document.createElement("link");
        link.rel = hint.rel;
        link.href = hint.href;
        if (hint.crossorigin) {
          link.crossOrigin = hint.crossorigin;
        }
        document.head.appendChild(link);
      });
    };

    addResourceHints();
  };

  return null;
};

export default SEOOptimizer;
