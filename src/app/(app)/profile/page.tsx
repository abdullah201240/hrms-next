"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/status-badge";
import { PageHeader } from "@/components/shared/page-header";
import { currentUser, fmtDate } from "@/lib/mock/data";
import { toast } from "sonner";
import { Save } from "lucide-react";

export default function ProfilePage() {
  const emp = currentUser;
  const initials = emp.name.split("").map((s) => s[0]).slice(0, 2).join("");
  const [form, setForm] = useState({
    name: emp.name,
    email: emp.email,
    phone: emp.phone,
    location: emp.workLocation,
    bio: "HR leader focused on people operations, culture and compliance.",
  });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((p) => ({ ...p, [k]: e.target.value }));

  const save = () => toast.success("Profile updated");

  return (
    <>
      <PageHeader title="My Profile" description="Manage your personal information and preferences." />

      <Card>
        <CardContent className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
          <Avatar className="size-16">
            <AvatarFallback className="text-xl font-semibold text-white" style={{ backgroundColor: emp.avatarColor }}>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">{emp.name}</h2>
              <StatusBadge status={emp.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {emp.designation} · {emp.department} · {emp.employeeId}
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="personal">
        <TabsList className="w-full justify-start bg-transparent p-0">
          <TabsTrigger value="personal" className="data-[state= data-[state= data-[state=active]:shadow-none">Personal</TabsTrigger>
          <TabsTrigger value="employment" className="data-[state= data-[state= data-[state=active]:shadow-none">Employment</TabsTrigger>
          <TabsTrigger value="password" className="data-[state= data-[state= data-[state=active]:shadow-none">Password</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Personal Information</CardTitle>
              <CardDescription>This is how your details appear across the portal.</CardDescription>
            </CardHeader>
            <CardContent className="max-w-2xl">
              <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); save(); }}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={form.name} onChange={set("name")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={form.email} onChange={set("email")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={form.phone} onChange={set("phone")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Work Location</Label>
                    <Input id="location" value={form.location} onChange={set("location")} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" rows={3} value={form.bio} onChange={set("bio")} />
                </div>
                <div className="flex justify-end">
                  <Button type="submit"><Save /> Save Changes</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employment">
          <Card>
            <CardHeader><CardTitle className="text-base">Employment Details</CardTitle></CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-3">
                {[
                  ["Employee ID", emp.employeeId],
                  ["Department", emp.department],
                  ["Designation", emp.designation],
                  ["Reports To", emp.reportsTo],
                  ["Date of Joining", fmtDate(emp.joinDate)],
                  ["Work Location", emp.workLocation],
                ].map(([label, value]) => (
                  <div key={label} className="space-y-0.5">
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
                    <dd className="text-sm font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
              <Separator className="my-5" />
              <p className="text-xs text-muted-foreground">Employment records are managed by HR and cannot be edited here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="password">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Change Password</CardTitle>
              <CardDescription>Use a strong, unique password.</CardDescription>
            </CardHeader>
            <CardContent className="max-w-md">
              <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); toast.success("Password changed"); }}>
                <div className="space-y-2">
                  <Label htmlFor="current">Current Password</Label>
                  <Input id="current" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new">New Password</Label>
                  <Input id="new" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm New Password</Label>
                  <Input id="confirm" type="password" />
                </div>
                <div className="flex justify-end">
                  <Button type="submit">Update Password</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
