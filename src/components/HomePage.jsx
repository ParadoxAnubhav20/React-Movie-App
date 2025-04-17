import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Search from "../components/Search";
import Spinner from "../components/Spinner";
import MovieCard from "../components/MovieCard";
import MovieDetails from "../components/MovieDetails";
import { useDebounce } from "react-use";
import { getTrendingMovies, updateSearchCount } from "../appwrite";
import {
  ArrowLeft,
  ArrowRight,
  Star,
  Filter,
  X,
  ChevronDown,
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
  { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" },
  { id: 18, name: "Drama" },
  { id: 14, name: "Fantasy" },
  { id: 27, name: "Horror" },
  { id: 9648, name: "Mystery" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" },
];

const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Popularity" },
  { value: "vote_average.desc", label: "Rating" },
  { value: "release_date.desc", label: "Release Date" },
  { value: "revenue.desc", label: "Revenue" },
];

const HomePage = () => {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [movieList, setMovieList] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [year, setYear] = useState("");
  const [popularMovies, setPopularMovies] = useState([]);

  const navigate = useNavigate();
  const trendingRef = useRef(null);
  const filtersRef = useRef(null);
  const sortRef = useRef(null);

  // Debounce the search term
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  // Handle clicks outside of filters
  useEffect(() => {
    function handleClickOutside(event) {
      if (filtersRef.current && !filtersRef.current.contains(event.target)) {
        setShowFilters(false);
      }
      if (sortRef.current && !sortRef.current.contains(event.target)) {
        setShowSortDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchMovies = async (query = "", page = 1) => {
    setIsLoading(true);
    setErrorMessage("");

    try {
      let endpoint = "";
      const queryParams = new URLSearchParams();
      queryParams.append("page", page);

      if (query) {
        endpoint = `${API_BASE_URL}/search/movie`;
        queryParams.append("query", query);
      } else {
        endpoint = `${API_BASE_URL}/discover/movie`;
        queryParams.append("sort_by", sortBy);

        if (selectedGenres.length > 0) {
          queryParams.append("with_genres", selectedGenres.join(","));
        }

        if (year) {
          queryParams.append("primary_release_year", year);
        }
      }

      const response = await fetch(`${endpoint}?${queryParams}`, API_OPTIONS);

      if (!response.ok) {
        throw new Error("Failed to fetch movies");
      }

      const data = await response.json();

      if (data.Response === "False") {
        setErrorMessage(data.Error || "Failed to fetch movies");
        setMovieList([]);
        return;
      }

      setMovieList(data.results || []);
      setTotalPages(Math.min(data.total_pages || 0, 500));
      setCurrentPage(data.page || 1);

      if (query && data.results?.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage("Error fetching movies. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPopularMovies = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/movie/popular?language=en-US&page=1`,
        API_OPTIONS
      );

      if (!response.ok) {
        throw new Error("Failed to fetch popular movies");
      }

      const data = await response.json();
      setPopularMovies(data.results?.slice(0, 4) || []);
    } catch (error) {
      console.error(`Error fetching popular movies: ${error}`);
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
    setSelectedMovie(movieId);
  };

  const handleCloseDetails = () => {
    setSelectedMovie(null);
  };

  const handleGenreToggle = (genreId) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId]
    );
  };

  const handleClearFilters = () => {
    setSelectedGenres([]);
    setYear("");
    setSortBy("popularity.desc");
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const scrollTrending = (direction) => {
    if (trendingRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      trendingRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const applyFilters = () => {
    setCurrentPage(1);
    fetchMovies(debouncedSearchTerm, 1);
    setShowFilters(false);
  };

  useEffect(() => {
    fetchMovies(debouncedSearchTerm, currentPage);
  }, [debouncedSearchTerm, currentPage, sortBy, selectedGenres, year]);

  useEffect(() => {
    loadTrendingMovies();
    fetchPopularMovies();
  }, []);

  return (
    <main>
      <div className="pattern" />

      {selectedMovie && (
        <MovieDetails movieId={selectedMovie} onClose={handleCloseDetails} />
      )}

      <div className="wrapper">
        <header>
          <img src="/hero.png" alt="Hero Banner" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy
            Without the Hassle
          </h1>

          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

          {/* Popular movie recommendations */}
          {!searchTerm && popularMovies.length > 0 && (
            <div className="mt-4 max-w-lg mx-auto">
              <p className="text-light-200 text-center mb-2">
                Popular right now:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {popularMovies.map((movie) => (
                  <button
                    key={movie.id}
                    onClick={() => setSearchTerm(movie.title)}
                    className="bg-light-100/10 hover:bg-light-100/20 px-3 py-1 rounded-full text-sm text-light-100 transition-colors"
                  >
                    {movie.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending relative">
            <div className="flex justify-between items-center mb-4">
              <h2>Trending Movies</h2>

              <div className="flex gap-2">
                <button
                  onClick={() => scrollTrending("left")}
                  className="p-2 rounded-full bg-light-100/10 hover:bg-light-100/20 transition-colors"
                  aria-label="Scroll left"
                >
                  <ArrowLeft size={20} className="text-light-100" />
                </button>
                <button
                  onClick={() => scrollTrending("right")}
                  className="p-2 rounded-full bg-light-100/10 hover:bg-light-100/20 transition-colors"
                  aria-label="Scroll right"
                >
                  <ArrowRight size={20} className="text-light-100" />
                </button>
              </div>
            </div>

            <ul ref={trendingRef}>
              {trendingMovies.map((movie, index) => (
                <li
                  key={movie.$id}
                  onClick={() => handleSelectMovie(movie.movie_id)}
                  className="cursor-pointer hover:scale-105 transition-all group relative"
                >
                  <p>{index + 1}</p>
                  <div className="relative">
                    <img
                      src={movie.poster_url}
                      alt={movie.title}
                      className="group-hover:brightness-75 transition-all"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-dark-100/80 rounded-full p-2">
                        <Star
                          size={18}
                          className="text-yellow-500 fill-yellow-500"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2 transition-opacity">
                    <p className="text-white text-sm font-medium line-clamp-1">
                      {movie.title}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all-movies">
          <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
            <h2>
              {debouncedSearchTerm
                ? `Search Results for "${debouncedSearchTerm}"`
                : "All Movies"}
            </h2>

            <div className="flex gap-3 items-center">
              {/* Sort dropdown */}
              <div ref={sortRef} className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-2 bg-light-100/10 hover:bg-light-100/20 px-4 py-2 rounded-lg transition-colors"
                >
                  <span>Sort</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      showSortDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showSortDropdown && (
                  <div className="absolute right-0 top-full mt-2 bg-dark-100 rounded-lg shadow-lg z-20 w-48">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value);
                          setShowSortDropdown(false);
                          setCurrentPage(1);
                        }}
                        className={`block w-full text-left px-4 py-2 hover:bg-light-100/10 transition-colors ${
                          sortBy === option.value
                            ? "text-light-100 font-medium bg-light-100/5"
                            : "text-light-200"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Filter button */}
              <div ref={filtersRef} className="relative">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 bg-light-100/10 hover:bg-light-100/20 px-4 py-2 rounded-lg transition-colors"
                >
                  <Filter size={16} />
                  <span>Filter</span>
                  {(selectedGenres.length > 0 || year) && (
                    <span className="flex items-center justify-center bg-light-100 text-dark-100 rounded-full h-5 w-5 text-xs font-bold">
                      {selectedGenres.length + (year ? 1 : 0)}
                    </span>
                  )}
                </button>

                {/* Filter panel */}
                {showFilters && (
                  <div className="absolute right-0 top-full mt-2 bg-dark-100 rounded-lg shadow-lg z-20 w-72 p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Filters</h3>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="text-light-200 hover:text-light-100"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="mb-4">
                      <label className="block text-light-100 mb-2">
                        Release Year
                      </label>
                      <input
                        type="number"
                        min="1900"
                        max={new Date().getFullYear()}
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        placeholder="Filter by year"
                        className="w-full bg-light-100/5 px-4 py-2 rounded-lg text-light-100 placeholder-light-200/50 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-light-100 mb-2">
                        Genres
                      </label>
                      <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
                        {GENRES.map((genre) => (
                          <button
                            key={genre.id}
                            onClick={() => handleGenreToggle(genre.id)}
                            className={`px-3 py-1 rounded-full text-sm transition-colors ${
                              selectedGenres.includes(genre.id)
                                ? "bg-light-100 text-dark-100 font-medium"
                                : "bg-light-100/10 text-light-200 hover:bg-light-100/20"
                            }`}
                          >
                            {genre.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-6">
                      <button
                        onClick={handleClearFilters}
                        className="flex-1 px-4 py-2 bg-light-100/5 hover:bg-light-100/10 rounded-lg transition-colors"
                      >
                        Clear
                      </button>
                      <button
                        onClick={applyFilters}
                        className="flex-1 px-4 py-2 bg-light-100 hover:bg-light-100/80 text-dark-100 font-medium rounded-lg transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <Spinner />
            </div>
          ) : errorMessage ? (
            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-lg text-center">
              <p className="text-red-400">{errorMessage}</p>
            </div>
          ) : movieList.length === 0 ? (
            <div className="bg-light-100/5 p-8 rounded-lg text-center">
              <div className="mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto text-light-200/50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-light-100 mb-2">
                No movies found
              </h3>
              <p className="text-light-200">
                {debouncedSearchTerm
                  ? `We couldn't find any movies matching "${debouncedSearchTerm}"`
                  : "Try adjusting your filters to see more results"}
              </p>
              {(debouncedSearchTerm || selectedGenres.length > 0 || year) && (
                <button
                  onClick={handleClearFilters}
                  className="mt-4 px-4 py-2 bg-light-100/10 hover:bg-light-100/20 rounded-lg transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <ul className="grid grid-cols-1 gap-5 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {movieList.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onSelectMovie={handleSelectMovie}
                  />
                ))}
              </ul>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-10 gap-2">
                  <button
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md ${
                      currentPage === 1
                        ? "text-light-200/50 cursor-not-allowed"
                        : "text-light-100 hover:bg-light-100/10"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414z"
                        clipRule="evenodd"
                      />
                      <path
                        fillRule="evenodd"
                        d="M9.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-md ${
                      currentPage === 1
                        ? "text-light-200/50 cursor-not-allowed"
                        : "text-light-100 hover:bg-light-100/10"
                    }`}
                  >
                    <ArrowLeft size={20} />
                  </button>

                  <div className="flex items-center gap-1">
                    {/* Dynamic page links */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={i}
                          onClick={() => handlePageChange(pageNum)}
                          className={`h-8 w-8 flex items-center justify-center rounded-md ${
                            currentPage === pageNum
                              ? "bg-light-100 text-dark-100 font-medium"
                              : "text-light-200 hover:bg-light-100/10"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <span className="text-light-200">...</span>
                        <button
                          onClick={() => handlePageChange(totalPages)}
                          className="h-8 w-8 flex items-center justify-center rounded-md text-light-200 hover:bg-light-100/10"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-md ${
                      currentPage === totalPages
                        ? "text-light-200/50 cursor-not-allowed"
                        : "text-light-100 hover:bg-light-100/10"
                    }`}
                  >
                    <ArrowRight size={20} />
                  </button>
                  <button
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-md ${
                      currentPage === totalPages
                        ? "text-light-200/50 cursor-not-allowed"
                        : "text-light-100 hover:bg-light-100/10"
                    }`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 15.707a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L8.586 10l-4.293 4.293a1 1 0 000 1.414z"
                        clipRule="evenodd"
                      />
                      <path
                        fillRule="evenodd"
                        d="M10.293 15.707a1 1 0 001.414 0l5-5a1 1 0 000-1.414l-5-5a1 1 0 00-1.414 1.414L14.586 10l-4.293 4.293a1 1 0 000 1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
};

export default HomePage;
