"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function ProfilePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [budget, setBudget] = useState<number>(2000);
  const [newBudget, setNewBudget] = useState("");
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  
  useEffect(() => {
    // Fetch user profile data (username & budget)
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await fetch("http://127.0.0.1:5000/profile", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Failed to fetch profile");

        const data = await res.json();
        setUsername(data.username);
        setBudget(data.budget);
      } catch (error) {
        console.error("Profile fetch error:", error);
      }
    };

    fetchProfile();
  }, []);

  // Update username
  const handleUsernameUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:5000/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ username: newUsername }),
      });

      if (!res.ok) throw new Error("Failed to update username");

      setUsername(newUsername);
      setNewUsername("");
      setSuccessMessage("Username updated successfully!");
    } catch (error) {
      console.error("Username update error:", error);
      setErrorMessage("Error updating username.");
    }
  };

  // Update budget
  const handleBudgetUpdate = async () => {
    const parsedBudget = parseFloat(newBudget);
    if (isNaN(parsedBudget) || parsedBudget < 0) {
      setErrorMessage("Invalid budget value");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:5000/update-budget", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ budget: parsedBudget }),
      });

      if (!res.ok) throw new Error("Failed to update budget");

      setBudget(parsedBudget);
      setNewBudget("");
      setSuccessMessage("Budget updated successfully!");
    } catch (error) {
      console.error("Budget update error:", error);
      setErrorMessage("Error updating budget.");
    }
  };

  // Change password
  const handleChangePassword = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:5000/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(passwords),
      });

      if (!res.ok) throw new Error("Failed to update password");

      setPasswords({ currentPassword: "", newPassword: "" });
      setSuccessMessage("Password updated successfully!");
    } catch (error) {
      console.error("Password update error:", error);
      setErrorMessage("Error updating password.");
    }
  };

  // Delete account
  const handleDeleteAccount = async () => {
    const confirmDelete = confirm("Are you sure you want to delete your account? This action is irreversible.");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:5000/delete-account", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to delete account");

      localStorage.removeItem("token");
      router.push("/signup");
    } catch (error) {
      console.error("Account deletion error:", error);
      setErrorMessage("Error deleting account.");
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="bg-card shadow-lg rounded-xl p-6 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">👤 Profile</h2>

        {/* Success/Error Messages */}
        {successMessage && <p className="text-green-500 text-sm text-center">{successMessage}</p>}
        {errorMessage && <p className="text-red-500 text-sm text-center">{errorMessage}</p>}

        {/* Username Section */}
        <div className="mt-4 w-full">
          <label className="text-sm font-medium">Username</label>
          <Input type="text" value={username} disabled className="mt-1 w-full" />
          <Input
            type="text"
            placeholder="Enter new username"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            className="mt-2 w-full"
          />
          <Button className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleUsernameUpdate}>
            Update Username
          </Button>
        </div>

        {/* Budget Section */}
        <div className="mt-6 w-full">
          <label className="text-sm font-medium">Monthly Budget</label>
          <Input type="number" value={budget.toFixed(2)} disabled className="mt-1 w-full" />
          <Input
            type="number"
            placeholder="Enter new budget"
            value={newBudget}
            onChange={(e) => setNewBudget(e.target.value)}
            className="mt-2 w-full"
          />
          <Button className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white" onClick={handleBudgetUpdate}>
            Update Budget
          </Button>
        </div>

        {/* Change Password Section */}
        <div className="mt-6 w-full">
          <label className="text-sm font-medium">Change Password</label>
          <Input
            type="password"
            placeholder="Current Password"
            value={passwords.currentPassword}
            onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
            className="mt-1 w-full"
          />
          <Input
            type="password"
            placeholder="New Password"
            value={passwords.newPassword}
            onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
            className="mt-2 w-full"
          />
          <Button className="w-full mt-3 bg-yellow-600 hover:bg-yellow-700 text-white" onClick={handleChangePassword}>
            Change Password
          </Button>
        </div>

        {/* Logout & Delete Account */}
        <Button className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white" onClick={handleLogout}>
          Logout
        </Button>
        <Button className="w-full mt-3 bg-gray-600 hover:bg-gray-700 text-white" onClick={handleDeleteAccount}>
          Delete Account
        </Button>
      </div>
    </div>
  );
}
