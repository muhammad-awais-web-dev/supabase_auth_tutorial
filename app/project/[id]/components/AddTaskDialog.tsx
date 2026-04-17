import React, { useEffect, useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import { createClient } from "@/utils/supabase/client";
import { useParams } from "next/navigation";
import { useProjects } from "@/providers/project-provider";
import { Plus } from "lucide-react";
import type { Database } from "@/types/supabase";

type AddTaskDialogProps = {
  onTaskAdded?: (task: Database["public"]["Tables"]["project_tasks"]["Row"]) => void;
};

const AddTaskDialog = ({ onTaskAdded }: AddTaskDialogProps) => {
  const { id } = useParams();

  const [title, settitle] = useState<string>("");
  const [titleValid, setTitleValid] = useState<boolean>(false);
  const [description, setdescription] = useState<string>("");
  const [descriptionValid, setDescriptionValid] = useState<boolean>(false);
  const [status, setstatus] = useState<
    "pending" | "in_progress" | "completed" | "cancelled"
  >("pending");

  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  const { refreshProjectTasks } = useProjects();

  useEffect(() => {
    setTitleValid(title.trim().length > 0 && title.trim().length <= 100);
  }, [title]);

  useEffect(() => {
    setDescriptionValid(
      description.trim().length > 0 && description.trim().length <= 200,
    );
  }, [description]);

  const isFormValid = titleValid && descriptionValid;

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    const supabase = createClient();

    if (typeof id !== "string") {
      return;
    }

    const { data, error } = await supabase
      .from("project_tasks")
      .insert({
        task_title: title,
        task_description: description,
        status,
        project_id: id,
      })
      .select("*")
      .single();
    if (error) {
      console.error("Error inserting task:", error);
    } else {
      onTaskAdded?.(data);
      setDialogOpen(false);
      settitle("");
      setdescription("");
      setstatus("pending");
    }
    refreshProjectTasks();
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant={"outline"}
          size={"icon-lg"}
          className=" hover:bg-primary/10 cursor-pointer "
        >
          <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Task</DialogTitle>
          <DialogDescription>
            Enter the details for the new task.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel>Task Title</FieldLabel>
              <Input
                type="text"
                value={title}
                onChange={(e) => settitle(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>Task Description</FieldLabel>
              <Input
                type="text"
                value={description}
                onChange={(e) => setdescription(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel>Task Status</FieldLabel>
              <select
                className="h-7 w-full rounded-md border border-input"
                value={status}
                onChange={(e) =>
                  setstatus(
                    e.target.value as
                      | "pending"
                      | "in_progress"
                      | "completed"
                      | "cancelled",
                  )
                }
              >
                <option className=" bg-background/70  text-xs " value="pending">
                  Pending
                </option>
                <option
                  className=" bg-background/70  text-xs "
                  value="in_progress"
                >
                  In Progress
                </option>
                <option
                  className=" bg-background/70  text-xs "
                  value="completed"
                >
                  Completed
                </option>
                <option
                  className=" bg-background/70  text-xs "
                  value="cancelled"
                >
                  Cancelled
                </option>
              </select>
            </Field>
            <Button type="submit" disabled={!isFormValid}>
              Add Task
            </Button>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTaskDialog;
