"use client";
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useTransition } from "react";
import auth from "@/services/auth";
import  {toast} from 'react-toastify';
import { useRouter } from "next/navigation";

export function RegsiterForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [nameError, setNameError] = useState<string>("")
  const [emailError, setEmailError] = useState<string>("")
  const [passwordError, setPasswordError] = useState<string>("")
  const [confirmPasswordError, setConfirmPasswordError] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm-password") as string;
    const name = formData.get("name") as string;
    if (!name) {
      setNameError("Name is required");
    }
    if (!email) {
      setEmailError("Email is required");
    }
    if (!password) {
      setPasswordError("Password is required");
    }
    if (!confirmPassword) {
      setConfirmPasswordError("Confirm Password is required");
    }
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
    }

    if(!name || !email || !password || !confirmPassword) {
      return;
    }

    startTransition(async () => {
      try {
        const response = await auth.signup({ name, email, password, confirmPassword });
        console.log(response);
        if (response.status === 200) {
          toast.success("User created successfully");
          router.push("/auth/login");
        }
        else if (response.title === "email"){
          setEmailError(response.message);
        }
        else if (response.title === "password"){
          setPasswordError(response.message);
        }
        else if (response.title === "name"){
          setNameError(response.message);
        }
        else if (response.status === 400) {
          toast.error(response.message);
        }
        else {
          toast.error(response.message);
        }
      } catch (error) {
        console.log(error);
        toast.error("Something went wrong");
      }
    })
  }
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Join Our Crew</CardTitle>
          <CardDescription>
            Signup with your Google account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <Button variant="outline" className="w-full">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Signup with Google
                </Button>
              </div>
              <div className="relative text-center text-sm">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Money D. Luffy"
                    name="name"
                    required
                  />
                  {nameError && <p className="text-red-500">{nameError}</p>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    name="email"
                  />
                  {emailError && <p className="text-red-500">{emailError}</p>}
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input id="password" type="password" name="password" required />
                  {passwordError && <p className="text-red-500">{passwordError}</p>}
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                  </div>
                  <Input id="confirm-password" type="password" required name="confirm-password" />
                  {confirmPasswordError && <p className="text-red-500">{confirmPasswordError}</p>}
                </div>
                <Button disabled={isPending} type="submit" className="w-full">
                  {isPending ? "Loading..." : "Start Your Journey"}
                </Button>
              </div>
              <div className="text-center text-sm">
                <a href="/auth/login" className="underline underline-offset-4">
                Already a crew member? Return to port
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary  ">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
