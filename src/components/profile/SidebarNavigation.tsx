import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Menu, ChevronRight, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface Section {
  id: string;
  label: string;
  sub: string;
  icon: any;
  color: string;
  isAction?: boolean;
}

interface SidebarNavigationProps {
  sections: Section[];
  selectedSection: string;
  setSelectedSection: (section: string) => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export function SidebarNavigation({
  sections,
  selectedSection,
  setSelectedSection,
  isMobileMenuOpen,
  setIsMobileMenuOpen
}: SidebarNavigationProps) {
  const navigate = useNavigate();

  return (
    <>
      {/* Desktop Sidebar Nav */}
      <div className="hidden lg:block lg:sticky lg:top-24 space-y-6">
        <Card className="p-2 rounded-2xl border-slate-200 shadow-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
          <div className="space-y-1">
            {sections.map((item) => {
              const isAction = item.id === "bookSession";

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    if (isAction) navigate("/schedule");
                    else setSelectedSection(item.id);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl transition-all duration-300
        ${selectedSection === item.id
                      ? "bg-primary/10"
                      : "hover:bg-primary/10"
                    }
      `}
                >
                  <div className="flex items-center gap-4">
                    {/* Left normal content */}
                    <div
                      className={`p-2 rounded-lg ${selectedSection === item.id
                          ? "bg-white shadow-sm"
                          : "bg-primary/5"
                        }`}
                    >
                      <item.icon className={`h-5 w-5 ${item.color}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm text-slate-700">
                        {item.label}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {item.sub}
                      </p>
                    </div>

                    {/* 👉 RIGHT SIDE CTA ONLY */}
                    {isAction && (
                      <div className="flex items-center gap-1 px-2.5 py-1 rounded-full
            bg-primary text-white text-[10px] font-black uppercase
            group-hover:bg-primary group-hover:text-white transition-all">
                        Book
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}

          </div>
        </Card>
      </div>

      {/* Mobile Tab Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 p-2">
        <div className="flex justify-around">
          {sections.filter(s => s.id !== "bookSession").map((section) => {
            const isSelected = selectedSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setSelectedSection(section.id)}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 ${isSelected
                    ? "bg-primary text-primary"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
              >
                <section.icon
                  className={`h-5 w-5 ${isSelected ? "text-white" : "text-primary"
                    }`}
                />

                {/* <span className={`text-[10px] text-center ${
                  isSelected ? "font-bold" : "font-medium"
                }`}>
                  {section.label}
                </span> */}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile Book Session Button */}
      <div className="lg:hidden mb-2">
        <Button
          onClick={() => navigate("/schedule")}
          className="w-full py-5 rounded-xl bg-white text-primary font-black text-base shadow-lg"
        >
          Book Session Now
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}