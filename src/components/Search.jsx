import React from "react";

const Search = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="search">
      <div>
        <img src="search.svg" alt="search icon" />

        <input
          type="text"
          placeholder="Search through thousands of movies"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-2 text-light-200 hover:text-white text-lg font-bold"
            aria-label="Clear search"
          >
            &times;
          </button>
        )}
      </div>
    </div>
  );
};

export default Search;
