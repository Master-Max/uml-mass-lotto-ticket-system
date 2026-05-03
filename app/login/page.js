"use client";

import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  function login(role) {
    if (role === "commission") {
      router.push("/dashboard/commission");
    } else {
      router.push("/dashboard/agent");
    }
  }

  return (
    <div className="p-10 max-w-md mx-auto text-center">
      <h1 className="text-2xl font-bold mb-6">Mass Lotto Login</h1>

      <button
        onClick={() => login("commission")}
        className="bg-blue-600 text-white px-4 py-2 w-full mb-4"
      >
        Login as Commission
      </button>

      <button
        onClick={() => login("agent")}
        className="bg-green-600 text-white px-4 py-2 w-full"
      >
        Login as Agent
      </button>
    </div>
  );
}