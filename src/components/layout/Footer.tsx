import { Link } from "react-router-dom";
import { Activity, Mail, Phone, MapPin } from "lucide-react";
import logo from '../../assets/logo.webp';
export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              {/* <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
                <Activity className="h-5 w-5 text-primary-foreground" />
              </div> */}
              <img src={logo} alt="Tanish Physio Logo" className="h-20 w-auto object-contain" />
              {/* <span className="text-xl font-bold text-foreground">Tanish Physio</span> */}
            </Link>
            <p className="text-sm text-muted-foreground">
              Professional physiotherapy consultations from the comfort of your home.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/therapists" className="hover:text-primary transition-colors">Find Therapists</Link></li>
              <li><Link to="/plans" className="hover:text-primary transition-colors">Subscription Plans</Link></li>
              <li><Link to="/questionnaire" className="hover:text-primary transition-colors">Health Assessment</Link></li>
              <li><Link to="/profile" className="hover:text-primary transition-colors">My Profile</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
             drkhushboo26@gmail.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                 +91 9427555696
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-10 text-primary" />
                5, Dhaval Appts, Besides Telephone Exchange,Choksiwadi Road, Ajaramar Chowk, Adajan
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Tanish Physio. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
