import { Artist, SpotifyApi, Track } from "@spotify/web-api-ts-sdk";

export interface ArtistSimilarityScore {
  artist: Artist;
  score: number;
  matchReasons: string[];
}

/**
 * Multi-factor algorithm to find artists similar to a target artist
 * using user data and artist metadata
 */
/**
 * Multi-factor algorithm to find artists similar to a target artist
 * using user data and artist metadata, with enhanced discovery
 */
export async function findRelatedArtists(
  spotifyClient: SpotifyApi,
  targetArtist: Artist,
  userTopArtists: Artist[],
  userTopTracks: Track[],
  recentlyPlayed: { track: Track; played_at: string }[]
): Promise<ArtistSimilarityScore[]> {
  // 1. First, collect all unique artist IDs from tracks and recently played
  const artistIds = new Set<string>();

  // Add the target artist ID
  artistIds.add(targetArtist.id);

  // Add all top artist IDs
  userTopArtists.forEach((artist) => {
    artistIds.add(artist.id);
  });

  // Add artist IDs from tracks
  userTopTracks.forEach((track) => {
    track.artists.forEach((artist) => {
      artistIds.add(artist.id);
    });
  });

  // Add artist IDs from recently played
  recentlyPlayed.forEach((item) => {
    item.track.artists.forEach((artist) => {
      artistIds.add(artist.id);
    });
  });

  // Remove the target artist from the set
  artistIds.delete(targetArtist.id);

  // Record which artists are in the user's top artists for later use
  const isInUserTopArtists = new Map<string, boolean>();
  userTopArtists.forEach((artist) => {
    isInUserTopArtists.set(artist.id, true);
  });

  // Also expand with genre-based discovery
  try {
    // Look for artists with similar genres that might not be in the user's library
    if (targetArtist.genres && targetArtist.genres.length > 0) {
      // Find the most specific genre (usually the longest one is more specific)
      const primaryGenre = targetArtist.genres.sort(
        (a, b) => b.length - a.length
      )[0];

      const genreResults = await spotifyClient.search(
        primaryGenre,
        ["artist"],
        undefined,
        20
      );

      // Add these artists to our candidates
      if (genreResults.artists?.items) {
        genreResults.artists.items
          .filter((artist) => artist.id !== targetArtist.id)
          .forEach((artist) => {
            artistIds.add(artist.id);
          });
      }
    }
  } catch (error) {
    console.error("Error in genre search:", error);
    // Continue even if this fails
  }

  // If still no artist IDs, return empty results
  if (artistIds.size === 0) {
    return [];
  }

  // 2. Fetch full artist data for all IDs in batches of 50 (Spotify API limit)
  const artistIdArray = Array.from(artistIds);
  const allArtists: Artist[] = [];

  // Process in batches of 50
  for (let i = 0; i < artistIdArray.length; i += 50) {
    const batch = artistIdArray.slice(i, i + 50);
    try {
      const response = await spotifyClient.artists.get(batch);
      allArtists.push(...response);
    } catch (error) {
      console.error("Error fetching artist batch:", error);
      // Continue with the artists we have
    }
  }

  // 3. Set up data structures for our algorithm
  const candidateMap = new Map<string, Artist>(); // Map artist ID to full artist object
  const scoreMap = new Map<string, number>(); // Map artist ID to similarity score
  const reasonMap = new Map<string, string[]>(); // Map artist ID to reasons for similarity

  // Initialize data structures
  allArtists.forEach((artist) => {
    candidateMap.set(artist.id, artist);
    scoreMap.set(artist.id, 0);
    reasonMap.set(artist.id, []);
  });

  // 4. Calculate genre overlap scores (0-100)
  // This remains a strong factor since we want genre similarity
  candidateMap.forEach((artist, id) => {
    if (
      !artist.genres ||
      !targetArtist.genres ||
      targetArtist.genres.length === 0
    )
      return;

    const sharedGenres = artist.genres.filter((g) =>
      targetArtist.genres.includes(g)
    );

    if (sharedGenres.length > 0) {
      // Calculate weighted genre score
      const genreScore = Math.min(
        100,
        (sharedGenres.length / Math.max(1, targetArtist.genres.length)) * 100
      );

      scoreMap.set(id, (scoreMap.get(id) || 0) + genreScore);
      reasonMap.get(id)?.push(`${sharedGenres.length} shared genres`);

      // Give extra points for genre-based similarity of less-known artists
      // as this aids discovery
      if (!isInUserTopArtists.get(id)) {
        const discoveryBonus = genreScore * 0.3; // Up to 30 bonus points for discovery
        scoreMap.set(id, (scoreMap.get(id) || 0) + discoveryBonus);
        reasonMap.get(id)?.push("discovery bonus");
      }
    }
  });

  // 5. Calculate co-listening patterns (0-80)
  // We'll reduce this factor's importance to avoid reinforcing existing preferences
  const userArtistMap = new Map<string, number>();

  // Build artist listening frequency map
  userTopTracks.forEach((track) => {
    track.artists.forEach((artist) => {
      userArtistMap.set(artist.id, (userArtistMap.get(artist.id) || 0) + 1);
    });
  });

  recentlyPlayed.forEach((item) => {
    item.track.artists.forEach((artist) => {
      userArtistMap.set(artist.id, (userArtistMap.get(artist.id) || 0) + 0.5);
    });
  });

  // Find artists frequently listened to alongside target artist
  const targetArtistFrequency = userArtistMap.get(targetArtist.id) || 0;

  if (targetArtistFrequency > 0) {
    candidateMap.forEach((artist, id) => {
      const artistFrequency = userArtistMap.get(id) || 0;
      if (artistFrequency > 0) {
        // Higher score if both artists are listened to a similar amount
        const frequencyRatio = Math.min(
          artistFrequency / targetArtistFrequency,
          targetArtistFrequency / artistFrequency
        );

        // MODIFIED: Reduce the co-listening weight for artists already in top
        // This helps us avoid just recommending artists they already know well
        const frequencyWeight = isInUserTopArtists.get(id) ? 0.4 : 0.8;
        const coListenScore = Math.min(
          60,
          frequencyRatio * 60 * frequencyWeight
        );

        scoreMap.set(id, (scoreMap.get(id) || 0) + coListenScore);
        reasonMap.get(id)?.push("listening patterns");
      } else {
        // NEW: Give points to artists that are not in the user's listening history
        // This encourages discovery of new artists with genre similarity
        const noveltyBonus = 20; // Base bonus for new artists
        scoreMap.set(id, (scoreMap.get(id) || 0) + noveltyBonus);
        reasonMap.get(id)?.push("fresh discovery");
      }
    });
  }

  // 6. Analyze temporal patterns (0-60)
  // Keeping this but with lower weight
  const targetArtistTimeData = extractTemporalData(
    targetArtist.id,
    recentlyPlayed
  );

  candidateMap.forEach((artist, id) => {
    const artistTimeData = extractTemporalData(id, recentlyPlayed);
    const temporalSimilarity = calculateTemporalSimilarity(
      targetArtistTimeData,
      artistTimeData
    );

    if (temporalSimilarity > 0) {
      // Reduce temporal similarity importance
      const temporalScore = Math.min(40, temporalSimilarity * 40);
      scoreMap.set(id, (scoreMap.get(id) || 0) + temporalScore);
      reasonMap.get(id)?.push("similar listening patterns");
    }
  });

  // 7. Calculate popularity proximity (0-40)
  candidateMap.forEach((artist, id) => {
    const popularityDiff = Math.abs(
      artist.popularity - targetArtist.popularity
    );
    // Lower difference = higher score
    const proximityScore = Math.max(0, 40 - popularityDiff * 0.8);

    if (proximityScore > 15) {
      scoreMap.set(id, (scoreMap.get(id) || 0) + proximityScore);
      reasonMap.get(id)?.push("similar popularity level");
    }

    // NEW: Add diversity bonus for recommending artists with different popularity
    // This helps avoid all recommendations being at same popularity level
    // Lower popularity artists get a bonus to encourage discovery
    if (artist.popularity < targetArtist.popularity - 10) {
      const diversityBonus = Math.min(
        30,
        (targetArtist.popularity - artist.popularity) * 0.5
      );
      scoreMap.set(id, (scoreMap.get(id) || 0) + diversityBonus);
      reasonMap.get(id)?.push("diversity bonus");
    }
  });

  // 8. Find featured on/by relationships (bonus +50 points)
  // This remains important because it identifies meaningful connections
  const targetArtistName = targetArtist.name.toLowerCase();

  candidateMap.forEach((artist, id) => {
    // Check if either artist name contains the other (suggesting a feature or collaboration)
    const artistName = artist.name.toLowerCase();

    if (
      artistName.includes(targetArtistName) ||
      targetArtistName.includes(artistName)
    ) {
      scoreMap.set(id, (scoreMap.get(id) || 0) + 50);
      reasonMap.get(id)?.push("possible collaboration relationship");
    }
  });

  // 10. Create final ranked list with balanced familiarity/discovery
  const results: ArtistSimilarityScore[] = Array.from(candidateMap.entries())
    .map(([id, artist]) => {
      // Final adjustment - balance score based on whether in top artists
      const finalScore = scoreMap.get(id) || 0;

      // If artist is already in user's top and has a very high score,
      // slightly reduce it to give other artists a chance
      const adjustedScore =
        isInUserTopArtists.get(id) && finalScore > 150
          ? finalScore * 0.9 // Reduce by 10%
          : finalScore;

      return {
        artist,
        score: adjustedScore,
        matchReasons: reasonMap.get(id) || [],
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  // Make sure we have at least some non-top-artist recommendations
  // Let's ensure at least 30% are discovery recommendations
  const topResults = results.slice(0, 20);
  const discoveryCount = topResults.filter(
    (item) => !isInUserTopArtists.get(item.artist.id)
  ).length;

  // If we don't have enough discovery results, try to find more
  // by adding a dedicated discovery section
  if (discoveryCount < 7 && results.length > 20) {
    // Get the best discovery candidates
    const discoveryResults = results
      .filter((item) => !isInUserTopArtists.get(item.artist.id))
      .slice(0, 10);

    // Replace some of the bottom results with discovery results
    const finalResults = [
      ...topResults.slice(0, 15), // Keep top 15
      ...discoveryResults.slice(0, 5), // Add 5 discovery results
    ];

    return finalResults.slice(0, 20);
  }

  return topResults.slice(0, 20);
}

// Helper functions
function extractTemporalData(
  artistId: string,
  recentlyPlayed: { track: Track; played_at: string }[]
) {
  const dayOfWeekCounts = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
  const hourCounts = Array(24).fill(0);

  recentlyPlayed
    .filter((item) => item.track.artists.some((a) => a.id === artistId))
    .forEach((item) => {
      const date = new Date(item.played_at);
      dayOfWeekCounts[date.getDay()]++;
      hourCounts[date.getHours()]++;
    });

  return { dayOfWeekCounts, hourCounts };
}

function calculateTemporalSimilarity(
  pattern1: ReturnType<typeof extractTemporalData>,
  pattern2: ReturnType<typeof extractTemporalData>
) {
  // Simple cosine similarity between temporal patterns
  // Only calculate if we have enough data points
  if (
    pattern1.dayOfWeekCounts.every((c: number) => c === 0) ||
    pattern2.dayOfWeekCounts.every((c: number) => c === 0)
  ) {
    return 0;
  }

  // Calculate day of week similarity
  const dotProduct = pattern1.dayOfWeekCounts.reduce(
    (sum: number, val: number, i: number) =>
      sum + val * pattern2.dayOfWeekCounts[i],
    0
  );

  const magnitude1 = Math.sqrt(
    pattern1.dayOfWeekCounts.reduce(
      (sum: number, val: number) => sum + val * val,
      0
    )
  );

  const magnitude2 = Math.sqrt(
    pattern2.dayOfWeekCounts.reduce(
      (sum: number, val: number) => sum + val * val,
      0
    )
  );

  if (magnitude1 === 0 || magnitude2 === 0) return 0;

  return dotProduct / (magnitude1 * magnitude2);
}
