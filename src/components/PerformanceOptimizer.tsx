import { useEffect } from "react";

const PerformanceOptimizer = () => {
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
      const criticalResources = [{ href: "/favicon.png", as: "image" }];

      criticalResources.forEach((resource) => {
        // Check if resource is already preloaded to avoid duplicates
        const existingLink = document.querySelector(
          `link[href="${resource.href}"][rel="preload"]`
        );
        if (!existingLink) {
          const link = document.createElement("link");
          link.rel = "preload";
          link.href = resource.href;
          link.as = resource.as;
          link.crossOrigin = "anonymous"; // For CDN resources
          document.head.appendChild(link);
        }
      });
    };

    preloadCriticalResources();

    // Optimize script loading
    const scripts = document.querySelectorAll("script[data-defer]");
    scripts.forEach((script: any) => {
      script.setAttribute("defer", "");
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
          console.log(
            `First Contentful Paint: ${Math.round(fcpEntry.startTime)}ms`
          );

          // Alert if FCP is too slow (>1.8s as recommended)
          if (fcpEntry.startTime > 1800) {
            console.warn(
              "FCP is too slow:",
              Math.round(fcpEntry.startTime),
              "ms"
            );
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
      // Check if meta tag already exists to avoid duplicates
      const existingTag = document.querySelector('meta[name="cache-control"]');
      if (!existingTag) {
        const meta = document.createElement("meta");
        meta.name = "cache-control";
        meta.content = "public, max-age=31536000"; // 1 year for static assets
        document.head.appendChild(meta);
      }
    };

    addMetaTags();
  };

  const addGoogleAnalytics = () => {
    // Add Google Analytics script (replace with your GA ID)
    const gaId = import.meta.env.VITE_GA_ID || "GA_MEASUREMENT_ID";

    if (gaId && gaId !== "GA_MEASUREMENT_ID") {
      // Check if GA script is already loaded
      if (!document.querySelector('script[src*="googletagmanager"]')) {
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
    }
  };

  const prepareForHTTP2 = () => {
    // Add HTTP/2 Server Push hints (these are hints for the server)
    // In practice, HTTP/2 optimizations are handled at the server level
    const addResourceHints = () => {
      const hints = [
        {
          href: "https://fonts.googleapis.com",
          rel: "preconnect",
          crossorigin: "anonymous",
        },
        {
          href: "https://fonts.gstatic.com",
          rel: "preconnect",
          crossorigin: "anonymous",
        },
      ];

      hints.forEach((hint) => {
        // Check if hint already exists
        const existingHint = document.querySelector(
          `link[href="${hint.href}"][rel="${hint.rel}"]`
        );
        if (!existingHint) {
          const link = document.createElement("link");
          link.rel = hint.rel;
          link.href = hint.href;
          if (hint.crossorigin) {
            link.crossOrigin = hint.crossorigin;
          }
          document.head.appendChild(link);
        }
      });
    };

    addResourceHints();
  };

  return null;
};

export default PerformanceOptimizer;
