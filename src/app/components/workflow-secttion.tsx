const steps = [
    { icon: "⚓", title: "Drop Anchor", description: "Sign up & set up your business details." },
    { icon: "📝", title: "Craft Your Scrolls", description: "Create invoices with ease." },
    { icon: "🏴‍☠", title: "Send It Across the Grand Line", description: "Send invoices via email or share a link." },
    { icon: "💰", title: "Claim Your Treasure", description: "Track payments & manage finances." },
  ]
  
  export default function WorkflowSection() {
    return (
      <section className="bg-parchment py-16">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Set Sail on Your Billing Journey</h2>
          <div className="flex flex-col md:flex-row justify-between items-center">
            {steps.map((step, index) => (
              <div key={step.title} className="flex flex-col items-center mb-8 md:mb-0">
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
    )
  }
  
  