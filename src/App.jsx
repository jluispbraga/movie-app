import React, { useState, useEffect, createContext, useContext } from "react";
import { Search, Heart, User, Film, LogOut, Home } from "lucide-react";

const AuthContext = createContext(null);

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = (email, password) => {
    const mockUser = { id: "1", name: "Studio Ghibli Fan", email };
    setUser(mockUser);
    return Promise.resolve(mockUser);
  };

  const register = (name, email, password) => {
    const mockUser = { id: "1", name, email };
    setUser(mockUser);
    return Promise.resolve(mockUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const config = {
  apiUrl:
    typeof process !== "undefined" && process.env?.REACT_APP_API_URL
      ? process.env.REACT_APP_API_URL
      : "https://ghibliapi.vercel.app/films",
};

const ghibliAPI = {
  async getFilms() {
    const response = await fetch(config.apiUrl);
    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }
    return await response.json();
  },

  async searchFilms(query) {
    const films = await this.getFilms();
    return films.filter((film) =>
      film.title.toLowerCase().includes(query.toLowerCase())
    );
  },
};

const favoritesStore = { favorites: {} };

const favoritesManager = {
  getFavorites(userId) {
    return favoritesStore.favorites[userId] || [];
  },

  addFavorite(userId, filmId) {
    if (!favoritesStore.favorites[userId]) {
      favoritesStore.favorites[userId] = [];
    }
    if (!favoritesStore.favorites[userId].includes(filmId)) {
      favoritesStore.favorites[userId].push(filmId);
    }
    return favoritesStore.favorites[userId];
  },

  removeFavorite(userId, filmId) {
    if (!favoritesStore.favorites[userId]) return [];
    favoritesStore.favorites[userId] = favoritesStore.favorites[userId].filter(
      (id) => id !== filmId
    );
    return favoritesStore.favorites[userId];
  },

  isFavorite(userId, filmId) {
    const favorites = this.getFavorites(userId);
    return favorites.includes(filmId);
  },
};

const MovieCard = ({ movie, onToggleFavorite, isFavorite }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-64 bg-gray-200">
        {!imageError ? (
          <img
            src={movie.image}
            alt={movie.title}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Film className="w-16 h-16 text-gray-400" />
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-900 mb-1">{movie.title}</h3>
        <p className="text-sm text-gray-600 mb-3">
          {movie.release_date} • {movie.running_time} min
        </p>

        <p className="text-gray-700 text-sm mb-3 line-clamp-3">
          {movie.description}
        </p>

        <div className="space-y-1 text-sm text-gray-600 mb-4">
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

        <button
          onClick={() => onToggleFavorite(movie.id)}
          className={`w-full py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors ${
            isFavorite
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
          {isFavorite ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
        </button>
      </div>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const LoginScreen = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      await login(email, password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Film className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Ghibli Movies</h1>
          <p className="text-gray-600 mt-2">Entre para salvar seus favoritos</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {loading ? "Entrando..." : "Dev Login"}
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onSwitchToRegister}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Não tem conta? Cadastre-se
          </button>
        </div>
      </div>
    </div>
  );
};

const RegisterScreen = ({ onSwitchToLogin }) => {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !password) return;
    setLoading(true);
    try {
      await register(name, email, password);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Film className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Criar Conta</h1>
          <p className="text-gray-600 mt-2">
            Junte-se aos fãs do Studio Ghibli
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400"
          >
            {loading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            Já tem conta? Faça login
          </button>
        </div>
      </div>
    </div>
  );
};

const Navbar = ({ currentView, onNavigate }) => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Film className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">
              Ghibli Movies
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate("home")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                currentView === "home"
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline">Início</span>
            </button>

            <button
              onClick={() => onNavigate("favorites")}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                currentView === "favorites"
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Heart className="w-5 h-5" />
              <span className="hidden sm:inline">Favoritos</span>
            </button>

            <div className="flex items-center gap-2 text-gray-700">
              <User className="w-5 h-5" />
              <span className="hidden sm:inline">{user?.name}</span>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const HomeScreen = () => {
  const { user } = useAuth();
  const [films, setFilms] = useState([]);
  const [filteredFilms, setFilteredFilms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadFilms();
    loadFavorites();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredFilms(films);
    } else {
      const filtered = films.filter((film) =>
        film.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFilms(filtered);
    }
  }, [searchQuery, films]);

  const loadFilms = async () => {
    setLoading(true);
    try {
      const data = await ghibliAPI.getFilms();
      setFilms(data);
      setFilteredFilms(data);
    } catch (error) {
      setFilms([]);
      setFilteredFilms([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = () => {
    const userFavorites = favoritesManager.getFavorites(user.id);
    setFavorites(userFavorites);
  };

  const handleToggleFavorite = (filmId) => {
    const isFav = favoritesManager.isFavorite(user.id, filmId);
    if (isFav) {
      favoritesManager.removeFavorite(user.id, filmId);
    } else {
      favoritesManager.addFavorite(user.id, filmId);
    }
    loadFavorites();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Filmes do Studio Ghibli
          </h1>
          <p className="text-gray-600">
            Descubra e salve seus filmes favoritos
          </p>
        </div>

        <div className="mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar filmes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <p className="text-gray-600 mb-6">
          {filteredFilms.length} filme(s) encontrado(s)
        </p>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFilms.map((film) => (
              <MovieCard
                key={film.id}
                movie={film}
                onToggleFavorite={handleToggleFavorite}
                isFavorite={favorites.includes(film.id)}
              />
            ))}
          </div>
        )}

        {!loading && filteredFilms.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nenhum filme encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};

const FavoritesScreen = () => {
  const { user } = useAuth();
  const [favoriteFilms, setFavoriteFilms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const allFilms = await ghibliAPI.getFilms();
      const userFavorites = favoritesManager.getFavorites(user.id);
      const favFilms = allFilms.filter((film) =>
        userFavorites.includes(film.id)
      );
      setFavoriteFilms(favFilms);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = (filmId) => {
    favoritesManager.removeFavorite(user.id, filmId);
    loadFavorites();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Meus Favoritos
          </h1>
          <p className="text-gray-600">
            Seus filmes favoritos do Studio Ghibli
          </p>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : favoriteFilms.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              Você ainda não tem favoritos
            </p>
            <p className="text-gray-400 mt-2">
              Adicione filmes aos favoritos na página inicial
            </p>
          </div>
        ) : (
          <>
            <p className="text-gray-600 mb-6">
              {favoriteFilms.length} filme(s) favorito(s)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteFilms.map((film) => (
                <MovieCard
                  key={film.id}
                  movie={film}
                  onToggleFavorite={handleToggleFavorite}
                  isFavorite={true}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const App = () => {
  const [authView, setAuthView] = useState("login");
  const [currentView, setCurrentView] = useState("home");

  return (
    <AuthProvider>
      <AuthContent
        authView={authView}
        setAuthView={setAuthView}
        currentView={currentView}
        setCurrentView={setCurrentView}
      />
    </AuthProvider>
  );
};

const AuthContent = ({
  authView,
  setAuthView,
  currentView,
  setCurrentView,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return authView === "login" ? (
      <LoginScreen onSwitchToRegister={() => setAuthView("register")} />
    ) : (
      <RegisterScreen onSwitchToLogin={() => setAuthView("login")} />
    );
  }

  return (
    <>
      <Navbar currentView={currentView} onNavigate={setCurrentView} />
      {currentView === "home" ? <HomeScreen /> : <FavoritesScreen />}
    </>
  );
};

export default App;
