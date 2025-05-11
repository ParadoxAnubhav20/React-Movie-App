import { useEffect, useState } from "react";
import Search from "./components/Search.jsx";
import Spinner from "./components/Spinner.jsx";
import MovieCard from "./components/MovieCard.jsx";
import MovieDetails from "./components/MovieDetails.jsx";
import { useDebounce } from "react-use";
import { getTrendingMovies, updateSearchCount } from "./appwrite.js";
import {
  Film,
  TrendingUp,
  X,
  Filter,
  Grid3X3,
  List,
  PlusCircle,
  Bookmark,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: `Bearer ${API_KEY}`,
  },
};

const GENRES = [
  { id: 28, name: "Action" },
  { id: 35, name: "Comedy" },
  { id: 18, name: "Drama" },
  { id: 27, name: "Horror" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" },
];

const App = () => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [trendingMovies, setTrendingMovies] = useState([]);

  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [activeGenre, setActiveGenre] = useState(null);
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [bookmarkedMovies, setBookmarkedMovies] = useState(() => {
    const savedBookmarks = localStorage.getItem("bookmarkedMovies");
    return savedBookmarks ? JSON.parse(savedBookmarks) : [];
  });
  const [showBookmarked, setShowBookmarked] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [trendingScrollPosition, setTrendingScrollPosition] = useState(0);

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  const fetchMovies = async (query = "", pageNum = 1) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      let endpoint = "";

      if (query) {
        endpoint = `${API_BASE_URL}/search/movie?query=${encodeURIComponent(
          query
        )}&page=${pageNum}`;
      } else {
        endpoint = `${API_BASE_URL}/discover/movie?sort_by=${sortBy}&page=${pageNum}`;

        if (activeGenre) {
          endpoint += `&with_genres=${activeGenre}`;
        }
      }

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }

      const data = await response.json();

      if (data.Response === "False") {
        setErrorMessage(data.Error || "Failed to fetch movies");
        setMovieList([]);
        return;
      }

      if (pageNum > 1) {
        setMovieList((prev) => [...prev, ...(data.results || [])]);
      } else {
        setMovieList(data.results || []);
      }

      setTotalPages(data.total_pages || 0);

      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage("Error fetching movies. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
    } catch (error) {
      console.error(`Error fetching trending movies: ${error}`);
    }
  };

  const handleSelectMovie = (movieId) => {
    setSelectedMovieId(movieId);
    document.body.style.overflow = "hidden";
  };

  const handleCloseMovieDetails = () => {
    setSelectedMovieId(null);
    document.body.style.overflow = "auto";
  };

  const handleSelectTrendingMovie = async (movieId) => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/movie/${movieId}`,
        API_OPTIONS
      );

      if (!response.ok) {
        throw new Error("Failed to fetch movie details");
      }

      handleSelectMovie(movieId);
    } catch (error) {
      console.error(`Error fetching movie details: ${error}`);
      setErrorMessage("Error fetching movie details. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBookmark = (movieId) => {
    setBookmarkedMovies((prevBookmarks) => {
      const updatedBookmarks = prevBookmarks.includes(movieId)
        ? prevBookmarks.filter((id) => id !== movieId)
        : [...prevBookmarks, movieId];

      // Save to localStorage
      localStorage.setItem(
        "bookmarkedMovies",
        JSON.stringify(updatedBookmarks)
      );
      return updatedBookmarks;
    });
  };

  const handleGenreFilter = (genreId) => {
    setActiveGenre(activeGenre === genreId ? null : genreId);
    setPage(1);
  };

  const handleSortChange = (sortOption) => {
    setSortBy(sortOption);
    setPage(1);
  };

  const loadMoreMovies = () => {
    const nextPage = page + 1;
    if (nextPage <= totalPages) {
      setPage(nextPage);
      fetchMovies(debouncedSearchTerm, nextPage);
    }
  };

  const scrollTrending = (direction) => {
    const container = document.getElementById("trending-container");
    if (container) {
      const scrollAmount = container.clientWidth * 0.75;
      const newPosition =
        direction === "left"
          ? Math.max(0, trendingScrollPosition - scrollAmount)
          : trendingScrollPosition + scrollAmount;

      container.scrollTo({
        left: newPosition,
        behavior: "smooth",
      });
      setTrendingScrollPosition(newPosition);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm, sortBy, activeGenre]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  useEffect(() => {
    localStorage.setItem("bookmarkedMovies", JSON.stringify(bookmarkedMovies));
  }, [bookmarkedMovies]);

  const displayedMovies = showBookmarked
    ? movieList.filter((movie) => bookmarkedMovies.includes(movie.id))
    : movieList;

  return (
    <main className="bg-primary">
      <div className="pattern" />

      <div className="wrapper">
        <header>
          <div className="flex justify-between items-center mb-6">
            <img src="./hero.png" alt="Hero Banner" className="max-w-lg" />

            <button
              className={`p-2 rounded-full ${
                showBookmarked ? "bg-light-100/30" : "bg-dark-100"
              } hover:bg-light-100/20`}
              onClick={() => setShowBookmarked(!showBookmarked)}
              aria-label="Toggle bookmarked movies"
            >
              <Bookmark size={20} className="text-white" />
            </button>
          </div>

          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy
            Without the Hassle
          </h1>

          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        {/* Improved Trending movies section */}
        {trendingMovies.length > 0 &&
          !showBookmarked &&
          !debouncedSearchTerm && (
            <section className="trending mt-10 mb-12">
              <div className="flex justify-between items-center mb-5">
                <h2 className="flex items-center gap-2">
                  <TrendingUp size={24} className="text-light-100" />
                  Trending Movies
                </h2>

                <div className="flex gap-2">
                  <button
                    onClick={() => scrollTrending("left")}
                    className="p-1.5 rounded-full bg-dark-100 hover:bg-light-100/20"
                    aria-label="Scroll left"
                  >
                    <ChevronLeft size={20} className="text-white" />
                  </button>
                  <button
                    onClick={() => scrollTrending("right")}
                    className="p-1.5 rounded-full bg-dark-100 hover:bg-light-100/20"
                    aria-label="Scroll right"
                  >
                    <ChevronRight size={20} className="text-white" />
                  </button>
                </div>
              </div>

              <div
                id="trending-container"
                className="relative overflow-x-auto hide-scrollbar rounded-lg"
              >
                <ul className="flex gap-4 min-w-max pb-2">
                  {trendingMovies.map((movie, index) => (
                    <li
                      key={movie.$id}
                      onClick={() => handleSelectTrendingMovie(movie.movie_id)}
                      className="cursor-pointer hover:scale-105 transition-transform"
                    >
                      <div className="relative group">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-end justify-center">
                          <p className="text-white text-sm font-medium px-2 pb-2 text-center truncate max-w-full">
                            {movie.title}
                          </p>
                        </div>
                        <div className="absolute top-2 left-2 bg-black/70 rounded-full w-6 h-6 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">
                            {index + 1}
                          </span>
                        </div>
                        <img
                          src={movie.poster_url}
                          alt={movie.title}
                          className="w-32 h-48 object-cover rounded-lg shadow-md"
                          loading="lazy"
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

        <section className="all-movies">
          <div className="flex flex-wrap justify-between items-center mb-6">
            <h2 className="flex items-center gap-2">
              <Film size={24} className="text-light-100" />
              {showBookmarked ? "Bookmarked Movies" : "All Movies"}
            </h2>

            <div className="flex items-center gap-4">
              <div className="flex bg-dark-100 rounded-lg p-1">
                <button
                  className={`p-2 rounded ${
                    viewMode === "grid" ? "bg-light-100/20" : ""
                  }`}
                  onClick={() => setViewMode("grid")}
                  aria-label="Grid view"
                >
                  <Grid3X3 size={18} className="text-white" />
                </button>
                <button
                  className={`p-2 rounded ${
                    viewMode === "list" ? "bg-light-100/20" : ""
                  }`}
                  onClick={() => setViewMode("list")}
                  aria-label="List view"
                >
                  <List size={18} className="text-white" />
                </button>
              </div>

              <button
                className="flex items-center gap-2 px-3 py-2 bg-dark-100 rounded-lg hover:bg-light-100/10"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                aria-expanded={isFilterOpen}
                aria-controls="filters-panel"
              >
                <Filter size={18} className="text-white" />
                <span className="text-white">Filters</span>
              </button>
            </div>
          </div>

          {isFilterOpen && (
            <div id="filters-panel" className="mb-6 p-4 bg-dark-100 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-white">
                  Filters & Sort
                </h3>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  aria-label="Close filters"
                >
                  <X size={20} className="text-gray-400 hover:text-white" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-gray-300 mb-2">Genre</h4>
                  <div className="flex flex-wrap gap-2">
                    {GENRES.map((genre) => (
                      <button
                        key={genre.id}
                        className={`px-3 py-1 rounded-full text-sm ${
                          activeGenre === genre.id
                            ? "bg-light-100/30 text-white"
                            : "bg-dark-100 border border-gray-700 text-gray-300 hover:border-gray-500"
                        }`}
                        onClick={() => handleGenreFilter(genre.id)}
                        aria-pressed={activeGenre === genre.id}
                      >
                        {genre.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-gray-300 mb-2">Sort By</h4>
                  <select
                    className="w-full bg-dark-100 border border-gray-700 text-white rounded-md p-2"
                    value={sortBy}
                    onChange={(e) => handleSortChange(e.target.value)}
                    aria-label="Sort movies by"
                  >
                    <option value="popularity.desc">
                      Popularity (High to Low)
                    </option>
                    <option value="popularity.asc">
                      Popularity (Low to High)
                    </option>
                    <option value="vote_average.desc">
                      Rating (High to Low)
                    </option>
                    <option value="vote_average.asc">
                      Rating (Low to High)
                    </option>
                    <option value="release_date.desc">
                      Release Date (Newest)
                    </option>
                    <option value="release_date.asc">
                      Release Date (Oldest)
                    </option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {isLoading && page === 1 ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : displayedMovies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-gray-400 text-lg mb-4">No movies found</p>
              {showBookmarked && (
                <button
                  className="flex items-center gap-2 px-4 py-2 bg-light-100/10 rounded-lg hover:bg-light-100/20 text-white"
                  onClick={() => setShowBookmarked(false)}
                >
                  <Film size={18} />
                  Browse all movies
                </button>
              )}
            </div>
          ) : (
            <>
              <ul
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 gap-5 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                    : "flex flex-col gap-4"
                }
              >
                {displayedMovies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onSelectMovie={handleSelectMovie}
                    isBookmarked={bookmarkedMovies.includes(movie.id)}
                    onToggleBookmark={toggleBookmark}
                    viewMode={viewMode}
                  />
                ))}
              </ul>
              {!isLoading && !showBookmarked && page < totalPages && (
                <div className="flex justify-center mt-8">
                  <button
                    className="flex items-center gap-2 px-6 py-3 bg-light-100/10 rounded-lg hover:bg-light-100/20 text-white"
                    onClick={loadMoreMovies}
                  >
                    <PlusCircle size={20} />
                    Load More Movies
                  </button>
                </div>
              )}

              {isLoading && page > 1 && (
                <div className="flex justify-center mt-8">
                  <Spinner />
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {selectedMovieId && (
        <MovieDetails
          movieId={selectedMovieId}
          onClose={handleCloseMovieDetails}
          isBookmarked={bookmarkedMovies.includes(selectedMovieId)}
          onToggleBookmark={() => toggleBookmark(selectedMovieId)}
        />
      )}
    </main>
  );
};

export default App;
