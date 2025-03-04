"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { format, parseISO, startOfMonth, subMonths } from "date-fns";

// Define colors for the pie chart
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#ff6666", "#00c49f"];


// Utility function to get spending trends per day (last 30 days)
const calculateDailySpending = (expenses: any[]) => {
  const dailySpending: Record<string, number> = {};

  expenses.forEach((expense) => {
    if (!expense.date) return;
    const date = format(parseISO(expense.date), "yyyy-MM-dd");

    dailySpending[date] = (dailySpending[date] || 0) + expense.amount;
  });

  // Convert object to array and sort by date
  return Object.entries(dailySpending)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

// Utility function to get the most spent category
const calculateCategoryBreakdown = (expenses: any[]) => {
  const categoryTotals: Record<string, number> = {};

  expenses.forEach((expense) => {
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
  });

  return Object.entries(categoryTotals).map(([category, amount]) => ({
    name: category,
    value: amount,
  }));
};

export default function DashboardPage() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [dailySpendingData, setDailySpendingData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [totalSpent, setTotalSpent] = useState(0);
  const [changePercentage, setChangePercentage] = useState<string | null>(null);
  const [budget, setBudget] = useState<number>(2000); 


// Fetch budget when component mounts
useEffect(() => {
  const fetchBudget = async () => {
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

      if (!res.ok) throw new Error("Failed to fetch budget");

      const data = await res.json();
      if (data.budget !== undefined && typeof data.budget === "number") {
        setBudget(data.budget); // ✅ Store updated budget
        localStorage.setItem("budget", data.budget.toString()); // Store in local storage
      }
    } catch (error) {
      console.error("Error fetching budget:", error);
    }
  };

  fetchBudget();

  // ✅ Listen for budget updates
  const handleBudgetUpdate = () => {
    fetchBudget(); // Refetch budget when it's updated
  };

  window.addEventListener("budgetUpdated", handleBudgetUpdate);

  return () => {
    window.removeEventListener("budgetUpdated", handleBudgetUpdate);
  };
}, []);


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

      // Compute statistics
      const spendingData = calculateDailySpending(data);
      setDailySpendingData(spendingData);

      const categoryBreakdown = calculateCategoryBreakdown(data);
      setCategoryData(categoryBreakdown);

      // ✅ Compute current month's expenses
      const today = new Date();
      const firstDayOfMonth = startOfMonth(today);

      const currentMonthExpenses = data.filter((expense) => {
        const expenseDate = parseISO(expense.date);
        return expenseDate >= firstDayOfMonth && expenseDate <= today;
      });

      const currentMonthSpent = currentMonthExpenses.reduce((sum, entry) => sum + entry.amount, 0);
      setTotalSpent(currentMonthSpent); // ✅ Update state with current month's total

      // Compute previous month's spending for trend analysis
      const previousMonthFirstDay = startOfMonth(subMonths(today, 1));
      const previousMonthLastDay = startOfMonth(today); // First day of current month

      const previousMonthExpenses = data.filter((expense) => {
        const expenseDate = parseISO(expense.date);
        return expenseDate >= previousMonthFirstDay && expenseDate < previousMonthLastDay;
      });

      const previousMonthSpent = previousMonthExpenses.reduce((sum, entry) => sum + entry.amount, 0);

      // Calculate percentage change from last month
      if (previousMonthSpent > 0) {
        const percentageChange = ((currentMonthSpent - previousMonthSpent) / previousMonthSpent) * 100;
        setChangePercentage(percentageChange.toFixed(1) + "% " + (percentageChange >= 0 ? "more than last month" : "less than last month"));
      } else {
        setChangePercentage("New spending trend");
      }
    } catch (error) {
      console.error("Error fetching expenses:", error);
    }
  };

  fetchExpenses();
}, []);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">Welcome to your budget tracker dashboard.</p>

      <Tabs defaultValue="overview" className="mt-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
          <TabsTrigger value="year">This Year</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
  <CardHeader>
    <CardTitle>Total Spent (This Month)</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
    <p className="text-xs text-muted-foreground">{changePercentage}</p>
  </CardContent>
</Card>


            <Card>
              <CardHeader>
                <CardTitle>Monthly Budget</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${budget ? budget.toFixed(2) : "Loading..."}</div>
                <p className="text-xs text-muted-foreground">
  {budget ? ((totalSpent / budget) * 100).toFixed(1) + "% used" : "Loading..."}
</p>

              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Expenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{expenses.length}</div>
                <p className="text-xs text-muted-foreground">Last 7 days</p>
              </CardContent>
            </Card>
          </div>

          {/* Spending Overview Line Chart */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Spending Overview</CardTitle>
                <CardDescription>Spending trends for the last 30 days</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {dailySpendingData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailySpendingData}>
                      <XAxis dataKey="date" tickFormatter={(tick) => format(parseISO(tick), "MM/dd")} />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="amount" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground">No data available</p>
                )}
              </CardContent>
            </Card>

            {/* Category Breakdown Pie Chart */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>Spending by category</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>
                        {categoryData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground">No data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
