import InstaLogin from "@/components/InstaLogin/page";
import DummyJsonLoginButton from "@/components/dummyJsonLoginButton/page";
import LoginButton from "@/components/lognButton/page";
import WhatsAppLogin from "@/components/whatsappButton/page";

export default function Home() {
  return (
    <div>
      <LoginButton />
      <InstaLogin />
      <WhatsAppLogin />
      <DummyJsonLoginButton />
    </div>
  );
}
