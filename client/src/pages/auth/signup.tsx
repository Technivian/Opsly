import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Layers, Loader2, UserPlus, AlertCircle, Check } from "lucide-react";

export default function SignUp() {
  const [, setLocation] = useLocation();
  const { signUp, isSigningUp, startDemo, isStartingDemo } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!termsAccepted) {
      setError("You must accept the Terms of Service and Privacy Policy");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      await signUp({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
      });
      setLocation("/app");
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    }
  };

  const handleDemo = async () => {
    setError(null);
    try {
      await startDemo();
      setLocation("/app");
    } catch (err: any) {
      setError(err.message || "Failed to start demo");
    }
  };

  const passwordRequirementsMet = formData.password.length >= 8;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center">
            <Layers className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-semibold tracking-tight">Opsly</span>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Create your account</CardTitle>
            <CardDescription>Get started with Opsly in minutes</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    data-testid="input-first-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    data-testid="input-last-name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Work email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  data-testid="input-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  data-testid="input-password"
                />
                <div className="flex items-center gap-2 text-xs">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                    passwordRequirementsMet ? "bg-green-500/20 text-green-600" : "bg-muted text-muted-foreground"
                  }`}>
                    {passwordRequirementsMet && <Check className="w-3 h-3" />}
                  </div>
                  <span className={passwordRequirementsMet ? "text-green-600" : "text-muted-foreground"}>
                    At least 8 characters
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  data-testid="input-confirm-password"
                />
              </div>

              <div className="flex items-start gap-3 py-2">
                <Checkbox
                  id="terms"
                  checked={termsAccepted}
                  onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
                  className="mt-1"
                  data-testid="checkbox-terms"
                />
                <Label htmlFor="terms" className="text-sm font-normal cursor-pointer">
                  I accept the{" "}
                  <Link href="/terms" className="text-primary hover:underline" target="_blank">
                    Terms of Service
                  </Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="text-primary hover:underline" target="_blank">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSigningUp || !termsAccepted}
                data-testid="button-signup"
              >
                {isSigningUp ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create account
                  </>
                )}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleDemo}
              disabled={isStartingDemo}
              data-testid="button-try-demo"
            >
              {isStartingDemo ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Starting demo...
                </>
              ) : (
                "Try Live Demo"
              )}
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 text-center text-sm text-muted-foreground">
            <p>
              Already have an account?{" "}
              <Link href="/auth/signin" className="text-primary hover:underline" data-testid="link-signin">
                Sign in
              </Link>
            </p>
            <Link href="/" className="text-muted-foreground hover:text-foreground" data-testid="link-back-home">
              Back to home
            </Link>
          </CardFooter>
        </Card>

        <p className="text-xs text-center text-muted-foreground mt-4">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
