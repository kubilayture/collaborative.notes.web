import { useMutation } from "@tanstack/react-query";
import type { LoginRequest, SignupRequest } from "../types/index";
import { requestPasswordReset, signIn, signOut, signUp } from "../lib/auth-client";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export const useLogin = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload: LoginRequest) => signIn.email(payload),
    onSuccess: (cb) => {
      if (cb.error) {
        toast.error(cb.error.message);
      } else if (cb.data) {
        toast.success(`Welcome back, ${cb.data.user.name}`);
        navigate("/");
      }
    },
  });
};

export const useSignup = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload: SignupRequest) => signUp.email(payload),
    onSuccess: (cb) => {
      if (cb.error) {
        toast.error(cb.error.message);
      } else if (cb.data) {
        toast.success(`Welcome, ${cb.data.user.name}`);
        navigate("/");
      }
    },
    onError: () => {},
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: () => signOut(),
    onSuccess: () => {},
    onError: () => {},
  });
};

export const useRequestPasswordReset = () => {
  return useMutation({
    mutationFn: (payload: { email: string }) => requestPasswordReset(payload),
    onSuccess: () => {},
    onError: () => {},
  });
};
