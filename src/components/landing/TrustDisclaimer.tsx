import { ShieldCheck, Lock, AlertCircle } from "lucide-react";

export const TrustDisclaimer = () => {
  return (
    <section className="py-12 border-t border-border">
      <div className="container">
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {/* Privacy */}
          <div className="flex gap-4">
            <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="h-5 w-5 text-success" />
            </div>
            <div>
              <h3 className="font-bold text-base mb-1">Patient Privacy</h3>
              <p className="text-sm text-muted-foreground">
                Your personal and medical information is handled with strict
                confidentiality and professional care.
              </p>
            </div>
          </div>

          {/* Security */}
          <div className="flex gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-base mb-1">Secure Communication</h3>
              <p className="text-sm text-muted-foreground">
                All consultations and communications are conducted through
                secure and protected channels.
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="flex gap-4">
            <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <h3 className="font-bold text-base mb-1">Medical Disclaimer</h3>
              <p className="text-sm text-muted-foreground">
                Online consultations are not a substitute for emergency medical
                care. In urgent situations, please contact local emergency
                services immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
