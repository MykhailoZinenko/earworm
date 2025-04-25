// src/components/dashboard/EnhancedTopItems.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { Artist, Track, AudioFeatures } from "@spotify/web-api-ts-sdk";
import { PlusCircle, Play, ExternalLink, Clock, Volume2 } from "lucide-react";
import Link from "next/link";

interface TopItemsProps {
  timeRange?: "short_term" | "medium_term" | "long_term";
}

export function EnhancedTopItems({ timeRange = "short_term" }: TopItemsProps) {
  const { spotifyClient } = useAuth();
  const [topArtists, setTopArtists] = useState<Artist[]>([]);
  const [topTracks, setTopTracks] = useState<Track[]>([]);
  const [audioFeatures, setAudioFeatures] = useState<
    Record<string, AudioFeatures>
  >({});
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"artists" | "tracks">("artists");
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const artistContainerRef = useRef<HTMLDivElement>(null);

  const timeRangeLabels = {
    short_term: "Last 4 Weeks",
    medium_term: "Last 6 Months",
    long_term: "All Time",
  };

  useEffect(() => {
    const fetchTopItems = async () => {
      if (!spotifyClient) return;

      setIsLoading(true);
      try {
        // Fetch top artists and tracks in parallel
        const [artistsResponse, tracksResponse] = await Promise.all([
          spotifyClient.currentUser.topItems("artists", timeRange, 10),
          spotifyClient.currentUser.topItems("tracks", timeRange, 10),
        ]);

        setTopArtists(artistsResponse.items);
        setTopTracks(tracksResponse.items);

        // Set first artist as selected
        if (artistsResponse.items.length > 0) {
          setSelectedArtist(artistsResponse.items[0]);
        }

        // Get audio features for tracks
        if (tracksResponse.items.length > 0) {
          const trackIds = tracksResponse.items.map((track) => track.id);
          const featuresResponse = await spotifyClient.tracks.audioFeatures(
            trackIds
          );

          // Create a map of track ID to audio features
          const featuresMap: Record<string, AudioFeatures> = {};
          featuresResponse.forEach((feature) => {
            if (feature) {
              featuresMap[feature.id] = feature;
            }
          });

          setAudioFeatures(featuresMap);
        }
      } catch (error) {
        console.error("Error fetching top items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopItems();
  }, [spotifyClient, timeRange]);

  // Function to calculate dynamic background style based on artist image
  const getArtistBackgroundStyle = (artist: Artist) => {
    if (!artist.images || artist.images.length === 0) {
      return {};
    }

    return {
      backgroundImage: `linear-gradient(to bottom, rgba(18, 18, 18, 0.7), rgba(18, 18, 18, 1)), url(${artist.images[0].url})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
    };
  };

  // Function to calculate audio feature percentage
  const getFeaturePercentage = (
    trackId: string,
    feature: keyof AudioFeatures
  ) => {
    if (
      !audioFeatures[trackId] ||
      typeof audioFeatures[trackId][feature] !== "number"
    ) {
      return 0;
    }
    return Math.round((audioFeatures[trackId][feature] as number) * 100);
  };

  // Function to get feature color based on value
  const getFeatureColor = (value: number) => {
    if (value > 66) return "bg-[#1ED760]";
    if (value > 33) return "bg-[#FFA500]";
    return "bg-[#FF4500]";
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-t-[#1ED760] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-[#B3B3B3]">Loading your top music...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex border-b border-[#333]">
        <button
          onClick={() => setActiveTab("artists")}
          className={`px-6 py-3 text-lg font-medium relative ${
            activeTab === "artists"
              ? "text-white"
              : "text-[#B3B3B3] hover:text-white"
          }`}
        >
          Top Artists
          {activeTab === "artists" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1ED760]"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab("tracks")}
          className={`px-6 py-3 text-lg font-medium relative ${
            activeTab === "tracks"
              ? "text-white"
              : "text-[#B3B3B3] hover:text-white"
          }`}
        >
          Top Tracks
          {activeTab === "tracks" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1ED760]"></div>
          )}
        </button>
        <div className="ml-auto flex items-center px-3">
          <span className="text-sm text-[#B3B3B3] mr-2">Time Range:</span>
          <div className="bg-[#282828] rounded-full px-3 py-1 text-sm font-medium">
            {timeRangeLabels[timeRange]}
          </div>
        </div>
      </div>

      {/* Artists Tab Content */}
      {activeTab === "artists" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Artist Grid */}
          <div
            className="lg:col-span-2 bg-[#121212] rounded-xl p-4 h-[500px] overflow-y-auto"
            ref={artistContainerRef}
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {topArtists.map((artist, index) => (
                <div
                  key={artist.id}
                  className={`relative group cursor-pointer rounded-lg overflow-hidden transition-all duration-300 ${
                    selectedArtist?.id === artist.id
                      ? "ring-2 ring-[#1ED760]"
                      : ""
                  } ${hoveredItemId === artist.id ? "scale-105" : "scale-100"}`}
                  onClick={() => setSelectedArtist(artist)}
                  onMouseEnter={() => setHoveredItemId(artist.id)}
                  onMouseLeave={() => setHoveredItemId(null)}
                >
                  <div className="absolute top-2 left-2 z-10 bg-black/60 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {index + 1}
                  </div>

                  {artist.images && artist.images.length > 0 ? (
                    <img
                      src={artist.images[0].url}
                      alt={artist.name}
                      className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full aspect-square bg-[#333] flex items-center justify-center">
                      <span className="text-xl">🎵</span>
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-3">
                    <h3 className="font-bold text-white line-clamp-1">
                      {artist.name}
                    </h3>
                    <p className="text-xs text-[#B3B3B3] capitalize">
                      {artist.genres?.slice(0, 2).join(", ") || "No genres"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Selected Artist Details */}
          {selectedArtist && (
            <div
              className="bg-[#121212] rounded-xl overflow-hidden h-[500px] relative transition-colors duration-500"
              style={getArtistBackgroundStyle(selectedArtist)}
            >
              <div className="absolute inset-0 p-6 flex flex-col">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-black/30 px-3 py-1 rounded-full text-xs font-medium">
                      ARTIST SPOTLIGHT
                    </div>
                    <Link
                      href={`/dashboard/artist/${selectedArtist.id}`}
                      className="bg-black/30 p-2 rounded-full hover:bg-black/50 transition-colors"
                    >
                      <ExternalLink size={14} />
                    </Link>
                  </div>

                  <div className="mt-auto">
                    <h2 className="text-3xl font-bold mb-1">
                      {selectedArtist.name}
                    </h2>
                    <div className="flex items-center mb-2">
                      <div className="text-sm bg-[#1ED760] text-black px-2 py-0.5 rounded-full font-medium">
                        {selectedArtist.followers?.total.toLocaleString()}{" "}
                        followers
                      </div>
                    </div>

                    {selectedArtist.genres &&
                      selectedArtist.genres.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2 mb-4">
                          {selectedArtist.genres.slice(0, 4).map((genre) => (
                            <span
                              key={genre}
                              className="bg-white/10 px-2 py-0.5 rounded-full text-xs capitalize"
                            >
                              {genre.replace(/-/g, " ")}
                            </span>
                          ))}
                        </div>
                      )}
                  </div>
                </div>

                <div className="mt-auto">
                  <div className="flex items-center gap-3">
                    <button className="bg-[#1ED760] hover:bg-[#1ED760]/90 text-black font-medium px-6 py-3 rounded-full flex items-center gap-2">
                      <Play size={18} className="fill-black" /> Play Top Songs
                    </button>
                    <button className="bg-transparent border border-white/30 hover:border-white text-white px-4 py-3 rounded-full flex items-center gap-2">
                      <PlusCircle size={18} /> Follow
                    </button>
                  </div>

                  <div className="mt-4 text-sm text-[#B3B3B3]">
                    Popularity score:
                    <div className="w-full bg-white/10 h-1.5 rounded-full mt-1 overflow-hidden">
                      <div
                        className="bg-[#1ED760] h-full rounded-full"
                        style={{ width: `${selectedArtist.popularity}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tracks Tab Content */}
      {activeTab === "tracks" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {topTracks.slice(0, 2).map((track, index) => (
              <div
                key={track.id}
                className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#333] to-[#1E1E1E] p-5 hover:shadow-xl transition-all duration-300"
                onMouseEnter={() => setHoveredItemId(track.id)}
                onMouseLeave={() => setHoveredItemId(null)}
              >
                <div className="flex">
                  <div className="relative min-w-[120px] h-[120px] mr-5">
                    <img
                      src={track.album.images?.[0]?.url || "/placeholder.png"}
                      alt={track.name}
                      className="w-full h-full object-cover rounded-md shadow-lg"
                    />
                    <div
                      className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-300 ${
                        hoveredItemId === track.id ? "opacity-100" : "opacity-0"
                      }`}
                    >
                      <button className="bg-[#1ED760] rounded-full p-3">
                        <Play size={24} className="fill-black" />
                      </button>
                    </div>
                    <div className="absolute top-0 left-0 bg-[#121212]/80 text-white text-xs font-bold p-1 px-2 rounded-br-md">
                      #{index + 1}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/dashboard/track/${track.id}`}
                      className="text-xl font-bold hover:underline line-clamp-1"
                    >
                      {track.name}
                    </Link>
                    <Link
                      href={`/dashboard/artist/${track.artists[0].id}`}
                      className="text-[#B3B3B3] hover:text-[#1ED760] transition-colors"
                    >
                      {track.artists.map((a) => a.name).join(", ")}
                    </Link>

                    <div className="flex items-center gap-2 mt-3 text-sm">
                      <div className="flex items-center text-[#B3B3B3]">
                        <Clock size={14} className="mr-1" />
                        {Math.floor(track.duration_ms / 60000)}:
                        {((track.duration_ms % 60000) / 1000)
                          .toFixed(0)
                          .padStart(2, "0")}
                      </div>
                      <div className="text-[#B3B3B3]">•</div>
                      <div className="text-[#B3B3B3] truncate">
                        {track.album.name}
                      </div>
                    </div>

                    {audioFeatures[track.id] && (
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-[#B3B3B3]">Energy</span>
                            <span className="text-white">
                              {getFeaturePercentage(track.id, "energy")}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getFeatureColor(
                                getFeaturePercentage(track.id, "energy")
                              )}`}
                              style={{
                                width: `${getFeaturePercentage(
                                  track.id,
                                  "energy"
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-[#B3B3B3]">Dance</span>
                            <span className="text-white">
                              {getFeaturePercentage(track.id, "danceability")}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getFeatureColor(
                                getFeaturePercentage(track.id, "danceability")
                              )}`}
                              style={{
                                width: `${getFeaturePercentage(
                                  track.id,
                                  "danceability"
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-[#B3B3B3]">Mood</span>
                            <span className="text-white">
                              {getFeaturePercentage(track.id, "valence")}%
                            </span>
                          </div>
                          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getFeatureColor(
                                getFeaturePercentage(track.id, "valence")
                              )}`}
                              style={{
                                width: `${getFeaturePercentage(
                                  track.id,
                                  "valence"
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Track List Table */}
          <div className="bg-[#121212] rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-[#232323] text-[#B3B3B3] text-sm">
                <tr>
                  <th className="p-4 w-[60px]">#</th>
                  <th className="p-4">Track</th>
                  <th className="p-4">Album</th>
                  <th className="p-4 text-right">
                    <Clock size={16} />
                  </th>
                  <th className="p-4 w-[100px] text-center">Energy</th>
                </tr>
              </thead>
              <tbody>
                {topTracks.slice(2).map((track, index) => (
                  <tr
                    key={track.id}
                    className={`border-b border-[#333] hover:bg-white/5 ${
                      hoveredItemId === track.id ? "bg-white/5" : ""
                    }`}
                    onMouseEnter={() => setHoveredItemId(track.id)}
                    onMouseLeave={() => setHoveredItemId(null)}
                  >
                    <td className="p-4 text-[#B3B3B3]">{index + 3}</td>
                    <td className="p-4">
                      <div className="flex items-center">
                        <div className="relative w-10 h-10 mr-3 flex-shrink-0">
                          <img
                            src={
                              track.album.images?.[0]?.url || "/placeholder.png"
                            }
                            alt={track.name}
                            className="w-full h-full object-cover rounded"
                          />
                          {hoveredItemId === track.id && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                              <Play size={16} className="fill-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/dashboard/track/${track.id}`}
                            className="font-medium hover:underline"
                          >
                            {track.name}
                          </Link>
                          <div>
                            <Link
                              href={`/dashboard/artist/${track.artists[0].id}`}
                              className="text-sm text-[#B3B3B3] hover:text-[#1ED760] transition-colors"
                            >
                              {track.artists.map((a) => a.name).join(", ")}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-[#B3B3B3]">
                      <span className="line-clamp-1">{track.album.name}</span>
                    </td>
                    <td className="p-4 text-right text-[#B3B3B3]">
                      {Math.floor(track.duration_ms / 60000)}:
                      {((track.duration_ms % 60000) / 1000)
                        .toFixed(0)
                        .padStart(2, "0")}
                    </td>
                    <td className="p-4">
                      {audioFeatures[track.id] && (
                        <div className="flex items-center justify-center gap-1">
                          <Volume2 size={14} className="text-[#B3B3B3]" />
                          <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getFeatureColor(
                                getFeaturePercentage(track.id, "energy")
                              )}`}
                              style={{
                                width: `${getFeaturePercentage(
                                  track.id,
                                  "energy"
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
