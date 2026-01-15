import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const { Navigator } = createMaterialTopTabNavigator();

export const TopTabs = withLayoutContext(Navigator);

export default function OrdersTabsLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['top']}>
      <TopTabs>
        <TopTabs.Screen name="index" options={{ title: 'Active' }} />
        <TopTabs.Screen name="archive" options={{ title: 'Archive' }} />
      </TopTabs>
    </SafeAreaView>
  );
}
