import Button from '@/components/Button';
import { Link } from 'expo-router';
import { StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Link href="/(user)" asChild>
        <Button text="Go to User App" />
      </Link>

      <Link href="/(admin)" asChild>
        <Button text="Go to Admin App" />
      </Link>

      <Link href="/sign-in" asChild>
        <Button text="Sign in" />
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 10,
    justifyContent: 'center',
    flex: 1,
  },
});
