"use server";

import { supabaseAdmin } from "@/utils/supabase/adminClient";

const createUsers = async () => {
  const userEmail = `user-${Date.now()}@example.com`;
  // console.log("Creating user with email:", userEmail);
  // console.log("Password: password123");

  const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
    email: userEmail,
    password: "password123",
    email_confirm: true,
  });

  if (error) {
    return { error: error.message };
  }

  return { userId: user.user?.id ?? null };
};

export default createUsers;
