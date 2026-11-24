import Link from "next/link";
import { AuthLayout } from "@/components/AuthLayout";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <AuthLayout
      title="Giriş yap"
      description="Laboratuvarlara ve ilerleme kaydına erişmek için hesabınla giriş yap."
      footer={
        <>
          Hesabın yok mu?{" "}
          <Link href="/kayit" className="font-medium text-accent hover:underline">
            Hesap oluştur
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthLayout>
  );
}
