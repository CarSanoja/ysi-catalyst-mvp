import { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";

interface LoginScreenProps {
  onLogin: () => void;
  language: 'EN' | 'ES';
}

export function LoginScreen({ onLogin, language }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const text = {
    EN: {
      signIn: 'Sign In',
      continueWithGoogle: 'Continue with Google',
      or: 'Or',
      emailAddress: 'Email address',
      password: 'Password',
      signInButton: 'Sign In',
      dataUse: 'By signing in, you agree to our data use practices for session recording and analysis.',
      privacyNotice: 'Privacy Notice',
      termsOfService: 'Terms of Service'
    },
    ES: {
      signIn: 'Iniciar Sesión',
      continueWithGoogle: 'Continuar con Google',
      or: 'O',
      emailAddress: 'Dirección de correo electrónico',
      password: 'Contraseña',
      signInButton: 'Iniciar Sesión',
      dataUse: 'Al iniciar sesión, acepta nuestras prácticas de uso de datos para grabación y análisis de sesiones.',
      privacyNotice: 'Aviso de Privacidad',
      termsOfService: 'Términos de Servicio'
    }
  };

  const t = text[language];

  const handleGoogleLogin = () => {
    // Simulate Google OAuth flow
    onLogin();
  };

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-white shadow-xl">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl">{t.signIn}</CardTitle>
          <CardDescription>
            Youth & Social Innovation Initiative
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button 
            onClick={handleGoogleLogin}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {t.continueWithGoogle}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-slate-500">{t.or}</span>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t.emailAddress}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t.password}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
                required
              />
            </div>
            <Button type="submit" className="w-full h-11" variant="outline">
              {t.signInButton}
            </Button>
          </form>

          <div className="text-sm text-slate-600 space-y-2">
            <p>{t.dataUse}</p>
            <div className="flex gap-4">
              <button className="text-blue-600 hover:underline">
                {t.privacyNotice}
              </button>
              <button className="text-blue-600 hover:underline">
                {t.termsOfService}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}