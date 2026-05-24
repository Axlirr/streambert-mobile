import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { 
        backgroundColor: '#0B0C10', 
        borderTopColor: '#1F2833',
        height: 60,
      },
      tabBarActiveTintColor: '#E50914',
      tabBarInactiveTintColor: '#666',
      tabBarShowLabel: true,
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" color={color} size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => (
            <Ionicons name="search" color={color} size={28} />
          ),
        }}
      />
    </Tabs>
  );
}
