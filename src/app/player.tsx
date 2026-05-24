import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { WebView } from 'react-native-webview';
import * as ScreenOrientation from 'expo-screen-orientation';
import { getSourceUrl } from '@/utils/api';

export default function PlayerScreen() {
  const router = useRouter();
  const { type, id, s, e, source = 'vidsrc' } = useLocalSearchParams();
  const [url, setUrl] = useState('');

  useEffect(() => {
    // Generate streaming URL
    const streamUrl = getSourceUrl(source, type, id, s, e);
    setUrl(streamUrl);

    // Lock to landscape if on native mobile (iOS/Android)
    if (Platform.OS !== 'web') {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).catch(()=>{});
    }

    return () => {
      // Revert orientation on exit
      if (Platform.OS !== 'web') {
        ScreenOrientation.unlockAsync().catch(()=>{});
      }
    };
  }, [type, id, s, e, source]);

  if (!url) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3C9FFE" />
      </View>
    );
  }

  const adBlockerScript = `
    (function() {
      // Hide common ad container classes
      var style = document.createElement('style');
      style.innerHTML = 'iframe[src*="ad"], .ad-container, .popup, [id*="ad"], [class*="ad"] { display: none !important; pointer-events: none !important; }';
      document.head.appendChild(style);
      
      // Override window.open to block popups natively
      window.open = function() { return null; };
    })();
    true;
  `;

  // Use a native WebView for iOS/Android, and a standard iframe for Web/PWA
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
        <Text style={styles.closeText}>✕ Close</Text>
      </TouchableOpacity>
      
      {Platform.OS === 'web' ? (
        <iframe 
          src={url} 
          style={styles.webview} 
          frameBorder="0" 
          allowFullScreen 
        />
      ) : (
        <WebView 
          source={{ uri: url }} 
          style={styles.webview}
          allowsFullscreenVideo
          allowsInlineMediaPlayback
          injectedJavaScript={adBlockerScript}
          setSupportMultipleWindows={false}
          onShouldStartLoadWithRequest={(request) => {
            // Block known ad domains and trackers on mobile
            const blocked = ['adsystem', 'popads', 'exoclick', 'doubleclick', 'onclick', 'tracking'];
            if (blocked.some(domain => request.url.includes(domain))) {
              return false;
            }
            return true;
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webview: {
    flex: 1,
    width: '100%',
    height: '100%',
    border: 'none',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 100,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  closeText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
