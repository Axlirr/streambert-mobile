import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { tmdbFetch, imgUrl } from '@/utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DetailsScreen() {
  const router = useRouter();
  const { type, id } = useLocalSearchParams();
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [episodes, setEpisodes] = useState([]);
  const [episodesLoading, setEpisodesLoading] = useState(false);

  useEffect(() => {
    fetchDetails();
  }, [type, id]);

  const fetchDetails = async () => {
    try {
      const data = await tmdbFetch(`/${type}/${id}`);
      setDetails(data);
      if (type === 'tv' && data.seasons && data.seasons.length > 0) {
        const validSeason = data.seasons.find(s => s.season_number > 0) || data.seasons[0];
        setSelectedSeason(validSeason.season_number);
      }
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (type === 'tv' && selectedSeason !== null) {
      fetchSeasonEpisodes(selectedSeason);
    }
  }, [selectedSeason, type]);

  const fetchSeasonEpisodes = async (seasonNum) => {
    setEpisodesLoading(true);
    try {
      const data = await tmdbFetch(`/tv/${id}/season/${seasonNum}`);
      setEpisodes(data.episodes || []);
    } catch (e) {
      console.log(e);
    }
    setEpisodesLoading(false);
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color="#3C9FFE" />
      </View>
    );
  }

  if (!details) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#fff' }}>Failed to load details.</Text>
      </View>
    );
  }

  const title = details.title || details.name;

  const handlePlay = () => {
    if (type === 'movie') {
      router.push(`/player?type=movie&id=${id}`);
    } else {
      router.push(`/player?type=tv&id=${id}&s=${selectedSeason}&e=1`);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Stack.Screen options={{ title: '', headerStyle: { backgroundColor: 'transparent' }, headerTransparent: true }} />
      <View style={styles.hero}>
        <Image 
          source={{ uri: imgUrl(details.backdrop_path || details.poster_path, 'original') || 'https://via.placeholder.com/500x300?text=No+Image' }}
          style={styles.backdrop}
          contentFit="cover"
        />
        <LinearGradient
          colors={['transparent', '#0B0C10']}
          style={styles.gradient}
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.metaRow}>
          {details.vote_average ? (
            <Text style={styles.rating}>⭐ {details.vote_average.toFixed(1)}</Text>
          ) : null}
          <Text style={styles.date}>{details.release_date?.substring(0, 4) || details.first_air_date?.substring(0, 4)}</Text>
          <Text style={styles.runtime}>{details.runtime ? `${details.runtime} min` : (details.number_of_episodes ? `${details.number_of_episodes} eps` : '')}</Text>
        </View>

        <TouchableOpacity style={styles.playButton} activeOpacity={0.8} onPress={handlePlay}>
          <Text style={styles.playButtonText}>▶ WATCH NOW</Text>
        </TouchableOpacity>

        <View style={styles.glassCard}>
          <Text style={styles.overview}>{details.overview}</Text>
        </View>

        {type === 'tv' && details.seasons && (
          <View style={styles.seasonsContainer}>
            <Text style={styles.sectionTitle}>EPISODES</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.seasonScroll}>
              {details.seasons.filter(s => s.season_number > 0).map(season => (
                <TouchableOpacity 
                  key={season.id} 
                  style={[styles.seasonPill, selectedSeason === season.season_number && styles.seasonPillActive]}
                  onPress={() => setSelectedSeason(season.season_number)}
                >
                  <Text style={[styles.seasonPillText, selectedSeason === season.season_number && styles.seasonPillTextActive]}>
                    Season {season.season_number}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {episodesLoading ? (
              <ActivityIndicator size="small" color="#E50914" style={{ marginTop: 20 }} />
            ) : (
              <View style={styles.episodesList}>
                {episodes.map(ep => (
                  <TouchableOpacity 
                    key={ep.id} 
                    style={styles.episodeCard}
                    activeOpacity={0.7}
                    onPress={() => router.push(`/player?type=tv&id=${id}&s=${selectedSeason}&e=${ep.episode_number}`)}
                  >
                    <Image 
                      source={{ uri: imgUrl(ep.still_path, 'w500') || 'https://via.placeholder.com/300x170?text=No+Image' }}
                      style={styles.episodeImage}
                      contentFit="cover"
                    />
                    <View style={styles.episodeInfo}>
                      <Text style={styles.episodeNumber}>E{ep.episode_number}</Text>
                      <Text style={styles.episodeTitle} numberOfLines={1}>{ep.name}</Text>
                      <Text style={styles.episodeOverview} numberOfLines={2}>{ep.overview || "No description available."}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0C10',
  },
  hero: {
    height: 350,
    width: '100%',
    position: 'relative',
  },
  backdrop: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  content: {
    padding: 20,
    marginTop: -80,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  rating: {
    color: '#E50914',
    fontWeight: 'bold',
    fontSize: 14,
  },
  date: {
    color: '#AAA',
    fontSize: 14,
  },
  runtime: {
    color: '#AAA',
    fontSize: 14,
  },
  playButton: {
    backgroundColor: '#E50914',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#E50914',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  playButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  glassCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  overview: {
    color: '#DDD',
    fontSize: 15,
    lineHeight: 24,
  },
  seasonsContainer: {
    marginTop: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 16,
    letterSpacing: 1,
  },
  seasonScroll: {
    marginBottom: 20,
  },
  seasonPill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#1F2833',
    marginRight: 10,
  },
  seasonPillActive: {
    backgroundColor: '#E50914',
  },
  seasonPillText: {
    color: '#AAA',
    fontWeight: 'bold',
  },
  seasonPillTextActive: {
    color: '#FFF',
  },
  episodesList: {
    gap: 16,
  },
  episodeCard: {
    flexDirection: 'row',
    backgroundColor: '#151A22',
    borderRadius: 12,
    overflow: 'hidden',
    height: 100,
    borderWidth: 1,
    borderColor: '#1F2833',
  },
  episodeImage: {
    width: 150,
    height: '100%',
  },
  episodeInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  episodeNumber: {
    color: '#E50914',
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 4,
  },
  episodeTitle: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 4,
  },
  episodeOverview: {
    color: '#888',
    fontSize: 12,
    lineHeight: 16,
  },
});
