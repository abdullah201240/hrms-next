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
import { SearchSelect } from "@/components/shared/search-select";
import { PageHeader } from "@/components/shared/page-header";
import { company } from "@/lib/mock/data";
import { shiftTypes, holidayLists, workingHoursSettings } from "@/lib/mock/data-2";
import { toast } from "sonner";
import { Save } from "lucide-react";
import Link from "next/link";

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
  const [wh, setWh] = useState(workingHoursSettings);

  const set = (k: keyof typeof org) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setOrg((p) => ({ ...p, [k]: e.target.value }));

  const save = () => toast.success("Settings saved");

  return (
    <>
      <PageHeader title="Settings" description="Configure your organisation and portal preferences." />

      <div className="space-y-6">
        <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800/80 dark:bg-[#121826] dark:shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)]">
          <CardHeader>
            <CardTitle className="text-base">Organisation</CardTitle>
            <CardDescription>Company profile shown across the HR portal.</CardDescription>
          </CardHeader>
          <CardContent className="max-w-2xl space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="org-name" className="text-xs font-semibold">Company Name</Label>
                <Input id="org-name" value={org.name} onChange={set("name")} className="rounded-lg" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-email" className="text-xs font-semibold">HR Email</Label>
                <Input id="org-email" type="email" value={org.email} onChange={set("email")} className="rounded-lg" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-phone" className="text-xs font-semibold">Phone</Label>
                <Input id="org-phone" value={org.phone} onChange={set("phone")} className="rounded-lg" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="org-currency" className="text-xs font-semibold">Currency</Label>
                <SearchSelect
                  id="org-currency"
                  value={org.currency}
                  onChange={(val) => setOrg((p) => ({ ...p, currency: val }))}
                  options={["BDT"]}
                  addLabel="Currency"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-address" className="text-xs font-semibold">Address</Label>
              <Input id="org-address" value={org.address} onChange={set("address")} className="rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org-timezone" className="text-xs font-semibold">Timezone</Label>
              <Input id="org-timezone" value={org.timezone} onChange={set("timezone")} className="rounded-lg" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800/80 dark:bg-[#121826] dark:shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)]">
          <CardHeader>
            <CardTitle className="text-base">Working Hours &amp; Holidays</CardTitle>
            <CardDescription>
              HR Settings — the office window and the fallback holiday list. Weekly offs and public
              holidays are managed on the{" "}
              <Link href="/leave/holidays" className="font-medium text-primary hover:underline">Holidays</Link>{" "}
              page.
            </CardDescription>
          </CardHeader>
          <CardContent className="max-w-2xl space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="wh-shift" className="text-xs font-semibold">Default Shift</Label>
                <SearchSelect
                  id="wh-shift"
                  value={wh.defaultShift}
                  onChange={(val) => setWh((p) => ({ ...p, defaultShift: val }))}
                  options={shiftTypes.map((s) => s.name)}
                  addLabel="Shift Type"
                />
                <p className="text-xs text-muted-foreground">
                  Start &amp; end time come from this{" "}
                  <Link href="/attendance/shift-types" className="text-primary hover:underline">Shift Type</Link>.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="wh-hours" className="text-xs font-semibold">Standard Working Hours (per day)</Label>
                <Input
                  id="wh-hours"
                  type="number"
                  min={0}
                  step="0.5"
                  value={wh.standardWorkingHours}
                  onChange={(e) => setWh((p) => ({ ...p, standardWorkingHours: Number(e.target.value) }))}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wh-hl" className="text-xs font-semibold">Default Holiday List</Label>
                <SearchSelect
                  id="wh-hl"
                  value={wh.defaultHolidayList}
                  onChange={(val) => setWh((p) => ({ ...p, defaultHolidayList: val }))}
                  options={holidayLists.map((h) => h.name)}
                  addLabel="Holiday List"
                />
                <p className="text-xs text-muted-foreground">
                  Used when no{" "}
                  <Link href="/leave/holiday-list-assignment" className="text-primary hover:underline">Holiday List Assignment</Link>{" "}
                  covers the employee.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="wh-remind" className="text-xs font-semibold">Remind Before Holiday (hh:mm)</Label>
                <Input
                  id="wh-remind"
                  type="time"
                  value={wh.remindBefore}
                  onChange={(e) => setWh((p) => ({ ...p, remindBefore: e.target.value }))}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="wh-freq" className="text-xs font-semibold">Holiday Reminder Frequency</Label>
                <SearchSelect
                  id="wh-freq"
                  value={wh.holidayReminderFrequency}
                  onChange={(val) =>
                    setWh((p) => ({ ...p, holidayReminderFrequency: val as "Weekly" | "Monthly" }))
                  }
                  options={["Weekly", "Monthly"]}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Setting
                label="Allow multiple shift assignments"
                description="Let an employee hold more than one active shift at a time."
                checked={wh.allowMultipleShiftAssignments}
                onChange={(v) => setWh((p) => ({ ...p, allowMultipleShiftAssignments: v }))}
              />
              <Setting
                label="Send holiday reminders"
                description="Email the upcoming-holiday digest on the chosen frequency."
                checked={wh.sendHolidayReminders}
                onChange={(v) => setWh((p) => ({ ...p, sendHolidayReminders: v }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800/80 dark:bg-[#121826] dark:shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)]">
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

        <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800/80 dark:bg-[#121826] dark:shadow-[0_16px_40px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)]">
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

        <div className="flex justify-end pb-8">
          <Button onClick={save} className="h-10 rounded-xl bg-blue-600 px-5 font-semibold text-white shadow-sm hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500">
            <Save className="size-4" /> Save Settings
          </Button>
        </div>
      </div>
    </>
  );
}
