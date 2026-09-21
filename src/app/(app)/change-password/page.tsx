"use client";

import { useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Check } from "lucide-react";

export default function ChangePasswordPage() {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [saved, setSaved] = useState(false);
  const valid = form.current && form.next.length >= 8 && form.next === form.confirm;

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setSaved(false);
    setForm((f) => ({ ...f, [k]: e.target.value }));
  };

  return (
    <>
      <PageHeader
        title="Change Password"
        description="Update the password you use to sign in."
      />
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="size-4" />
            Security
          </CardTitle>
          <CardDescription>Your new password must be at least 8 characters.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="cur">Current Password</Label>
            <Input id="cur" type="password" value={form.current} onChange={set("current")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="new">New Password</Label>
            <Input id="new" type="password" value={form.next} onChange={set("next")} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm">Confirm New Password</Label>
            <Input id="confirm" type="password" value={form.confirm} onChange={set("confirm")} />
          </div>
          <div className="flex items-center gap-3 pt-1">
            <Button
              disabled={!valid}
              onClick={() => setSaved(true)}
            >
              Update Password
            </Button>
            {saved && (
              <span className="flex items-center gap-1 text-sm text-emerald-600 dark:text-emerald-400">
                <Check className="size-4" />
                Password updated
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
