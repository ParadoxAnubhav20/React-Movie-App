import { useEffect, useState } from "react";
import {
  X,
  Star,
  Play,
  Calendar,
  Clock,
  Globe,
  ChevronLeft,
} from "lucide-react";

const MovieDetails = ({ movieId, onClose }) => {
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [showFullOverview, setShowFullOverview] = useState(false);

  const API_BASE_URL = "https://api.themoviedb.org/3";
  const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

  const API_OPTIONS = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
  };

  useEffect(() => {
    const fetchMovieDetails = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_BASE_URL}/movie/${movieId}?append_to_response=credits,videos,recommendations,similar`,
          API_OPTIONS
        );

        if (!response.ok) {
          throw new Error("Failed to fetch movie details");
        }

        const data = await response.json();
        setMovie(data);
      } catch (error) {
        console.error(`Error fetching movie details: ${error}`);
        setError("Error fetching movie details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (movieId) {
      fetchMovieDetails();

      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "auto";
      };
    }
  }, [movieId]);

  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (loading) {
    return (
      <div className="movie-details-overlay" onClick={handleBackdropClick}>
        <div className="movie-details-container max-w-3xl">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-light-100"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="movie-details-overlay" onClick={handleBackdropClick}>
        <div className="movie-details-container max-w-3xl">
          <div className="p-6">
            <div className="flex justify-end mb-4">
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-light-100/10 hover:bg-light-100/20 transition-colors"
              >
                <X size={20} className="text-light-100" />
              </button>
            </div>
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-red-500 text-lg mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto mb-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <p className="text-center">{error}</p>
              </div>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-light-100/10 hover:bg-light-100/20 rounded-lg transition-colors"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!movie) return null;

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "/placeholder.png";

  const backdropUrl = movie.backdrop_path
    ? `https://image.tmdb.org/t/p/original${movie.backdrop_path}`
    : null;

  const director = movie.credits?.crew?.find(
    (person) => person.job === "Director"
  );

  const writers =
    movie.credits?.crew
      ?.filter((person) =>
        ["Writer", "Screenplay", "Story"].includes(person.job)
      )
      .slice(0, 3) || [];

  const cast = movie.credits?.cast?.slice(0, 8) || [];

  const trailer = movie.videos?.results?.find(
    (video) => video.type === "Trailer" && video.site === "YouTube"
  );

  const videos =
    movie.videos?.results
      ?.filter((video) => video.site === "YouTube")
      .slice(0, 5) || [];

  const recommendations =
    movie.recommendations?.results?.slice(0, 6) ||
    movie.similar?.results?.slice(0, 6) ||
    [];

  const formatReleaseDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (value) => {
    if (!value || value === 0) return "Not Available";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="movie-details-overlay" onClick={handleBackdropClick}>
      <div className="movie-details-container max-w-5xl">
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
            aria-label="Close details"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {backdropUrl && (
          <div className="relative h-80 overflow-hidden rounded-t-lg">
            <img
              src={backdropUrl}
              alt={`${movie.title} backdrop`}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark-100 via-dark-100/80 to-transparent"></div>

            <div className="absolute bottom-0 left-0 w-full p-6 z-10">
              <h2 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">
                {movie.title}
              </h2>
              {movie.tagline && (
                <p className="text-light-200 italic drop-shadow-md">
                  {movie.tagline}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="movie-content pt-4 pb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3 flex flex-col gap-4">
              <div className="relative group">
                <img
                  src={posterUrl}
                  alt={movie.title}
                  className="w-full rounded-lg shadow-lg"
                />

                {trailer && (
                  <a
                    href={`https://www.youtube.com/watch?v=${trailer.key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                  >
                    <div className="bg-red-600 rounded-full p-4">
                      <Play size={30} className="text-white" />
                    </div>
                  </a>
                )}
              </div>

              <div className="bg-light-100/5 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="text-yellow-500 fill-yellow-500" size={20} />
                  <span className="text-white font-bold text-lg">
                    {movie.vote_average?.toFixed(1)}
                  </span>
                  <span className="text-light-200 text-sm">
                    ({movie.vote_count?.toLocaleString()} votes)
                  </span>
                </div>

                <div className="space-y-2 text-light-200">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{formatReleaseDate(movie.release_date)}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock size={16} />
                    <span>{movie.runtime} minutes</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Globe size={16} />
                    <span>{movie.original_language?.toUpperCase()}</span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex flex-wrap gap-2">
                    {movie.genres?.map((genre) => (
                      <span
                        key={genre.id}
                        className="bg-light-100/10 px-3 py-1 rounded-full text-sm text-light-100"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>

                {trailer && (
                  <div className="mt-4">
                    <a
                      href={`https://www.youtube.com/watch?v=${trailer.key}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-full gap-2 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      <Play size={18} />
                      Watch Trailer
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="md:w-2/3">
              <div className="border-b border-light-100/10 mb-6">
                <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`px-4 py-2 whitespace-nowrap ${
                      activeTab === "overview"
                        ? "text-light-100 border-b-2 border-light-100"
                        : "text-light-200 hover:text-light-100"
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab("cast")}
                    className={`px-4 py-2 whitespace-nowrap ${
                      activeTab === "cast"
                        ? "text-light-100 border-b-2 border-light-100"
                        : "text-light-200 hover:text-light-100"
                    }`}
                  >
                    Cast & Crew
                  </button>
                  <button
                    onClick={() => setActiveTab("videos")}
                    className={`px-4 py-2 whitespace-nowrap ${
                      activeTab === "videos"
                        ? "text-light-100 border-b-2 border-light-100"
                        : "text-light-200 hover:text-light-100"
                    }`}
                  >
                    Videos
                  </button>
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`px-4 py-2 whitespace-nowrap ${
                      activeTab === "details"
                        ? "text-light-100 border-b-2 border-light-100"
                        : "text-light-200 hover:text-light-100"
                    }`}
                  >
                    Details
                  </button>
                  {recommendations.length > 0 && (
                    <button
                      onClick={() => setActiveTab("similar")}
                      className={`px-4 py-2 whitespace-nowrap ${
                        activeTab === "similar"
                          ? "text-light-100 border-b-2 border-light-100"
                          : "text-light-200 hover:text-light-100"
                      }`}
                    >
                      Similar Movies
                    </button>
                  )}
                </div>
              </div>

              {activeTab === "overview" && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">Story</h3>
                  <p
                    className={`text-light-200 ${
                      !showFullOverview && movie.overview?.length > 300
                        ? "line-clamp-5"
                        : ""
                    }`}
                  >
                    {movie.overview || "No overview available."}
                  </p>

                  {movie.overview?.length > 300 && (
                    <button
                      onClick={() => setShowFullOverview(!showFullOverview)}
                      className="text-light-100 hover:text-white mt-2 text-sm font-medium underline"
                    >
                      {showFullOverview ? "Show Less" : "Read More"}
                    </button>
                  )}

                  {director && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-2">Director</h3>
                      <p className="text-light-200">{director.name}</p>
                    </div>
                  )}

                  {writers.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold mb-2">Writers</h3>
                      <p className="text-light-200">
                        {writers.map((writer) => writer.name).join(", ")}
                      </p>
                    </div>
                  )}

                  {cast.length > 0 && (
                    <div className="mt-6">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold">Top Cast</h3>
                        <button
                          onClick={() => setActiveTab("cast")}
                          className="text-light-100 hover:text-white text-sm"
                        >
                          View All
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {cast.slice(0, 4).map((person) => (
                          <div key={person.id} className="text-center">
                            <div className="w-16 h-16 mx-auto rounded-full bg-light-100/10 mb-2 overflow-hidden">
                              {person.profile_path ? (
                                <img
                                  src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                                  alt={person.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-light-200">
                                  {person.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <p className="text-light-100 font-medium text-sm line-clamp-1">
                              {person.name}
                            </p>
                            <p className="text-light-200 text-xs line-clamp-1">
                              {person.character}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "cast" && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Cast & Crew</h3>

                  {cast.length > 0 && (
                    <div className="mb-8">
                      <h4 className="text-lg font-medium mb-3 text-light-100">
                        Cast
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {cast.map((person) => (
                          <div key={person.id} className="text-center">
                            <div className="w-20 h-20 mx-auto rounded-full bg-light-100/10 mb-2 overflow-hidden">
                              {person.profile_path ? (
                                <img
                                  src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                                  alt={person.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-light-200 text-lg">
                                  {person.name.charAt(0)}
                                </div>
                              )}
                            </div>
                            <p className="text-light-100 font-medium text-sm">
                              {person.name}
                            </p>
                            <p className="text-light-200 text-xs">
                              {person.character}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {movie.credits?.crew && movie.credits.crew.length > 0 && (
                    <div>
                      <h4 className="text-lg font-medium mb-3 text-light-100">
                        Crew
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {movie.credits.crew
                          .filter(
                            (person, index, self) =>
                              index ===
                              self.findIndex((p) => p.id === person.id)
                          )
                          .slice(0, 10)
                          .map((person) => (
                            <div
                              key={person.id}
                              className="bg-light-100/5 p-3 rounded-lg"
                            >
                              <p className="text-light-100 font-medium">
                                {person.name}
                              </p>
                              <p className="text-light-200 text-sm">
                                {person.job}
                              </p>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "videos" && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Videos</h3>

                  {videos.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {videos.map((video) => (
                        <a
                          key={video.id}
                          href={`https://www.youtube.com/watch?v=${video.key}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block bg-light-100/5 rounded-lg overflow-hidden group"
                        >
                          <div className="relative aspect-video">
                            <img
                              src={`https://img.youtube.com/vi/${video.key}/mqdefault.jpg`}
                              alt={video.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
                              <div className="bg-red-600 rounded-full p-3">
                                <Play size={24} className="text-white" />
                              </div>
                            </div>
                          </div>
                          <div className="p-3">
                            <p className="text-light-100 font-medium line-clamp-1">
                              {video.name}
                            </p>
                            <p className="text-light-200 text-sm">
                              {video.type}
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-light-200">
                      No videos available for this movie.
                    </p>
                  )}
                </div>
              )}

              {activeTab === "details" && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Movie Details</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-light-100/5 p-4 rounded-lg">
                      <h4 className="text-light-100 font-medium mb-2">
                        Release Information
                      </h4>
                      <ul className="space-y-2 text-light-200">
                        <li className="flex justify-between">
                          <span>Release Date:</span>
                          <span>{formatReleaseDate(movie.release_date)}</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Status:</span>
                          <span>{movie.status || "Unknown"}</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Original Title:</span>
                          <span>{movie.original_title || movie.title}</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Original Language:</span>
                          <span>
                            {movie.original_language?.toUpperCase() ||
                              "Unknown"}
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-light-100/5 p-4 rounded-lg">
                      <h4 className="text-light-100 font-medium mb-2">
                        Production & Budget
                      </h4>
                      <ul className="space-y-2 text-light-200">
                        <li className="flex justify-between">
                          <span>Budget:</span>
                          <span>{formatCurrency(movie.budget)}</span>
                        </li>
                        <li className="flex justify-between">
                          <span>Revenue:</span>
                          <span>{formatCurrency(movie.revenue)}</span>
                        </li>
                        <li>
                          <span>Production Companies:</span>
                          <div className="mt-1">
                            {movie.production_companies?.map((company) => (
                              <span
                                key={company.id}
                                className="inline-block mr-2 mb-1"
                              >
                                {company.name}
                              </span>
                            )) || "Not Available"}
                          </div>
                        </li>
                      </ul>
                    </div>
                  </div>

                  {movie.belongs_to_collection && (
                    <div className="mt-4 bg-light-100/5 p-4 rounded-lg">
                      <h4 className="text-light-100 font-medium mb-2">
                        Part of Collection
                      </h4>
                      <p className="text-light-200">
                        {movie.belongs_to_collection.name}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "similar" && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">
                    {movie.recommendations?.results?.length > 0
                      ? "Recommended Movies"
                      : "Similar Movies"}
                  </h3>

                  {recommendations.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {recommendations.map((rec) => (
                        <div
                          key={rec.id}
                          className="bg-light-100/5 rounded-lg overflow-hidden"
                        >
                          <div className="aspect-[2/3] relative">
                            {rec.poster_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w342${rec.poster_path}`}
                                alt={rec.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-dark-100 text-light-200">
                                No Image
                              </div>
                            )}
                          </div>
                          <div className="p-3">
                            <h4 className="text-light-100 font-medium line-clamp-1">
                              {rec.title}
                            </h4>
                            <div className="flex items-center mt-1 text-sm text-light-200">
                              <Star
                                size={14}
                                className="text-yellow-500 fill-yellow-500 mr-1"
                              />
                              <span>{rec.vote_average?.toFixed(1)}</span>
                              <span className="mx-2">•</span>
                              <span>
                                {rec.release_date?.substring(0, 4) || "Unknown"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-light-200">
                      No similar movies available.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetails;
