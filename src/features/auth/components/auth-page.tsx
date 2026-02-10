import { useState } from "react";
import { supabase } from "@/shared/infra/supabase-client";
import Button from "@/shared/ui/button";
import Card from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function AuthPage() {
  const [authView, setAuthView] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (authView === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Check your email for the confirmation link!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[350px]">
        <Card.Header>
          <Card.Title>
            {authView === "signin" ? "Sign In" : "Create Account"}
          </Card.Title>
          <Card.Description>
            Enter your email below to access your portfolio.
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="auth-email">Email</Label>
              <Input
                id="auth-email"
                type="email"
                name="email"
                placeholder="you@example.com…"
                autoComplete="email"
                spellCheck={false}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="auth-password">Password</Label>
              <Input
                id="auth-password"
                type="password"
                name="password"
                placeholder="Your password…"
                autoComplete={authView === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive animate-in fade-in slide-in-from-top-1">
                <AlertCircle aria-hidden="true" className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin mr-2" />
                  Loading…
                </>
              ) : authView === "signin" ? (
                "Sign In"
              ) : (
                "Sign Up"
              )}
            </Button>

            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() =>
                  setAuthView(authView === "signin" ? "signup" : "signin")
                }
                className="underline text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
              >
                {authView === "signin"
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
        </Card.Content>
      </Card>
    </div>
  );
}
