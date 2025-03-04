"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarIcon, CheckCircleIcon } from "lucide-react";
import { format } from "date-fns";

const categories = [
  { name: "Food", icon: "🍔" },
  { name: "Transport", icon: "🚗" },
  { name: "Shopping", icon: "🛒" },
  { name: "Entertainment", icon: "🎟️" },
  { name: "Health", icon: "⚕️" },
  { name: "Bills", icon: "💡" },
];

export default function AddExpensePage() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [customCategory, setCustomCategory] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!amount || (!category && !customCategory)) {
      setError("Please enter an amount and select a category.");
      return;
    }
  
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Session expired. Please log in again.");
      router.push("/login"); // Redirect user to login
      return;
    }
  
    try {
      const res = await fetch("http://127.0.0.1:5000/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // ✅ Ensure valid token is sent
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          category: category === "Other" ? customCategory : category,
          description,
          date,
        }),
      });
  
      if (res.status === 401) {
        setError("Session expired. Please log in again.");
        localStorage.removeItem("token"); // Clear expired token
        router.push("/login"); // Redirect to login page
        return;
      }
  
      if (!res.ok) {
        throw new Error("Failed to add expense");
      }
  
      router.push("/dashboard"); // ✅ Redirect on success
    } catch (error) {
      console.error("Expense submission error:", error);
      setError("Something went wrong. Please try again.");
    }
  };
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="bg-card shadow-lg rounded-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">💰 Add Expense</h2>
  
        {error && (
          <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
        )}
  
        {/* Amount Input */}
        <div className="mb-4">
          <label className="text-sm font-medium">Amount</label>
          <Input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full"
          />
        </div>
  
        {/* Category Selection */}
        <div className="mb-4">
          <label className="text-sm font-medium">Category</label>
          <div className="grid grid-cols-3 gap-3 mt-2">
            {categories.map((cat) => (
              <button
                key={cat.name}
                className={`flex flex-col items-center p-3 rounded-lg border transition ${
                  category === cat.name
                    ? "bg-green-600 text-white border-green-700"
                    : "bg-gray-100 dark:bg-gray-800 text-foreground hover:bg-green-500 hover:text-white hover:border-green-600"
                }`}
                onClick={() => {
                  setCategory(cat.name);
                  setCustomCategory(""); // Reset custom category input
                }}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-xs font-medium mt-1">{cat.name}</span>
              </button>
            ))}
  
            {/* Other Category Option */}
            <button
              className={`flex flex-col items-center p-3 rounded-lg border transition ${
                category === "Other"
                  ? "bg-green-600 text-white border-green-700"
                  : "bg-gray-100 dark:bg-gray-800 text-foreground hover:bg-green-500 hover:text-white hover:border-green-600"
              }`}
              onClick={() => setCategory("Other")}
            >
              <span className="text-2xl">➕</span>
              <span className="text-xs font-medium mt-1">Other</span>
            </button>
          </div>
  
          {/* Show Input Field if "Other" is Selected */}
          {category === "Other" && (
            <div className="mt-3">
              <Input
                type="text"
                placeholder="Enter custom category"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                className="w-full"
              />
            </div>
          )}
        </div>
  
        {/* Description Input */}
        <div className="mb-4">
          <label className="text-sm font-medium">Description (Optional)</label>
          <Input
            type="text"
            placeholder="Enter description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 w-full"
          />
        </div>
  
        {/* Date Picker */}
        <div className="mb-6">
          <label className="text-sm font-medium">Date</label>
          <div className="relative">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full"
            />
            <CalendarIcon
              className="absolute right-3 top-3 text-muted-foreground"
              size={20}
            />
          </div>
        </div>
  
        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          className="w-full flex justify-center gap-2 bg-green-600 hover:bg-green-700 text-white"
        >
          <CheckCircleIcon size={18} />
          Save Expense
        </Button>
      </div>
    </div>
  );
}