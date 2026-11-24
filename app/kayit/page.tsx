import Link from "next/link";
import { AuthLayout } from "@/components/AuthLayout";
import { RegisterForm } from "./RegisterForm";

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Hesap oluştur"
      description="Tek hesapla tüm izole laboratuvarlara eriş. Yalnızca eğitim amaçlı kullanım içindir."
      footer={
        <>
          Zaten hesabın var mı?{" "}
          <Link href="/giris" className="font-medium text-accent hover:underline">
            Giriş yap
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthLayout>
  );
}
