import { Link } from "react-router-dom";
import { Home, Phone, Mail, MapPin } from "lucide-react";
import { SEOHead } from "@/components/SEO/SEOHead";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white flex flex-col items-center justify-center p-4">
      <SEOHead
        title="Page Not Found - 404 Error | Tanish Physio & Fitness"
        description="The page you are looking for could not be found. Return to our homepage to continue exploring our professional physiotherapy services and certified therapist consultations."
        keywords="404 error, page not found, broken link, missing page, error page, physiotherapy services"
        ogImage="/api/og/404"
        canonicalUrl="https://tanishphysiofitness.in/404"
      />

      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="text-8xl font-bold text-primary">404</div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            Oops! Page Not Found
          </h1>
          <p className="text-lg text-slate-600 max-w-md mx-auto">
            The page you're looking for doesn't exist or may have been moved.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-slate-100">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            What would you like to do?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="flex items-center justify-center gap-2 bg-primary text-white font-semibold py-3 px-6 rounded-xl hover:bg-primary/90 transition-colors"
            >
              <Home className="h-5 w-5" />
              Return Home
            </Link>
            <Link
              to="/contact"
              className="flex items-center justify-center gap-2 bg-slate-100 text-slate-700 font-semibold py-3 px-6 rounded-xl hover:bg-slate-200 transition-colors"
            >
              <Phone className="h-5 w-5" />
              Contact Us
            </Link>
          </div>
        </div>

        <div className="text-slate-500 text-sm">
          <p>Need immediate assistance?</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-2">
            <a
              href="tel:+919427555696"
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <Phone className="h-4 w-4" />
              +91 9427555696
            </a>
            <a
              href="mailto:drkhushboo26@gmail.com"
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <Mail className="h-4 w-4" />
              drkhushboo26@gmail.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
