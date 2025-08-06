"use client";

import { use, useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { User, Mail, Lock, Bell, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowUpSquare } from "lucide-react";
import { useSession,getSession } from "next-auth/react";
import { toast } from "react-toastify";
import auth from "@/services/auth";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  const [passwordChangeError, setPasswordChangeError] = useState(false);
  const { data: session,update } = useSession();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  
  const [userData, setUserData] = useState({
    name: session?.user?.name,
    email: session?.user?.email,
    avatar: session?.user?.image,
    createdAt: session?.user?.createdAt,
  }
  );
  const [editProfileForm, setEditProfileForm] = useState({
    name: userData.name,
    email: userData.email,
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [userError, setUserError] = useState<{ name: string; email: string }>({
    name: "",
    email: "",
  });
  

  const handleProfileSubmit = () => {
    const name = editProfileForm.name;
    const email = editProfileForm.email;
    if (!name || !email) {
      if (!name) {
        setUserError({ ...userError, name: "Name is required" });
        // toast.error("Name is required");
      }
      if (!email) {
        setUserError({ ...userError, email: "Email is required" });
        // toast.error("Email is required");
      }
      return;
    }
    startTransition(async () => {
      const response = await auth.update({
        name,
        email,
      })
      console.log(response);
      
      if (response.status === 200) {
        await update();
        setUserData((prevUserData) => ({
          ...prevUserData,
          name: session?.user.name,
          email : session?.user.email,
        }))
        toast.success("Profile updated successfully");
        setIsEditingProfile(false); 
      }
      else if(response.status === 400 && response.title === "email") {
        toast.error("Email already exists");
      }else{
        toast.error("Something went wrong");
      }
    })
  };

  const handlePasswordSubmit = async () => {
    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordChangeError(true);
      setPasswordChangeSuccess(false);
      return;
    }

    const response  = await auth.changePassword(passwordForm.newPassword);
    console.log(response);
    
    if(response.status === 200) {
      toast.success("Password changed successfully");
    }
    setPasswordChangeSuccess(true);
    setPasswordChangeError(false);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsChangingPassword(false);
  };
  

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Profile Information Tab */}
        <TabsContent value="profile">
          <Card className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-medium">
                <img className="rounded-full" src="https://th.bing.com/th/id/OIP.zfWdtdVt1YxSed0SoRlPPwAAAA?rs=1&pid=ImgDetMain" alt="" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{userData.name}</h2>
                  <p className="text-gray-500">{userData.email}</p>
                </div>
              </div>
              <Button
                onClick={() => {
                  setEditProfileForm({
                    name: session?.user?.name,
                    email: session?.user?.email,
                  });
                  setIsEditingProfile(true);
                }}
              >
                Edit Profile
              </Button>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Account Information</h3>
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Full Name</p>
                        <p className="text-gray-900">{session?.user?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-gray-900">{session?.user?.email}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Account Details</h3>
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-500">Member Since</p>
                        <p className="text-gray-900">{session?.user?.createdAt.toString().slice(0, 10)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Password & Security</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Manage your password and security settings
                </p>
              </div>
              <Button
                onClick={() => {
                  setPasswordForm({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                  setPasswordChangeSuccess(false);
                  setPasswordChangeError(false);
                  setIsChangingPassword(true);
                }}
              >
                <Lock className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">Password</h3>
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-500">Current Password</p>
                    <p className="text-gray-900">••••••••</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditingProfile} onOpenChange={setIsEditingProfile}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile information here
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={editProfileForm.name}
                onChange={(e) =>
                  setEditProfileForm({ ...editProfileForm, name: e.target.value })
                }
              />
              {userError.name && (
                <p className="text-sm text-red-500">{userError.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editProfileForm.email}
                onChange={(e) =>
                  setEditProfileForm({ ...editProfileForm, email: e.target.value })
                }
              />
              {userError.email && (
                <p className="text-sm text-red-500">{userError.email}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingProfile(false)}>
              Cancel
            </Button>
            <Button disabled={isPending} onClick={handleProfileSubmit}>{isPending ? "Saving..." : "Save changes"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isChangingPassword} onOpenChange={setIsChangingPassword}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and a new password
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>
            {passwordChangeError && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="h-4 w-4" />
                Passwords do not match. Please try again.
              </div>
            )}
            {passwordChangeSuccess && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle2 className="h-4 w-4" />
                Password changed successfully.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangingPassword(false)}>
              Cancel
            </Button>
            <Button onClick={handlePasswordSubmit}>Change Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}