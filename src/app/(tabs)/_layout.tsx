import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';

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
      tabBarShowLabel: false,
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <SymbolView name="house.fill" tintColor={color} size={28} fallback={<></>} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => (
            <SymbolView name="magnifyingglass" tintColor={color} size={28} fallback={<></>} />
          ),
        }}
      />
    </Tabs>
  );
}
