import { Link } from "react-router-dom";
import {
  Activity,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
} from "lucide-react";
import logo from "../../assets/logo.webp";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchContactPublic } from "../../store/slices/cmsSlice";
import { RootState } from "../../store";

export function Footer() {
  const dispatch = useDispatch();
  const contact = useSelector((state: RootState) => state.cms.contact);

  useEffect(() => {
    dispatch(fetchContactPublic() as any);
  }, [dispatch]);

  // Fallback data if API data is not available
  const contactData = contact || {
    email: "drkhushboo26@gmail.com",
    phone: "+91 9427555696",
    address:
      "5, Dhaval Appts, Besides Telephone Exchange, Choksiwadi Road, Ajaramar Chowk, Adajan",
    socialLinks: [
      {
        platform: "facebook",
        url: "https://www.facebook.com/TanishPhysioFitnessandLaserClinic",
      },
      {
        platform: "instagram",
        url: "https://www.instagram.com/tanish_physio_fitness_clinic/",
      },
      {
        platform: "linkedin",
        url: "https://www.linkedin.com/in/dr-khhushbu-joshi-9b087b179/",
      },
    ],
  };

  // Function to get social icon based on platform
  const getSocialIcon = (platform: string) => {
    switch (platform?.toLowerCase()) {
      case "facebook":
        return <Facebook className="h-5 w-5" />;
      case "instagram":
        return <Instagram className="h-5 w-5" />;
      case "linkedin":
        return <Linkedin className="h-5 w-5" />;
      default:
        return null;
    }
  };

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex flex-col items-start gap-2">
              <img
                src={logo}
                alt="Tanish Physio & Fitness Logo"
                className="h-20 w-auto object-contain"
              />

              <span className="text-xs md:text-[12px] font-semibold tracking-wider text-primary">
                Practising Since 2004
              </span>
            </Link>

            <p className="text-sm text-muted-foreground">
              Professional physiotherapy consultations from the comfort of your
              home.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  to="/services"
                  className="hover:text-primary transition-colors"
                >
                  Services
                </Link>
              </li>
              <li>
                <Link
                  to="/plans"
                  className="hover:text-primary transition-colors"
                >
                  Subscription Plans
                </Link>
              </li>
              <li>
                <Link
                  to="/questionnaire"
                  state={{ goToSchedule: true }}
                  className="hover:text-primary transition-colors"
                >
                  Health Assessment
                </Link>
              </li>
              {/* <li><Link to="/profile" className="hover:text-primary transition-colors">My Profile</Link></li> */}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link
                  to="/faq"
                  className="hover:text-primary transition-colors"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-primary transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-primary transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                <a
                  href={`mailto:${contactData.email}`}
                  className="hover:text-primary transition-colors"
                >
                  {contactData.email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                {contactData.phone}
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-10 text-primary" />
                <a
                  href="https://www.google.com/maps/search/?api=1&query=5%2C+Dhaval+Appts%2C+Besides+Telephone+Exchange%2C+Choksiwadi+Road%2C+Ajaramar+Chowk%2C+Adajan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                >
                  {contactData.address}
                </a>
              </li>
              {/* Social Links */}
              <li className="flex gap-4 pt-2">
                {contactData.socialLinks &&
                  contactData.socialLinks.map((link: any) => (
                    <a
                      key={link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary hover:scale-110 transition-colors"
                      aria-label={`Follow us on ${link.platform}`}
                      title={`Follow us on ${link.platform}`}
                    >
                      {getSocialIcon(link.platform)}
                    </a>
                  ))}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-4 pt-4   text-center text-sm text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Tanish Physiotherapy & Fitness
            Clinic.
          </p>
        </div>
      </div>
    </footer>
  );
}
