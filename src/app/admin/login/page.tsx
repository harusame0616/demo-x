import Link from "next/link";
import { LoginCard } from "./_components/login-card";

export default function Page() {
  return (
    <div className="flex flex-col h-full items-center p-4">
      <div className="flex-grow max-h-[120px]" />
      <div className="max-w-sm w-full">
        <LoginCard />
      </div>
    </div>
  );
}