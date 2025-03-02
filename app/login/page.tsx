"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");

      localStorage.setItem("token", data.access_token); // Store JWT token
      router.push("/dashboard"); // Redirect to dashboard on success
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
      <h1 className="text-3xl font-bold tracking-tight">Log In</h1>
      <p className="mt-2 text-muted-foreground">Access your budget dashboard</p>

      <form className="mt-6 w-full max-w-sm" onSubmit={handleSubmit}>
        <Input
          type="text"
          name="username"
          placeholder="Username"
          onChange={handleChange}
          required
        />
        <Input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          required
          className="mt-2"
        />
        {error && <p className="text-red-500 mt-2">{error}</p>}
        <Button type="submit" size="lg" className="w-full mt-4">
          Log In
        </Button>
      </form>

      <p className="mt-4 text-sm">
        Dont have an account?{" "}
        <Link href="/signup" className="text-primary">
          Sign up
        </Link>
      </p>
    </div>
  );
}
