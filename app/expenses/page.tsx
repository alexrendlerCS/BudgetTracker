"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, parseISO } from "date-fns";
import { TrashIcon } from "@heroicons/react/24/solid";

const ITEMS_PER_PAGE = 10;

export default function ExpensesPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("date");

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/login");
          return;
        }

        const res = await fetch("http://127.0.0.1:5000/expenses", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) throw new Error("Failed to fetch expenses");

        const data = await res.json();
        setExpenses(data);
      } catch (error) {
        console.error("Error fetching expenses:", error);
      }
    };

    fetchExpenses();
  }, []);

  const handleDelete = async (expenseId: string) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`http://127.0.0.1:5000/expenses/${expenseId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to delete expense");

      // Remove from UI
      setExpenses((prev) => prev.filter((expense) => expense.id !== expenseId));
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedExpense, setEditedExpense] = useState<any>({});

  const handleEdit = (expense: any) => {
    setEditingId(expense.id);
    setEditedExpense({ ...expense });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditedExpense({});
  };

  const handleSave = async (expenseId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`http://127.0.0.1:5000/expenses/${expenseId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedExpense),
      });

      if (!res.ok) throw new Error("Failed to update expense");

      // Update UI with new expense details
      setExpenses((prev) =>
        prev.map((exp) => (exp.id === expenseId ? editedExpense : exp))
      );

      setEditingId(null);
      setEditedExpense({});
    } catch (error) {
      console.error("Error updating expense:", error);
    }
  };

  const sortedExpenses = [...expenses].sort((a, b) => {
    if (sortBy === "date")
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortBy === "amount") return b.amount - a.amount;
    if (sortBy === "category") return a.category.localeCompare(b.category);
    if (sortBy === "name") return a.name.localeCompare(b.name);
    return 0;
  });

  const paginatedExpenses = sortedExpenses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Expenses</h1>
      <p className="text-muted-foreground">
        Track and manage your spending efficiently.
      </p>
  
      <div className="flex justify-between items-center py-4">
        <p className="text-lg font-medium">
          Showing {paginatedExpenses.length} of {expenses.length} expenses
        </p>
        <Select onValueChange={setSortBy} defaultValue="date">
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="amount">Amount</SelectItem>
            <SelectItem value="category">Category</SelectItem>
            <SelectItem value="name">Name</SelectItem>
          </SelectContent>
        </Select>
      </div>
  
      <Card>
        <CardHeader>
          <CardTitle>Recent Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-6 gap-4 p-4 bg-white rounded-lg shadow">
            {/* Header Row */}
            <div className="font-bold border-b pb-2">Name</div>
            <div className="font-bold border-b pb-2">Category</div>
            <div className="font-bold border-b pb-2">Date</div>
            <div className="font-bold border-b pb-2">Amount</div>
            <div className="font-bold border-b pb-2 text-center">Actions</div>
            <div className="font-bold border-b pb-2">Edit</div>
  
            {/* Data Rows */}
            {paginatedExpenses.map((expense) => (
              <div key={expense.id} className="contents">
                {/* Name + Description Column */}
                <div className="py-2 flex flex-col">
                  {editingId === expense.id ? (
                    <input
                      className="border px-2 py-1 rounded"
                      type="text"
                      value={editedExpense.name}
                      onChange={(e) =>
                        setEditedExpense({ ...editedExpense, name: e.target.value })
                      }
                    />
                  ) : (
                    <>
                      <span className="font-medium">{expense.name}</span>
                      <span className="font-medium">{expense.description}</span>
                    </>
                  )}
                </div>
  
                {/* Category */}
                <div className="py-2">
                  {editingId === expense.id ? (
                    <input
                      className="border px-2 py-1 rounded"
                      type="text"
                      value={editedExpense.category}
                      onChange={(e) =>
                        setEditedExpense({ ...editedExpense, category: e.target.value })
                      }
                    />
                  ) : (
                    expense.category
                  )}
                </div>
  
                {/* Date */}
                <div className="py-2">
                  {editingId === expense.id ? (
                    <input
                      className="border px-2 py-1 rounded"
                      type="date"
                      value={editedExpense.date}
                      onChange={(e) =>
                        setEditedExpense({ ...editedExpense, date: e.target.value })
                      }
                    />
                  ) : (
                    format(parseISO(expense.date), "MMM dd, yyyy")
                  )}
                </div>
  
                {/* Amount (Justified Left) */}
                <div className="py-2">
                  {editingId === expense.id ? (
                    <input
                      className="border px-2 py-1 rounded"
                      type="number"
                      value={editedExpense.amount}
                      onChange={(e) =>
                        setEditedExpense({
                          ...editedExpense,
                          amount: parseFloat(e.target.value) || 0,
                        })
                      }
                    />
                  ) : (
                    `$${expense.amount.toFixed(2)}`
                  )}
                </div>
  
                {/* Delete Button (Centered) */}
                <div className="py-2 flex justify-center">
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center gap-2"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Delete
                  </button>
                </div>
  
                {/* Edit & Save Buttons (Justified Left) */}
                <div className="py-2">
                  {editingId === expense.id ? (
                    <>
                      <button
                        onClick={() => handleSave(expense.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded mx-1"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleEdit(expense)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Edit
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
  
      <div className="flex justify-between items-center pt-4">
        <Button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <p className="text-sm">
          Page {currentPage} of {Math.ceil(expenses.length / ITEMS_PER_PAGE)}
        </p>
        <Button
          onClick={() => setCurrentPage((prev) => prev + 1)}
          disabled={currentPage * ITEMS_PER_PAGE >= expenses.length}
        >
          Next
        </Button>
      </div>
    </div>
  );  
}
