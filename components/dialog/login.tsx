import React, { use, useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Field, FieldLabel, FieldGroup, FieldError } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useAuth } from "@/providers/auth-provider";
import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

const LoginDialog = () => {
  const { signInWithPassword } = useAuth();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [passwordValid, setPasswordValid] = useState<boolean | null>(null);
  const [showSigninMessage, setShowSigninMessage] = useState<{
    type: "success" | "error";
  } | null>(null);

  let passwordSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  let passwordNumber = /\d/.test(password);
  let passwordUpper = /[A-Z]/.test(password);
  let passwordLower = /[a-z]/.test(password);
  const passwordLengthRequirement = 6;

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isEmailValid = emailRegex.test(email);
    const isPasswordValid =
      password.length >= passwordLengthRequirement &&
      passwordSpecial &&
      passwordNumber &&
      passwordUpper &&
      passwordLower;
    setEmailValid(isEmailValid);
    setPasswordValid(isPasswordValid);
  }, [password, email]);

  useEffect(() => {
    if (showSigninMessage !== null) {
      const timer = setTimeout(() => {
        setShowSigninMessage(null);
      }, 5000); // 5000ms = 5 seconds

      // Cleanup function to clear the timer if the component unmounts
      // or if showSigninMessage changes again before the timer ends
      return () => clearTimeout(timer);
    }
  }, [showSigninMessage]);

  const handleLogin = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email && password) {
      const { data, error } = await signInWithPassword(email, password);
      if (error) {
        setShowSigninMessage({ type: "error" });
      } else {
        setEmail("");
        setPassword("");
        setShowSigninMessage({ type: "success" });
      }
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className=" text-lg font-bold ">Login</DialogTitle>

        <Alert hidden={showSigninMessage?.type !== "error"} variant="destructive" className="my-4">
          <AlertTitle>Login Failed</AlertTitle>
          <AlertDescription>
            Please check your email and password and try again.
          </AlertDescription>
        </Alert>
        <Alert hidden={showSigninMessage?.type !== "success"} variant="default" className="my-4">
          <AlertTitle>Login Successful</AlertTitle>
          <AlertDescription>
            You have been logged in successfully.
          </AlertDescription>
        </Alert>
        <DialogDescription className=" text-md font-semibold text-muted-foreground">
          Please enter your credentials to log in.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleLogin}>
        <DialogFooter>
          <FieldGroup className=" gap-2 ">
            <Field>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                {...(!emailValid && email
                  ? { className: "border-destructive" }
                  : {})}
                id="email"
                type="email"
                placeholder="Email"
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            {emailValid === false && email ? (
              <FieldError>Please Enter Valid Email</FieldError>
            ) : null}
            <Field>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                {...(!passwordValid && password
                  ? { className: "border-destructive" }
                  : {})}
                id="password"
                type="password"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            {passwordValid === false && password ? (
              <FieldError>Please Enter Valid Password</FieldError>
            ) : null}
          </FieldGroup>
        </DialogFooter>
        <Button
          type="submit"
          disabled={!emailValid || !passwordValid}
          className="mt-5 w-full"
        >
          Login
        </Button>
      </form>
    </DialogContent>
  );
};

export default LoginDialog;
