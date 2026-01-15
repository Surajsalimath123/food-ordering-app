import { Redirect } from 'expo-router';

export default function OrdersIndex() {
  return <Redirect href="/(admin)/orders/list" />;
}
