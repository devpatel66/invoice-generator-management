"use client"
import { Anchor, Scroll, Ship, X,Menu, Users, Settings, PlusCircle, BarChart3, Compass } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
const navItems = [
  { icon: <Compass className="w-5 h-5" />, label: "Dashboard", href: "/dashboard" },
];

export default function Header() {
    const pathName = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    if (pathName === "/auth/login" || pathName === "/auth/register") {
      return null;
    }
  return (
      <nav className="bg-[url('https://wallpapercave.com/wp/wp9995092.jpg')] bg-cover bg-opacity-50 border-b border-amber-600/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center cursor-pointer">
              <Ship className="h-8 w-8 text-[#0A284E]" />
              <Link href="/dashboard" className="ml-2 text-xl font-bold text-[#0A284E]">Bill D. Invoice</Link>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
                {pathName !== "/auth/register" && pathName !== "/auth/login" && navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center px-3 py-2 rounded-md text-sm font-bold text-[#4E4E4E]  hover:bg-[#F8E3A3] hover:rounded-lg transition-colors"
                  >
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </Link>
                ))}
                 <Link
                  href="/auth/login"
                  className="flex items-center px-3 py-2 rounded-md text-sm font-bold text-amber-100 hover:bg-blue-800/50 transition-colors"
                >
                  <Anchor className="w-5 h-5 mr-2" />
                  Login
                </Link>
              </div>
            </div>
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-amber-100 hover:bg-blue-800/50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? (
                  <X className="block h-6 w-6" />
                ) : (
                  <Menu className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

      
      
        {/* Mobile menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="absolute  left-0 z-50 right-0 w-full md:hidden bg-blue-900/95 backdrop-blur-lg border-t border-amber-600/20 shadow-lg"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-center px-3 py-2 rounded-md text-base font-medium text-amber-100 hover:bg-blue-800/50 transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </a>
                ))}
                <Link
                  href="/auth/login"
                  className="flex items-center px-3 py-2 rounded-md text-base font-medium text-amber-100 hover:bg-blue-800/50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Anchor className="w-5 h-5 mr-3" />
                  Login
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>     
  );
}