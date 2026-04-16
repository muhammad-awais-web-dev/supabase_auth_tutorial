"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

import { Database } from "@/types/database.types";
import { Button } from "../ui/button";

import createUsers  from "./createUsers";

const DevelopmentDialog = ({ children }: { children: React.ReactNode }) => {

  const handleCreateUsers = async () => {
    try {
      const createdUserIds = await createUsers();
    } catch (error) {
      console.error("Error creating users:", error);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Development Dialog</DialogTitle>
          <DialogDescription>
            This is a simple development dialog.
          </DialogDescription>
        </DialogHeader>
        <Button type="button" onClick={handleCreateUsers}>
          Add fake user
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default DevelopmentDialog;
