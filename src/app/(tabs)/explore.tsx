import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { tmdbFetch, imgUrl } from '@/utils/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ExploreScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length > 2) {
      const delayDebounceFn = setTimeout(() => {
        searchTmdb(query);
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setResults([]);
    }
  }, [query]);

  const searchTmdb = async (q) => {
    setLoading(true);
    try {
      const data = await tmdbFetch(`/search/multi?query=${encodeURIComponent(q)}`);
      const filtered = data.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');
      setResults(filtered);
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
  };

  const renderItem = ({ item }) => (
    <Link href={`/details/${item.media_type}/${item.id}`} asChild>
      <TouchableOpacity style={styles.card} activeOpacity={0.8}>
        <Image 
          source={{ uri: imgUrl(item.poster_path, 'w500') || 'https://via.placeholder.com/500x750?text=No+Poster' }} 
          style={styles.poster} 
          contentFit="cover"
          transition={300}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.9)']}
          style={styles.gradient}
        >
          <Text style={styles.title} numberOfLines={2}>
            {item.title || item.name}
          </Text>
          <Text style={styles.mediaType}>{item.media_type === 'tv' ? 'TV Series' : 'Movie'}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </Link>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={{flex: 1}} edges={['top', 'left', 'right']}>
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Explore</Text>
          <TextInput
            style={styles.input}
            placeholder="Search movies, TV shows..."
            placeholderTextColor="#888"
            value={query}
            onChangeText={setQuery}
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#3C9FFE" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            contentContainerStyle={styles.list}
            renderItem={renderItem}
            ListEmptyComponent={
              <Text style={styles.emptyText}>
                {query.trim().length > 2 ? 'No results found.' : 'Discover your next favorite show.'}
              </Text>
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  headerContainer: {
    padding: 16,
    paddingTop: 8,
  },
  header: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#FFF',
    padding: 16,
    borderRadius: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  list: {
    padding: 8,
    paddingBottom: 100,
  },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    overflow: 'hidden',
    aspectRatio: 2 / 3,
    borderWidth: 1,
    borderColor: '#222',
  },
  poster: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
    justifyContent: 'flex-end',
    padding: 12,
  },
  title: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  mediaType: {
    color: '#3C9FFE',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
});
