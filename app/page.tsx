import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-60px)] text-center px-4">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
        Take Control of Your <span className="text-primary">Finances</span>
      </h1>
      <p className="mt-6 text-lg text-muted-foreground max-w-3xl">
        Track your expenses, set budgets, and gain insights into your spending habits with our easy-to-use budget
        tracker.
      </p>

      {/* Buttons Section: Get Started, Sign Up, Log In */}
      <div className="mt-10 flex flex-col sm:flex-row gap-4">
        <Button asChild size="lg">
          <Link href="/dashboard">
            Get Started <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button variant="default" size="lg">
          <Link href="/signup">Sign Up</Link>
        </Button>
        <Button variant="outline" size="lg">
          <Link href="/login">Log In</Link>
        </Button>
      </div>

      {/* Features Section */}
      <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl">
        <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-sm">
          <div className="rounded-full bg-primary/10 p-3 mb-4">
            <svg
              className="h-6 w-6 text-primary"
              fill="none"
              height="24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <h3 className="text-xl font-bold">Track Expenses</h3>
          <p className="text-muted-foreground text-center mt-2">Easily log and categorize your daily expenses</p>
        </div>

        <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-sm">
          <div className="rounded-full bg-primary/10 p-3 mb-4">
            <svg
              className="h-6 w-6 text-primary"
              fill="none"
              height="24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M3 3v18h18" />
              <path d="m19 9-5 5-4-4-3 3" />
            </svg>
          </div>
          <h3 className="text-xl font-bold">Visualize Data</h3>
          <p className="text-muted-foreground text-center mt-2">See where your money goes with intuitive charts</p>
        </div>

        <div className="flex flex-col items-center p-6 bg-card rounded-lg shadow-sm">
          <div className="rounded-full bg-primary/10 p-3 mb-4">
            <svg
              className="h-6 w-6 text-primary"
              fill="none"
              height="24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <h3 className="text-xl font-bold">Set Budgets</h3>
          <p className="text-muted-foreground text-center mt-2">
            Create budgets and get alerts when you are close to limits
          </p>
        </div>
      </div>
    </div>
  );
}
