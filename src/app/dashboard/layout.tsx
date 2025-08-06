"use client";

import { Suspense, use, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut, useSession } from "next-auth/react";
import { 
  LayoutDashboard, 
  FileText, 
  Clock,
  Wallet,
  BarChart2, 
  Settings, 
  Menu, 
  X,
  Bell,
  Search,
  ChevronDown,
  Users,
  Ship,
  UserIcon,
  LogOut
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Loading from "../loading";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { usePathname } from "next/navigation";

const sidebarItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
  { icon: FileText, label: "Generate Bill", href: "/dashboard/new-bill" },
  { icon: Clock, label: "Manage Bills", href: "/dashboard/bills" },
  { icon: Wallet, label: "Payment History", href: "/dashboard/payments" },
  { icon: Users, label: "Customers", href: "/dashboard/customers" },
  { icon: BarChart2, label: "Analytics", href: "/dashboard/analytics" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings/company" }
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session,status } = useSession();

  useEffect(() => {
    if (status === "loading") return; // wait for session to be fetched

    if (!session?.user?.email) {
      toast.error("You are not logged in");
      router.push("/auth/login");
    }
  }, [session, status, router]);

  
  const handleMenu = ()=>{
    if(isSidebarOpen){
      setIsMobileMenuOpen(false);
      setIsSidebarOpen(false);
    }
    else{
      setIsMobileMenuOpen(true);
      setIsSidebarOpen(true);
    }
    // setIsMobileMenuOpen(!isMobileMenuOpen);
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen transition-transform bg-white border-r border-gray-200",
          isSidebarOpen ? "w-64" : "w-20",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <Ship className="w-8 h-8 text-blue-600" />
            {isSidebarOpen && (
              <span className="text-xl font-semibold text-gray-800">Bill D. Invoice</span>
            )}
          </Link>
          <button
            onClick={handleMenu}
            className="md:block p-2 rounded-lg hover:bg-gray-100"
          >
            <Menu className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <nav className="flex flex-col h-[calc(100vh-4rem)] p-4 overflow-y-auto">
          <div className="space-y-2">
            {sidebarItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={
                  `flex items-center px-3 py-2 rounded-lg transition-colors
                  hover:bg-blue-50 hover:text-blue-600
                  text-gray-700 group ${
                    pathname === item.href
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700"}`
                }
              >
                <item.icon className="w-5 h-5" />
                {isSidebarOpen && (
                  <span className="ml-3 text-sm font-medium">{item.label}</span>
                )}
              </Link>
            ))}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          "transition-all duration-300",
          isSidebarOpen ? "md:ml-64" : "md:ml-20"
        )}
      >
        {/* Top Navigation */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <button
              onClick={handleMenu}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-gray-500" />
              ) : (
                <Menu className="w-5 h-5 text-gray-500" />
              )}
            </button>

            <div className="flex-1 max-w-lg ml-4 md:ml-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bills, customers..."
                  className="w-full pl-10 pr-4 py-2 text-sm text-gray-900 placeholder-gray-500 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
                          
              <div className="flex items-center">
                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                    <img className="w-8 h-8 rounded-full" src="https://th.bing.com/th/id/OIP.zfWdtdVt1YxSed0SoRlPPwAAAA?rs=1&pid=ImgDetMain" alt="" />
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700">
                    {session?.user?.name}
                    </span>
                    <ChevronDown className="hidden md:block w-4 h-4 text-gray-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/dashboard/settings/user")}>
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/dashboard/settings/company")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <Suspense fallback={<Loading/>}>
          {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}