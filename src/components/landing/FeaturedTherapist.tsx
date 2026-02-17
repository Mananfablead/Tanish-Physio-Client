import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Calendar, Star, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

interface FeaturedTherapistProps {
  publicAdmins: any[];
  adminsLoading: boolean;
  adminsError: string | null;
}

export const FeaturedTherapist = ({ publicAdmins, adminsLoading, adminsError }: FeaturedTherapistProps) => {
  return (
    <section
      className="py-20 relative overflow-hidden border-y border-primary/10"
      style={{ backgroundColor: "#f1fafa" }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <div className="container relative z-10">
        {adminsLoading ? (
          <div className="text-center py-12">
            <p>Loading featured therapist...</p>
          </div>
        ) : publicAdmins && publicAdmins.length > 0 ? (
          <motion.div
            className="grid lg:grid-cols-2 gap-16 items-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {/* Therapist Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                <img
                  src={publicAdmins[0].profilePicture || "https://images.unsplash.com/photo-1622253692010-333f2da6031d"}
                  alt={publicAdmins[0].name}
                  className="w-full h-[500px] object-cover rounded-3xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <Badge className="absolute top-6 right-6 bg-success text-success-foreground shadow-lg">
                  Available Today
                </Badge>
              </div>
            </motion.div>

            {/* Therapist Details */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <Badge variant="secondary" className="border border-primary/20 w-fit">
                Featured Therapist
              </Badge>

              <h2 className="text-3xl lg:text-4xl font-bold">
                {publicAdmins[0].name}
              </h2>

              <p className="font-semibold text-lg">
                <span className="text-slate-600">Specialization: </span>
                <span className="text-primary">
                  {publicAdmins[0].doctorProfile?.specialization || "Certified Physiotherapist"}
                </span>
              </p>


              <div className="flex flex-wrap items-center gap-6 text-sm">

                {/* Experience */}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />

                  <span className="font-semibold text-slate-800">Experience:</span>

                  <span className="font-semibold text-slate-800">
                    {publicAdmins[0].doctorProfile?.experience
                      ? `${publicAdmins[0].doctorProfile.experience}+ Years`
                      : "Experienced Professional"}
                  </span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-warning text-warning" />

                  <span className="font-semibold text-slate-800">
                    4.9 Rating
                  </span>
                </div>

              </div>


              <p className="text-muted-foreground leading-relaxed max-w-xl">
                {publicAdmins[0].doctorProfile?.bio || "Specialized in sports injuries, post-surgery rehabilitation, and chronic pain management. Known for personalized recovery plans and fast results through virtual physiotherapy."}
              </p>

             <div className="text-sm">
  <span className="text-slate-500 mr-1">Education</span>
  <span className="text-slate-400 mr-1">|</span>
  <span className="font-semibold text-primary">
    {publicAdmins[0].doctorProfile?.education || "Not specified"}
  </span>
</div>


              <div className="space-y-2">
                <p className="text-sm text-muted-foreground font-semibold">Languages:</p>
                <p className="text-sm text-muted-foreground">{publicAdmins[0].doctorProfile?.languages || "Not specified"}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/questionnaire">
                  <button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-6 py-3 text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 flex items-center gap-2">
                    Start Assessment
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </Link>

                <Link to={`/therapist/${publicAdmins[0].name}`}>
                  <button
                    className="rounded-full bg-primary/10 text-primary hover:bg-primary/20 h-12 px-6 py-3 text-sm font-medium shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 flex items-center gap-2"
                  >
                    View Full Profile
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <p>No featured therapist available.</p>
          </div>
        )}
      </div>
    </section>
  );
};