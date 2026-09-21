"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/page-header";
import { company } from "@/lib/mock/data";
import { toast } from "sonner";
import { Save } from "lucide-react";

function Setting({ label, description, checked, onChange }: { label: string; description: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

export default function SettingsPage() {
  const [org, setOrg] = useState({
    name: company.name,
    email: company.email,
    phone: company.phone,
    address: company.address,
    currency: company.currency,
    timezone: company.timezone,
  });
  const [prefs, setPrefs] = useState<{ email?: boolean; wfh?: boolean; autoLeave?: boolean }>({});
  const [holidays, setHolidays] = useState(true);
  const [twoFa, setTwoFa] = useState(false);

  const set = (k: keyof typeof org) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setOrg((p) => ({ ...p, [k]: e.target.value }));

  const save = () => toast.success("Settings saved");

  return (
    <>
      <PageHeader title="Settings" description="Configure your organisation and portal preferences." />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Organisation</CardTitle>
            <CardDescription>Company profile shown across the HR portal.</CardDescription>
          </CardHeader>
          <CardContent className="max-w-2xl space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="org-name">Company Name</Label>
                <Input id="org-name" value={org.name} onChange={set("name")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-email">HR Email</Label>
                <Input id="org-email" type="email" value={org.email} onChange={set("email")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-phone">Phone</Label>
                <Input id="org-phone" value={org.phone} onChange={set("phone")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-currency">Currency</Label>
                <Select value={org.currency} onValueChange={(v) => setOrg((p) => ({ ...p, currency: v ?? p.currency }))}>
                  <SelectTrigger id="org-currency" className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["USD", "EUR", "GBP", "INR", "BDT"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-address">Address</Label>
              <Input id="org-address" value={org.address} onChange={set("address")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-timezone">Timezone</Label>
              <Input id="org-timezone" value={org.timezone} onChange={set("timezone")} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preferences</CardTitle>
            <CardDescription>Automation and notification behaviour.</CardDescription>
          </CardHeader>
          <CardContent className="max-w-2xl">
            <Setting label="Email notifications" description="Send email for leave, payroll and approvals." checked={prefs.email ?? true} onChange={(v) => setPrefs((p) => ({ ...p, email: v }))} />
            <Setting label="Work from home" description="Allow employees to log remote attendance." checked={prefs.wfh ?? false} onChange={(v) => setPrefs((p) => ({ ...p, wfh: v }))} />
            <Setting label="Auto-approve leaves" description="Automatically approve casual leave under 2 days." checked={prefs.autoLeave ?? false} onChange={(v) => setPrefs((p) => ({ ...p, autoLeave: v }))} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Security</CardTitle>
            <CardDescription>Access and authentication controls.</CardDescription>
          </CardHeader>
          <CardContent className="max-w-2xl">
            <div className="flex items-center justify-between gap-4 py-3">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Holiday list</p>
                <p className="text-sm text-muted-foreground">Show public holidays on employee calendars.</p>
              </div>
              <Switch checked={holidays} onCheckedChange={setHolidays} />
            </div>
            <div className="flex items-center justify-between gap-4 py-3">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Two-factor authentication</p>
                <p className="text-sm text-muted-foreground">Require 2FA for all admin and HR accounts.</p>
              </div>
              <Switch checked={twoFa} onCheckedChange={setTwoFa} />
            </div>
          </CardContent>
        </Card>

        <Separator />

        <div className="flex justify-end">
          <Button onClick={save}><Save /> Save Settings</Button>
        </div>
      </div>
    </>
  );
}
