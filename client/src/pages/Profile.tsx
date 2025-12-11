import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, LogOut, Heart } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Profile() {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { data: favorites, isLoading } = trpc.movies.favorites.list.useQuery();

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-slate-600">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Perfil do Usuário */}
        <Card>
          <CardHeader>
            <CardTitle>Meu Perfil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Nome</p>
                <p className="text-lg font-semibold">{user.name || "Usuário"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Email</p>
                <p className="text-lg font-semibold">{user.email || "N/A"}</p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="destructive"
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </CardContent>
        </Card>

        {/* Filmes Favoritos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-red-500" />
              Meus Filmes Favoritos
            </CardTitle>
            <CardDescription>
              {favorites?.length || 0} filme(s) adicionado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : favorites && favorites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favorites.map((favorite) => (
                  <div
                    key={favorite.id}
                    className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-semibold text-slate-900">
                      {favorite.movieTitle}
                    </h3>
                    {favorite.releaseDate && (
                      <p className="text-sm text-slate-600">
                        Lançamento: {favorite.releaseDate}
                      </p>
                    )}
                    {favorite.runningTime && (
                      <p className="text-sm text-slate-600">
                        Duração: {favorite.runningTime} minutos
                      </p>
                    )}
                    {favorite.movieDescription && (
                      <p className="text-sm text-slate-700 mt-2 line-clamp-2">
                        {favorite.movieDescription}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">
                  Você ainda não adicionou nenhum filme aos favoritos.
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  Volte para a página inicial e adicione seus filmes favoritos!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
