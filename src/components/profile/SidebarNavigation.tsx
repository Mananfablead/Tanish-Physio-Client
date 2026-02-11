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
        ${
          selectedSection === item.id
            ? "bg-primary/10"
            : "hover:bg-primary/10"
        }
      `}
    >
      <div className="flex items-center gap-4">
        {/* Left normal content */}
        <div
          className={`p-2 rounded-lg ${
            selectedSection === item.id
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

      {/* Mobile Navigation Trigger */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-primary transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Menu className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">
                Current Section
              </p>
              <p className="text-lg font-black text-slate-900 leading-none">
                {sections.find((s) => s.id === selectedSection)?.label ||
                  "Menu"}
              </p>
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
            <ChevronRight className="h-5 w-5" />
          </div>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[32px] shadow-2xl p-6 transition-transform transform animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Profile Sections
                </h3>
                <p className="text-slate-500 font-medium text-xs uppercase tracking-widest mt-1">
                  Navigate your profile
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl bg-slate-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-3 pb-8">
           {sections.map((section) => {
  const isAction = section.id === "bookSession";
  const isSelected =
    selectedSection === section.id && !isAction;

  return (
    <button
      key={section.id}
      onClick={() => {
        if (isAction) navigate("/schedule");
        else setSelectedSection(section.id);
        setIsMobileMenuOpen(false);
      }}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all
        ${
          isSelected
            ? "bg-primary/10 border-primary/20"
            : "bg-slate-50 border-slate-100 hover:bg-white"
        }
      `}
    >
      {/* Left icon */}
      <div
        className={`p-2.5 rounded-xl ${
          isSelected ? "bg-white shadow-sm" : "bg-white/60"
        }`}
      >
        <section.icon className={`h-5 w-5 ${section.color}`} />
      </div>

      {/* Center text */}
      <div className="text-left flex-1">
        <p
          className={`font-black text-sm ${
            isSelected ? "text-primary" : "text-slate-700"
          }`}
        >
          {section.label}
        </p>
        <p className="text-[11px] text-slate-500 line-clamp-1">
          {section.sub}
        </p>
      </div>

      {/* 👉 MOBILE CTA */}
      {isAction && (
        <div className="flex items-center gap-1 px-3 py-1.5
          rounded-full bg-primary text-white text-[11px] font-black shadow-md">
          Book
          <ChevronRight className="h-4 w-4" />
        </div>
      )}

      {/* Selected dot only for normal sections */}
      {isSelected && !isAction && (
        <div className="h-2 w-2 rounded-full bg-primary" />
      )}
    </button>
  );
})}

            </div>
          </div>
        </div>
      )}
    </>
  );
}