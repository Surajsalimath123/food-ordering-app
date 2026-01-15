import orders from '@/assets/data/orders';
import OrderListItem from '@/components/OrderListItem';
import { FlatList, View } from 'react-native';

export default function ArchivedOrdersScreen() {
  const archivedOrders = orders.filter((o) => o.status === 'Delivered');

  return (
    <View style={{ flex: 1, padding: 10, backgroundColor: 'white' }}>
      <FlatList
        data={archivedOrders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <OrderListItem order={item} />}
        contentContainerStyle={{ gap: 10 }}
      />
    </View>
  );
}
