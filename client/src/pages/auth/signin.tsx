import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Layers, Loader2, Mail, AlertCircle } from "lucide-react";

export default function SignIn() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { signIn, isSigningIn, startDemo, isStartingDemo } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await signIn({ email, password });
      setLocation("/app");
    } catch (err: any) {
      setError(err.message || t("auth.signin.failedSignIn"));
    }
  };

  const handleDemo = async () => {
    setError(null);
    try {
      await startDemo();
      setLocation("/app");
    } catch (err: any) {
      setError(err.message || t("auth.demo.failed"));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center">
            <Layers className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-semibold tracking-tight">{t("common.appName")}</span>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">{t("auth.signin.title")}</CardTitle>
            <CardDescription>{t("auth.signin.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.signin.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="u@bedrijf.nl"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="input-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.signin.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t("auth.signin.passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  data-testid="input-password"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSigningIn}
                data-testid="button-signin"
              >
                {isSigningIn ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("auth.signin.signingIn")}
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    {t("common.signIn")}
                  </>
                )}
              </Button>
            </form>

            <p className="mt-3 text-xs text-muted-foreground text-center">
              {t("auth.signin.forgotPassword")}
            </p>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">{t("auth.signup.orDivider")}</span>
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
                  {t("auth.demo.starting")}
                </>
              ) : (
                t("auth.demo.start")
              )}
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 text-center text-sm text-muted-foreground">
            <p>
              {t("auth.signin.noAccount")}{" "}
              <Link href="/auth/signup" className="text-primary hover:underline" data-testid="link-signup">
                {t("common.signUp")}
              </Link>
            </p>
            <Link href="/" className="text-muted-foreground hover:text-foreground" data-testid="link-back-home">
              {t("auth.signin.backToHome")}
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
