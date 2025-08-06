import { RegsiterForm } from "@/app/components/register-form"
import { Ship } from "lucide-react"
export default function LoginPage() {
  return (
    <div className="flex  flex-col items-center justify-center gap-6 min-h-screen bg-gray-200 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Ship className="size-4" />
          </div>
          Bill D. Invoice
        </a>
        <RegsiterForm />
      </div>
    </div>
  )
}
