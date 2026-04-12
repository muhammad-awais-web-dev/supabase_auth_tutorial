"use client";
import { useState } from "react";
import { createClient } from "../utils/supabase/client";

export default function Page() {

  const supabase = createClient();

  const [session, setSession] = useState(supabase.auth.getSession());
  const [mode, setMode] = useState("Login")

  return (
    <div>
    </div>
  );
}
