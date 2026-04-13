"use client";

import { useState } from "react";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useAuth } from "@/providers/auth-provider";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "../ui/field";
import { Input } from "../ui/input";

const ManageProfile = () => {
  const { profile } = useAuth();
  const [profileData, setProfileData] = useState<typeof profile>(profile);

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Manage Profile</DialogTitle>
      </DialogHeader>
      <FieldGroup>
        <Field>
          <FieldLabel>Profile Picture</FieldLabel>
          <div className=" w-full " >
            <img src={profileData?.avatar_url || "https://pixabay.com/images/download/daweid-icon-7797704_1920.png"} className="rounded-full" alt="Profile Picture" />
          </div>
          {/* <Input type="file" accept="image/jpeg, image/png, image/webp"  /> */}
        </Field>
        <Field>
          <FieldLabel>Username</FieldLabel>
          <FieldDescription>Your unique username.</FieldDescription>
          <FieldError />
          <Input
            value={profileData?.username || ""}
            onChange={(e) =>
              setProfileData({ ...profileData, username: e.target.value } as any)
            }
          />
        </Field>
        <Field>
          <FieldLabel>Name</FieldLabel>
          <FieldDescription>Your display name.</FieldDescription>
          <FieldError />
          <Input
            value={profileData?.display_name || ""}
            onChange={(e) =>
              setProfileData({ ...profileData, display_name: e.target.value } as any)
            }
          />
        </Field>
      </FieldGroup>
    </DialogContent>
  );
};

export default ManageProfile;
