"use client";

import { motion } from "framer-motion";
import { Moon, Home, Info, Heart, Flag, Flame, Sparkles } from "lucide-react";

export type TabId = "home" | "about" | "compatibility" | "redflags" | "kinktest" | "soulmates";

interface NavBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function NavBar({ activeTab, onTabChange }: NavBarProps) {
  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: "home", label: "Home", icon: Home },
    { id: "about", label: "About", icon: Info },
    { id: "redflags", label: "The Full Read", icon: Flag },
    { id: "soulmates", label: "Soulmates", icon: Sparkles },
    { id: "kinktest", label: "Kink", icon: Flame },
    { id: "compatibility", label: "Compatibility", icon: Heart },
  ];

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-[#0f0a2e]/60 border-b border-white/10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <button
            onClick={() => onTabChange("home")}
            className="flex items-center gap-2 group"
          >
            <motion.div
              whileHover={{ rotate: 15 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Moon className="h-5 w-5 text-amber-300" />
            </motion.div>
            <span className="text-xs uppercase tracking-[0.3em] text-amber-200/70 group-hover:text-amber-200 transition-colors hidden sm:inline">
              Celestial
            </span>
          </button>

          {/* Tabs */}
          <div className="flex items-center gap-1">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`relative px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors rounded-lg ${
                    isActive ? "text-white bg-white/5" : "text-white/50 hover:text-white/80 hover:bg-white/[0.03]"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <Icon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute inset-x-2 -bottom-px h-0.5 bg-gradient-to-r from-amber-300 to-fuchsia-400 rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
