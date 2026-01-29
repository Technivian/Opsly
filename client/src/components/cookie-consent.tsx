import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Cookie } from "lucide-react";
import { Link } from "wouter";

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookie-consent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 flex justify-center pointer-events-none">
      <Card className="max-w-lg w-full shadow-xl border-border/50 bg-background/95 backdrop-blur pointer-events-auto">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Cookie className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium mb-1">We use cookies</p>
              <p className="text-xs text-muted-foreground mb-3">
                We use cookies to improve your experience and analyze site traffic. 
                By continuing, you agree to our{" "}
                <Link href="/security" className="underline hover:text-foreground">
                  privacy policy
                </Link>
                .
              </p>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleAccept} data-testid="button-accept-cookies">
                  Accept
                </Button>
                <Button size="sm" variant="outline" onClick={handleDecline} data-testid="button-decline-cookies">
                  Decline
                </Button>
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="shrink-0 h-8 w-8"
              onClick={() => setIsVisible(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
