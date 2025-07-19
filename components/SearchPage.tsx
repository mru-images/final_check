import React, { useState } from 'react';
import { Search, Music, Plus } from 'lucide-react';
import { Song } from '@/types';
import { useTheme } from '@/components/ThemeContext';
import SongCard from './SongCard';

interface SearchPageProps {
  songs: Song[];
  onSongPlay: (song: Song) => void;
  formatNumber: (num: number) => string;
  onAddToPlaylist: (song: Song) => void;
  onAddToQueue: (song: Song) => void;
  imageUrls: Record<string, string>;
  setImageUrls: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}


const SearchPage: React.FC<SearchPageProps> = ({ songs, onSongPlay, formatNumber, onAddToPlaylist, onAddToQueue, imageUrls,setImageUrls }) => {
  const { isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSongs, setSelectedSongs] = useState<Song[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [displayCount, setDisplayCount] = useState(10);

  
  // Get suggestions based on current search query
  const suggestions = searchQuery.trim() 
    ? songs.filter(song =>
        song.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 8) // Limit to 8 suggestions
    : [];

  const displayedSelectedSongs = selectedSongs.slice(0, displayCount);
  const hasMoreSongs = displayCount < selectedSongs.length;

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowSuggestions(value.trim().length > 0);
    
    // If search is cleared, reset everything
    if (value.trim() === '') {
      setSelectedSongs([]);
      setHasSearched(false);
      setDisplayCount(10);
    }
  };

  const handleSuggestionClick = (song: Song) => {
    setSearchQuery(song.name);
    setShowSuggestions(false);
    performSearch(song.name);
  };

  const performSearch = async (query: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) return;

    const filtered = songs.filter(song =>
      song.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    setSelectedSongs(filtered);
    setHasSearched(true);
    setDisplayCount(10);
    setShowSuggestions(false);

    // Preload images for search results
    const missingUrls: Record<string, string> = {};
    for (const song of filtered.slice(0, 10)) {
      if (!imageUrls[song.id]) {
        missingUrls[song.id] = `/api/image-proxy?fileid=${song.img_id}`;
      }
    }

    if (Object.keys(missingUrls).length > 0) {
      setImageUrls(prev => ({ ...prev, ...missingUrls }));
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performSearch(searchQuery);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const loadMore = () => {
    setDisplayCount(prev => prev + 10);
  };

  // Handle clicking outside to close suggestions
  const handleSearchContainerBlur = (e: React.FocusEvent) => {
    // Delay hiding suggestions to allow for suggestion clicks
    setTimeout(() => {
      setShowSuggestions(false);
    }, 150);
  };

  const filteredSongs = songs.filter(song =>
    song.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );


  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header */}
      <div className={`sticky top-0 ${isDarkMode ? 'bg-gray-900/95' : 'bg-gray-50/95'} backdrop-blur-md z-10 px-4 py-4`}>
        <h1 className="text-2xl font-bold mb-4">Search</h1>
        
        {/* Search Bar */}
        <div className="relative" onBlur={handleSearchContainerBlur}>
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} size={20} />
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="What do you want to listen to?"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(searchQuery.trim().length > 0)}
              className={`w-full ${isDarkMode ? 'bg-gray-800' : 'bg-white border border-gray-200'} rounded-full py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
            />
          </form>

          {/* Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className={`absolute top-full left-0 right-0 mt-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-lg max-h-64 overflow-y-auto z-20`}>
              {suggestions.map((song) => (
                <button
                  key={song.id}
                  onClick={() => handleSuggestionClick(song)}
                  className={`w-full flex items-center p-3 ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors text-left`}
                >
                  <img
                    src={imageUrls[song.id] || `/api/image-proxy?fileid=${song.img_id}`}
                    alt={song.name}
                    className="w-10 h-10 rounded-lg object-cover mr-3"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} truncate`}>
                      {song.name}
                    </h4>
                    <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} text-sm truncate`}>
                      {song.artist}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        {!hasSearched ? (
          <>
            {/* Browse Categories */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Browse all</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Pop', color: 'from-pink-500 to-purple-500' },
                  { name: 'Rock', color: 'from-red-500 to-orange-500' },
                  { name: 'Hip-Hop', color: 'from-yellow-500 to-green-500' },
                  { name: 'Electronic', color: 'from-blue-500 to-indigo-500' },
                  { name: 'Jazz', color: 'from-purple-500 to-pink-500' },
                  { name: 'Classical', color: 'from-gray-500 to-gray-700' }
                ].map((category, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSearchQuery(category.name);
                      performSearch(category.name);
                    }}
                    className={`relative p-4 rounded-lg bg-gradient-to-br ${category.color} h-24 overflow-hidden transition-transform hover:scale-105`}
                  >
                    <h3 className="font-semibold text-white">{category.name}</h3>
                    <Music className="absolute bottom-2 right-2 text-white/50" size={32} />
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div>
            <h2 className="text-lg font-semibold mb-4">
              {selectedSongs.length > 0 ? `Found ${selectedSongs.length} results for "${searchQuery}"` : 'No results found'}
            </h2>

            {selectedSongs.length > 0 ? (
              <div className="space-y-3">
                {displayedSelectedSongs.map(song => (
                  <SongCard
                    key={song.id}
                    song={song}
                    onPlay={onSongPlay}
                    formatNumber={formatNumber}
                    onAddToPlaylist={onAddToPlaylist}
                    onAddToQueue={onAddToQueue}
                    cachedImageUrl={imageUrls[song.id]}
                  />
                ))}
              </div>
            ) : null}

            {hasMoreSongs && (
              <div className="flex justify-center mt-6">
                <button
                  onClick={loadMore}
                  className={`flex items-center space-x-2 px-6 py-3 ${isDarkMode ? 'bg-gray-800 hover:bg-gray-700 border-gray-700' : 'bg-white hover:bg-gray-50 border-gray-200'} border rounded-full transition-colors`}
                >
                  <Plus size={18} className="text-purple-400" />
                  <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>Load More</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
