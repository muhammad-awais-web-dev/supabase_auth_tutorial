import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldGroup,
  FieldError,
} from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useAuth } from "@/providers/auth-provider";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

const SignUpDialog = () => {

  const { signUpWithPassword } = useAuth();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [passwordValid, setPasswordValid] = useState<boolean | null>(null);
  const [showEmailSuccessMessage, setShowEmailSuccessMessage] =
    useState<boolean>(false);
  const [showPasswordSuccessMessage, setShowPasswordSuccessMessage] =
    useState<boolean>(false);

  const [showSignUpMessage, setShowSignUpMessage] = useState<{
    type: "success" | "error";
  } | null>(null);
  const emailRedirectTo =
    process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin;

  useEffect(() => {
    if (emailValid) {
      setShowEmailSuccessMessage(true);
      setTimeout(() => setShowEmailSuccessMessage(false), 900);
    }
  }, [emailValid]);
  useEffect(() => {
    if (passwordValid) {
      setShowPasswordSuccessMessage(true);
      setTimeout(() => setShowPasswordSuccessMessage(false), 900);
    }
  }, [passwordValid]);

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
    if (showSignUpMessage !== null) {
      const timer = setTimeout(() => {
        setShowSignUpMessage(null);
      }, 5000); // 5000ms = 5 seconds
      return () => clearTimeout(timer);
    }
  }, [showSignUpMessage]);


  const handleSignUp = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email && password) {
      const { data, error } = await signUpWithPassword(
        email,
        password,
        emailRedirectTo,
      );
      if (error) {
        setShowSignUpMessage({ type: "error" });
      } else {
        setPassword("");
        setEmail("");
        setShowSignUpMessage({ type: "success" });
      }
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle className=" text-lg font-bold ">Sign Up</DialogTitle>
                <Alert hidden={showSignUpMessage?.type !== "error"} variant="destructive" className="my-4">
          <AlertTitle>Sign Up Failed</AlertTitle>
          <AlertDescription>
            Please check your email and password and try again.
          </AlertDescription>
        </Alert>
        <Alert hidden={showSignUpMessage?.type !== "success"} variant="default" className="my-4">
          <AlertTitle>Sign Up Successful.</AlertTitle>
          <AlertDescription>
            You have been signed up successfully. Please check your email to verify your account.
          </AlertDescription>
        </Alert>
        <DialogDescription className=" text-md font-semibold text-muted-foreground">
          Please enter your credentials to sign up.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSignUp}>
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
              {showEmailSuccessMessage ? (
                <FieldDescription className=" text-green-500 ">
                  Email looks good!
                </FieldDescription>
              ) : null}
              <FieldError>
                {!emailValid && email
                  ? "Please enter a valid email address."
                  : null}
              </FieldError>
            </Field>
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
              {showPasswordSuccessMessage ? (
                <FieldDescription className=" text-green-500 ">
                  Password looks good!
                </FieldDescription>
              ) : null}
              {
                <FieldError>
                  <ul>
                    {password.length < passwordLengthRequirement && password ? (
                      <li>Password must be at least 6 characters long.</li>
                    ) : null}
                    {!passwordSpecial && password ? (
                      <li>Password must contain a special character.</li>
                    ) : null}
                    {!passwordNumber && password ? (
                      <li>Password must contain a number.</li>
                    ) : null}
                    {!passwordUpper && password ? (
                      <li>Password must contain an uppercase letter.</li>
                    ) : null}
                    {!passwordLower && password ? (
                      <li>Password must contain a lowercase letter.</li>
                    ) : null}
                  </ul>
                </FieldError>
              }
            </Field>
          </FieldGroup>
        </DialogFooter>
        <Button
          type="submit"
          disabled={!emailValid || !passwordValid}
          className="mt-5 w-full"
        >
          Sign Up
        </Button>
      </form>
    </DialogContent>
  );
};

export default SignUpDialog;
