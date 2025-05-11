import { Star, Bookmark, Clock, Info, Heart } from "lucide-react";

const MovieCard = ({
  movie,
  onSelectMovie,
  isBookmarked,
  onToggleBookmark,
  viewMode,
}) => {
  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "/api/placeholder/300/450";

  const releaseYear = movie.release_date?.substring(0, 4) || "N/A";
  const rating = movie.vote_average?.toFixed(1) || "N/A";
  const language = movie.original_language?.toUpperCase() || "N/A";

  const handleBookmark = (e) => {
    e.stopPropagation();
    onToggleBookmark(movie.id);
  };

  if (viewMode === "list") {
    return (
      <li
        className="movie-card flex bg-dark-100 rounded-xl overflow-hidden shadow-md cursor-pointer hover:bg-dark-100/70 transition-colors"
        onClick={() => onSelectMovie(movie.id)}
      >
        <img
          src={posterUrl}
          alt={movie.title || "Movie poster"}
          className="w-24 h-36 object-cover"
          loading="lazy"
        />
        <div className="flex flex-col justify-between flex-grow p-4">
          <div>
            <h3 className="text-lg font-semibold text-white">
              {movie.title || "Untitled"}
            </h3>
            <div className="flex items-center text-sm text-gray-300 gap-2 mt-1">
              <span>{language}</span>
              <span>•</span>
              <span>{releaseYear}</span>
            </div>
            {movie.overview && (
              <p className="text-sm text-gray-400 line-clamp-2 mt-2">
                {movie.overview}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1">
              <Star size={16} className="text-yellow-400" fill="#facc15" />
              <span className="text-sm font-medium text-white">{rating}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-1 text-sm text-gray-300 hover:text-white"
                onClick={handleBookmark}
              >
                {isBookmarked ? (
                  <Heart size={16} className="text-red-500" fill="#ef4444" />
                ) : (
                  <Bookmark size={16} className="text-gray-300" />
                )}
                <span>{isBookmarked ? "Saved" : "Save"}</span>
              </button>
              <button
                className="flex items-center gap-1 text-sm text-gray-300 hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectMovie(movie.id);
                }}
              >
                <Info size={16} />
                <span>Details</span>
              </button>
            </div>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li
      className="movie-card relative cursor-pointer transition-transform hover:scale-105 bg-dark-100 rounded-2xl overflow-hidden shadow-md"
      onClick={() => onSelectMovie(movie.id)}
    >
      <div className="relative">
        <img
          src={posterUrl}
          alt={movie.title || "Movie poster"}
          className="w-full aspect-[2/3] object-cover"
          loading="lazy"
        />

        <div className="absolute top-3 right-3 bg-black/70 rounded-full p-1 flex items-center gap-1">
          <Star size={14} className="text-yellow-400" />
          <span className="text-xs font-bold text-white">{rating}</span>
        </div>

        <button
          className="absolute top-3 left-3 bg-black/70 rounded-full p-2 hover:bg-black/90"
          onClick={handleBookmark}
        >
          {isBookmarked ? (
            <Heart size={16} className="text-red-500" fill="#ef4444" />
          ) : (
            <Bookmark size={16} className="text-white" />
          )}
        </button>

        {releaseYear === new Date().getFullYear().toString() && (
          <div className="absolute bottom-3 left-3 bg-purple-600 text-white text-xs px-2 py-1 rounded-md">
            NEW
          </div>
        )}

        {movie.adult && (
          <div className="absolute bottom-3 right-3 bg-red-500 text-white text-xs px-2 py-1 rounded-md">
            18+
          </div>
        )}
      </div>

      <div className="p-4 space-y-2">
        <h3 className="text-lg font-semibold text-white line-clamp-1">
          {movie.title || "Untitled"}
        </h3>

        <div className="flex items-center text-sm text-gray-300 gap-2">
          <span>{language}</span>
          <span>•</span>
          <span>{releaseYear}</span>
          {movie.runtime && (
            <>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Clock size={14} className="text-gray-400" />
                <span>{movie.runtime} min</span>
              </div>
            </>
          )}
        </div>
        {movie.overview && (
          <p className="text-sm text-gray-400 line-clamp-2 mt-1">
            {movie.overview}
          </p>
        )}

        <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-800">
          <div className="flex items-center gap-1">
            <Star size={16} className="text-yellow-400" fill="#facc15" />
            <span className="text-sm font-medium text-white">{rating}</span>
          </div>

          <button
            className="flex items-center gap-1 text-sm text-gray-300 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              onSelectMovie(movie.id);
            }}
          >
            <Info size={16} />
            <span>Details</span>
          </button>
        </div>
      </div>
    </li>
  );
};

export default MovieCard;
