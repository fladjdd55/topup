import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useTelegramAuth } from "@/hooks/useTelegramAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Zap, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function TelegramAuthPage() {
  const { user } = useAuth();
  const { telegramUser, loginWithTelegram, isLoading, hasInitData } = useTelegramAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm border-0 shadow-none bg-transparent">
        <CardHeader className="text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 shadow-xl">
            <Zap className="h-10 w-10 text-white" />
          </div>
          
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold">TapTopLoad</CardTitle>
            <CardDescription className="text-base">
              Mobile top-up simplified
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6 flex flex-col items-center">
          
          {/* ✅ SCENARIO 1: User Detected */}
          {hasInitData && telegramUser ? (
            <>
              <div className="w-full bg-muted/50 rounded-xl p-4 flex flex-col items-center gap-3 border border-border/50 animate-in fade-in zoom-in duration-500">
                <Avatar className="h-16 w-16 border-2 border-background shadow-sm">
                  <AvatarImage src={telegramUser.photo_url} />
                  <AvatarFallback className="text-lg bg-primary/10 text-primary">
                    {telegramUser.first_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <p className="font-semibold text-lg">
                    {telegramUser.first_name} {telegramUser.last_name}
                  </p>
                  <p className="text-sm text-muted-foreground">@{telegramUser.username}</p>
                </div>
              </div>

              <div className="w-full space-y-3">
                <Button 
                  className="w-full h-12 text-base font-semibold shadow-lg shadow-primary/20" 
                  onClick={() => loginWithTelegram()}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    `Continue as ${telegramUser.first_name}`
                  )}
                </Button>

                <Button 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => setLocation("/login")}
                >
                  Use another account
                </Button>
              </div>
            </>
          ) : (
            /* ✅ SCENARIO 2: Guest Mode */
            <div className="w-full space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Alert className="mb-4 bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-700 text-xs">
                  Guest mode detected. For auto-login, please open the app using the bot's Menu button.
                </AlertDescription>
              </Alert>

              <Button 
                className="w-full h-12 text-base font-semibold" 
                onClick={() => setLocation("/login")}
              >
                Log In
              </Button>
              <Button 
                variant="outline" 
                className="w-full h-12 text-base" 
                onClick={() => setLocation("/register")}
              >
                Create Account
              </Button>
            </div>
          )}
          
          <p className="text-xs text-center text-muted-foreground px-4 mt-4">
            By continuing, you agree to our Terms of Service.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
