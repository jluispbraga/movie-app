import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Film } from "lucide-react";

export default function Login() {
  const loginUrl = getLoginUrl();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Film className="w-12 h-12 text-blue-500" />
          </div>
          <CardTitle className="text-2xl">Ghibli Movie App</CardTitle>
          <CardDescription>
            Descubra e salve seus filmes favoritos do Studio Ghibli
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-slate-600 text-center">
            Faça login para acessar sua lista de favoritos e gerenciar suas preferências.
          </div>
          <Button
            onClick={() => {
              window.location.href = loginUrl;
            }}
            className="w-full h-10"
            size="lg"
          >
            Entrar com Manus
          </Button>
          <div className="text-xs text-slate-500 text-center">
            Você será redirecionado para fazer login de forma segura
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
