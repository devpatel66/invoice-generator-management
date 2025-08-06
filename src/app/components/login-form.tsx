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
import auth from "@/services/auth"
import Link from "next/link";
import { useState, useTransition } from "react";
import {toast} from 'react-toastify';
import { useRouter } from "next/navigation";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [emailError, setEmailError] = useState<string>("")
  const [passwordError, setPasswordError] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter();
  const handleLogin =  (e: React.FormEvent<HTMLFormElement>) => {
    startTransition(async () => {
      e.preventDefault();
      e.stopPropagation();
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      console.log(email, password);
      if (!email) {
        setEmailError("Email is required");

      }
      if (!password) {
        setPasswordError("Password is required");

      }
      if (!email || !password) {
        return;
      }
      setEmailError("");
      setPasswordError("");
      setError("");
      const response = await auth.login({ email, password });
      if (response.status === 200) {
        console.log(response);
        toast.success("Login successful");
        router.push("/dashboard");
      }
      else if (response.status === 401) {
        setError("Invalid email or password");
      }
      else {
        toast.error("Something went wrong");
      }
    })
  };
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome Back, Sailor!</CardTitle>
          {/* <CardDescription>
            Login with your Google account
          </CardDescription> */}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                {
                  error && (
                    <p className="text-red-500 text-center">{error}</p>
                  )
                }
                <Button variant="outline" className="w-full" type="submit">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Login with Google
                </Button>
              </div>
              <div className="relative text-center text-sm">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
              <div className="grid gap-6">
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
                    <Link
                      href="/auth/forgot-password"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
                  <Input id="password" type="password" required name="password" />
                  {passwordError && <p className="text-red-500">{passwordError}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending ? "Logging in..." : "Set Sail!"}
                </Button>
              </div>
              <div className="text-center text-sm">
                <Link href={"/auth/register"} className="underline underline-offset-4">
                  New to the crew? Join the adventure
                </Link>
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
