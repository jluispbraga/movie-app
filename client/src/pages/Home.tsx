import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2, Heart, Search } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

interface GhibliMovie {
  id: string;
  title: string;
  description: string;
  release_date: string;
  running_time: string;
  director: string;
  producer: string;
  rt_score: string;
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [movies, setMovies] = useState<GhibliMovie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<GhibliMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  // Fetch favorites list
  const { data: favorites } = trpc.movies.favorites.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Mutations for favorites
  const addFavoriteMutation = trpc.movies.favorites.add.useMutation({
    onSuccess: () => {
      toast.success("Adicionado aos favoritos!");
    },
    onError: () => {
      toast.error("Erro ao adicionar aos favoritos");
    },
  });

  const removeFavoriteMutation = trpc.movies.favorites.remove.useMutation({
    onSuccess: () => {
      toast.success("Removido dos favoritos!");
    },
    onError: () => {
      toast.error("Erro ao remover dos favoritos");
    },
  });

  // Fetch movies from Ghibli API
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("https://ghibliapi.vercel.app/films");
        if (!response.ok) {
          throw new Error("Erro ao buscar filmes");
        }
        const data = await response.json();
        setMovies(data);
        setFilteredMovies(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro desconhecido ao buscar filmes"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  // Update favorite IDs when favorites list changes
  useEffect(() => {
    if (favorites) {
      const ids = new Set(favorites.map((fav) => fav.ghibliMovieId));
      setFavoriteIds(ids);
    }
  }, [favorites]);

  // Filter movies by search query
  useEffect(() => {
    const filtered = movies.filter(
      (movie) =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        movie.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredMovies(filtered);
  }, [searchQuery, movies]);

  const handleToggleFavorite = (movie: GhibliMovie) => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    if (favoriteIds.has(movie.id)) {
      removeFavoriteMutation.mutate({ ghibliMovieId: movie.id });
      setFavoriteIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(movie.id);
        return newSet;
      });
    } else {
      addFavoriteMutation.mutate({
        ghibliMovieId: movie.id,
        title: movie.title,
        description: movie.description,
        releaseDate: movie.release_date,
        runningTime: movie.running_time,
      });
      setFavoriteIds((prev) => new Set(prev).add(movie.id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-900">
            Filmes do Studio Ghibli
          </h1>
          <p className="text-lg text-slate-600">
            Descubra e salve seus filmes favoritos
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Buscar filmes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-10"
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-800">Erro: {error}</p>
            </CardContent>
          </Card>
        )}

        {/* Movies Grid */}
        {!loading && !error && (
          <>
            <p className="text-sm text-slate-600">
              {filteredMovies.length} filme(s) encontrado(s)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMovies.map((movie) => (
                <Card
                  key={movie.id}
                  className="hover:shadow-lg transition-shadow overflow-hidden flex flex-col"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="line-clamp-2">{movie.title}</CardTitle>
                    <CardDescription>
                      {movie.release_date} • {movie.running_time} min
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1 space-y-4">
                    <p className="text-sm text-slate-700 line-clamp-3">
                      {movie.description}
                    </p>
                    <div className="space-y-2 text-xs text-slate-600">
                      <p>
                        <span className="font-semibold">Diretor:</span> {movie.director}
                      </p>
                      <p>
                        <span className="font-semibold">Produtor:</span> {movie.producer}
                      </p>
                      <p>
                        <span className="font-semibold">Avaliação:</span> {movie.rt_score}%
                      </p>
                    </div>
                    <Button
                      onClick={() => handleToggleFavorite(movie)}
                      variant={
                        favoriteIds.has(movie.id) ? "default" : "outline"
                      }
                      className="w-full mt-4"
                      disabled={
                        addFavoriteMutation.isPending ||
                        removeFavoriteMutation.isPending
                      }
                    >
                      <Heart
                        className={`w-4 h-4 mr-2 ${
                          favoriteIds.has(movie.id) ? "fill-current" : ""
                        }`}
                      />
                      {favoriteIds.has(movie.id)
                        ? "Remover dos Favoritos"
                        : "Adicionar aos Favoritos"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredMovies.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-600 text-lg">
                  Nenhum filme encontrado com essa busca.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
