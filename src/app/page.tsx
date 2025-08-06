"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Anchor, Scroll, Ship, Coins, Users, Settings, PlusCircle, BarChart3, Compass,CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import Header from "./components/header";
import Footer from "./components/footer";
const steps = [
  { icon: "⚓", title: "Drop Anchor", description: "Sign up & set up your business details." },
  { icon: "📝", title: "Craft Your Scrolls", description: "Create invoices with ease." },
  { icon: "🏴‍☠", title: "Send It Across the Grand Line", description: "Send invoices via email or share a link." },
  { icon: "💰", title: "Claim Your Treasure", description: "Track payments & manage finances." },
]

export

const navItems = [
  { icon: <Compass className="w-5 h-5" />, label: "Dashboard", href: "#" },
  { icon: <PlusCircle className="w-5 h-5" />, label: "Create Invoice", href: "#" },
  { icon: <Scroll className="w-5 h-5" />, label: "Manage Bills", href: "#" },
  { icon: <BarChart3 className="w-5 h-5" />, label: "Treasure Chest", href: "#" },
  { icon: <Users className="w-5 h-5" />, label: "Crew", href: "#" },
  { icon: <Settings className="w-5 h-5" />, label: "Settings", href: "#" }
];

const pricingPlans = [
  {
    name: "Deckhand",
    price: "Free",
    description: "Perfect for solo adventurers starting their journey",
    features: [
      "5 invoices per month",
      "Basic invoice templates",
      "Email support",
      "Export to PDF",
      "Single user account"
    ]
  },
  {
    name: "First Mate",
    price: "$12",
    description: "For growing crews ready to conquer the seas",
    features: [
      "Unlimited invoices",
      "Custom invoice templates",
      "Priority support",
      "Advanced analytics",
      "Up to 5 team members",
      "Client portal access",
      "Automated reminders"
    ]
  },
  {
    name: "Captain",
    price: "$29",
    description: "Full control of your billing empire",
    features: [
      "Everything in First Mate",
      "Unlimited team members",
      "Custom branding",
      "API access",
      "Advanced integrations",
      "Dedicated support",
      "Custom domain",
      "Audit logs"
    ]
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 via-blue-900 to-blue-950">
      <Header/>
      {/* Hero Section */}
      <div className="relative py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl font-bold tracking-tight text-amber-100 sm:text-6xl">
                Set Sail for Smooth Billing!
              </h1>
              <p className="mt-6 text-lg leading-8 text-amber-200/90">
                Navigate the seas of finance with the most adventurous billing system ever created.
                Join our crew and conquer your invoicing challenges!
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button
                  size="lg"
                  className="bg-amber-500 hover:bg-amber-600 text-blue-950 font-semibold px-8 py-6 text-lg"
                >
                  Begin Your Adventure
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Workflow Section */}
      <section className="bg-pirate-parchment py-16">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8">Set Sail on Your Billing Journey</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:space-x-2 lg:grid-cols-3 xl:grid-cols-4 justify-between">
          {steps.map((step, index) => (
            <div key={step.title} className="flex flex-col bg-pirate-ropeBeige items-center mb-8 md:mb-0">
              <div className="bg-aged-paper rounded-lg p-6 text-center w-64 h-64 flex flex-col justify-center items-center">
                <span className="text-4xl mb-4">{step.icon}</span>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p>{step.description}</p>
              </div>
              {index < steps.length - 1 && <div className="hidden md:block w-16 h-1 bg-dotted-line my-4"></div>}
            </div>
          ))}
        </div>
      </div>
    </section>  

      {/* Dashboard Preview */}
      {/* <div className="py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-amber-100 sm:text-4xl">
              Your Bounty Chest
            </h2>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-parchment border-amber-600/20">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-black">Recent Bounties</h3>
                <div className="mt-4 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-pirate-oceanBlue rounded-lg">
                      <div>
                        <p className="text-sm text-amber-200/80">Invoice #{i}</p>
                        <p className="text-amber-100 font-medium">$1,{i}00.00</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        i === 1 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {i === 1 ? 'Captured' : 'Wanted'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="bg-parchment backdrop-blur-lg border-amber-600/20">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-black">Quick Actions</h3>
                <div className="mt-4 space-y-4">
                  <Button className="w-full bg-pirate-chestBrown text-pirate-parchment hover:bg-pirate-oceanBlue  font-semibold">
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create New Invoice
                  </Button>
                  <Button className="w-full bg-pirate-oceanBlue text-pirate-parchment hover:bg-pirate-chestBrown  font-semibold">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Reports
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="bg-parchment backdrop-blur-lg border-amber-600/20">
              <div className="p-6">
                <h3 className="text-xl font-semibold text-black">Treasure Stats</h3>
                <div className="mt-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-pirate-oceanBlue">Total Revenue</span>
                    <span className="text-pirate-oceanBlue font-medium">$15,234</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-pirate-oceanBlue">Pending</span>
                    <span className="text-pirate-bountyRed font-medium">$3,456</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-pirate-oceanBlue">Completed</span>
                    <span className="text-pirate-emeraldGreen font-medium">$11,778</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div> */}


       {/* Pricing Section */}
       <div className="py-24 relative bg-parchment">
        {/* <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1562155847-c05f7386b204')] bg-cover bg-center opacity-10"></div> */}
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-pirate-pirateGold sm:text-4xl">
              Choose Your Pirate Crew
            </h2>
            <p className="mt-6 text-lg leading-8 text-pirate-parchment">
              Select the perfect plan for your adventure. Upgrade or downgrade anytime as your crew grows.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-8 justify-items-stretch  lg:max-w-none lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <Card key={plan.name} className={` bg-pirate-oceanBlue backdrop-blur-lg border-amber-600/20 overflow-hidden ${
                plan.name === "First Mate" ? "ring-2 ring-amber-500" : ""
              }`}>
                <div className="p-8 h-full flex flex-col">
                  <h3 className="text-xl font-bold text-amber-100">{plan.name}</h3>
                  <div className="mt-4 flex items-baseline text-amber-100">
                    <span className="text-4xl font-bold tracking-tight">{plan.price}</span>
                    {plan.price !== "Free" && (
                      <span className="text-amber-200/70 ml-1">/month</span>
                    )}
                  </div>
                  <p className="mt-6 text-sm text-amber-200/90">{plan.description}</p>

                  <ul className="mt-8 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center text-amber-200/80">
                        <CheckCircle2 className="h-5 w-5 text-amber-500 mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="flex-grow"></div>
                  <Button className={`mt-8 w-full  ${
                    plan.name === "First Mate"
                      ? "bg-amber-500 hover:bg-amber-600 text-blue-950"
                      : "bg-blue-800 hover:bg-blue-700 text-amber-100"
                  }`}>
                    Join the Crew
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-12 text-center">
            <p className="text-amber-200/70 text-sm">
              All plans include our standard 14-day free trial. No credit card required.
            </p>
          </div>
        </div>
      </div>

            {/* Footer */}
            <Footer/>
    </div>
  );
}