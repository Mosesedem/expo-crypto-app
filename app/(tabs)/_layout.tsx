import { Tabs } from 'expo-router';
import { Chrome as Home, ArrowUpDown, ArrowDownToLine, ArrowUpFromLine, User } from 'lucide-react-native';
import { COLORS } from '../../constants/config';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="buy-sell"
        options={{
          title: 'Trade',
          tabBarIcon: ({ size, color }) => (
            <ArrowUpDown size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="incoming"
        options={{
          title: 'Incoming',
          tabBarIcon: ({ size, color }) => (
            <ArrowDownToLine size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="outgoing"
        options={{
          title: 'Outgoing',
          tabBarIcon: ({ size, color }) => (
            <ArrowUpFromLine size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}