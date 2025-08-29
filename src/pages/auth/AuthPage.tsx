import { LoginForm } from "../../components/auth/LoginForm";
import { SignupForm } from "../../components/auth/SignupForm";
import { useLocation } from "react-router";
import { AnimatePresence, motion } from "framer-motion";

export default function AuthPage() {
  const { pathname } = useLocation();
  const page = pathname.split("/")[1];

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <AnimatePresence mode="wait" initial={true}>
          <motion.div
            key={page}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {page === "login" ? <LoginForm /> : <SignupForm />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
