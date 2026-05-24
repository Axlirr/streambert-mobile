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

  useEffect(() => {
    fetchDetails();
  }, [type, id]);

  const fetchDetails = async () => {
    try {
      const data = await tmdbFetch(`/${type}/${id}`);
      setDetails(data);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
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
      // Default to Season 1 Episode 1 for TV shows for now
      router.push(`/player?type=tv&id=${id}&s=1&e=1`);
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
});
