import { ShieldCheck, Lock, AlertCircle } from "lucide-react";

export const TrustDisclaimer = () => {
  return (
    <section className="py-12 border-t border-border">
      <div className="container">
        <div className="grid md:grid-cols-3 gap-8 items-start">
          <div className="flex gap-4">
            <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="h-5 w-5 text-success" />
            </div>
            <div>
              <h5 className="font-bold text-sm mb-1">Data Privacy</h5>
              <p className="text-xs text-muted-foreground">We follow industry-standard healthcare data security and privacy practices.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h5 className="font-bold text-sm mb-1">Secure Encryption</h5>
              <p className="text-xs text-muted-foreground">End-to-end encryption for all video calls and messaging.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <h5 className="font-bold text-sm mb-1">Medical Disclaimer</h5>
              <p className="text-xs text-muted-foreground">Not a replacement for emergency care. If in crisis, call local emergency services.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};