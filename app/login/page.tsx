import { Suspense } from "react";
import LoginForm from "./login-form";

export const metadata = {
  title: "OSIS-Hub — Pusat kendali Organisasi Siswa",
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
