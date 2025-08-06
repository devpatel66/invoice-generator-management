"use client";
import { Ship } from "lucide-react"
import { LoginForm } from "@/app/components/login-form"
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user?.email) {
      router.push("/");
    }
  }, [session, router]);

  return (
    <div className="flex flex-col items-center min-h-screen justify-center gap-6 h-full bg-gray-100 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Ship className="size-4" />
          </div>
          Bill D. Invoice
        </a>
        <LoginForm />
      </div>
    </div>
  );
}
