import orders from '@/assets/data/orders';
import OrderListItem from '@/components/OrderListItem';
import { FlatList, View } from 'react-native';

export default function ActiveOrdersScreen() {
  const activeOrders = orders.filter((o) => o.status !== 'Delivered');

  return (
    <View style={{ flex: 1, padding: 10, backgroundColor: 'white' }}>
      <FlatList
        data={activeOrders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <OrderListItem order={item} />}
        contentContainerStyle={{ gap: 10 }}
      />
    </View>
  );
}
