import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2 } from "lucide-react";
import { company } from "@/lib/mock/data";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <div className="flex items-center gap-2 font-semibold">
          <Building2 className="size-6" />
          <span>{company.name}</span>
        </div>
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold leading-tight">Human Resource Management</h2>
          <p className="max-w-sm text-sm text-primary-foreground/80">
            Attendance, leave, payroll, expenses, recruitment and performance — one flat, fast
            workspace for your whole people operations.
          </p>
        </div>
        <p className="text-xs text-primary-foreground/70">© {new Date().getFullYear()} {company.name}</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6">
        <Card className="w-full max-w-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl">Sign in</CardTitle>
            <CardDescription>Enter your work credentials to access the HR portal.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" action="/dashboard">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@company.com" autoComplete="email" required />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="#" className="text-xs text-muted-foreground underline-offset-4 hover:underline">
                    Forgot?
                  </Link>
                </div>
                <Input id="password" type="password" autoComplete="current-password" required />
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm font-normal">
                  Remember me for 30 days
                </Label>
              </div>
              <Button type="submit" className="w-full">
                Sign in
              </Button>
            </form>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              Demo UI — authentication is wired in the next phase.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
