import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, FlatList, ActivityIndicator, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { tmdbFetch, imgUrl } from '@/utils/api';

export default function HomeScreen() {
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingTv, setTrendingTv] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [movies, tv] = await Promise.all([
        tmdbFetch('/trending/movie/day'),
        tmdbFetch('/trending/tv/day')
      ]);
      setTrendingMovies(movies.results);
      setTrendingTv(tv.results);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to fetch from TMDB");
    }
    setLoading(false);
  };

  const renderHorizontalList = (title, data, type) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={data}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.hList}
        renderItem={({ item }) => (
          <Link href={`/details/${type}/${item.id}`} asChild>
            <TouchableOpacity style={styles.hCard} activeOpacity={0.7}>
              <Image 
                source={{ uri: imgUrl(item.poster_path, 'w500') || 'https://via.placeholder.com/300x450' }} 
                style={styles.hPoster} 
                contentFit="cover"
                transition={300}
              />
            </TouchableOpacity>
          </Link>
        )}
      />
    </View>
  );



  const heroItem = trendingMovies[0];

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#E50914" style={{ marginTop: 100 }} />
      ) : errorMsg ? (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <Text style={{ color: '#E50914', fontSize: 18, textAlign: 'center' }}>{errorMsg}</Text>
        </View>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
          {heroItem && (
            <Link href={`/details/movie/${heroItem.id}`} asChild>
              <TouchableOpacity activeOpacity={0.9} style={styles.heroContainer}>
                <Image 
                  source={{ uri: imgUrl(heroItem.backdrop_path || heroItem.poster_path, 'original') }}
                  style={styles.heroImage}
                  contentFit="cover"
                  transition={500}
                />
                <LinearGradient
                  colors={['transparent', '#0B0C10']}
                  style={styles.heroGradient}
                />
                <View style={styles.heroContent}>
                  <Text style={styles.heroTitle} numberOfLines={2}>{heroItem.title}</Text>
                  <Text style={styles.heroOverview} numberOfLines={2}>{heroItem.overview}</Text>
                  <View style={styles.heroPlayButton}>
                    <Text style={styles.heroPlayText}>▶ WATCH NOW</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Link>
          )}

          {renderHorizontalList('Trending Movies', trendingMovies.slice(1), 'movie')}
          {renderHorizontalList('Trending TV Shows', trendingTv, 'tv')}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0C10',
  },
  authContainer: {
    justifyContent: 'center',
    padding: 24,
  },
  authHeader: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  sub: {
    fontSize: 16,
    color: '#AAA',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#1F2833',
    color: '#FFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#E50914',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  error: {
    color: '#E50914',
    marginBottom: 16,
  },
  heroContainer: {
    width: '100%',
    height: Platform.OS === 'web' ? 450 : 400,
    position: 'relative',
    marginBottom: 20,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
  },
  heroContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroOverview: {
    fontSize: 14,
    color: '#CCC',
    marginBottom: 16,
    lineHeight: 20,
  },
  heroPlayButton: {
    backgroundColor: '#E50914',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignSelf: 'flex-start',
  },
  heroPlayText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 16,
    marginBottom: 12,
  },
  hList: {
    paddingHorizontal: 12,
  },
  hCard: {
    width: 140,
    height: 210,
    marginHorizontal: 6,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1F2833',
  },
  hPoster: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
});
