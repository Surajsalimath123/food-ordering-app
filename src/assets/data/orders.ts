import type { Order } from '@/types';

const orders: Order[] = [
  {
    id: 11,
    created_at: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
    status: 'Delivering',
    order_items: [
      {
        id: 1,
        quantity: 1,
        size: 'L',
        products: {
          id: 1,
          name: 'Ultimate Pepperoni',
          price: 12.99,
          image:
            'https://images.unsplash.com/photo-1601924928580-99d6b9b6a8b0?auto=format&fit=crop&w=600&q=60',
        },
      },
    ],
  },
  {
    id: 10,
    created_at: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
    status: 'New',
    order_items: [
      {
        id: 1,
        quantity: 2,
        size: 'XL',
        products: {
          id: 2,
          name: 'From app',
          price: 243,
          image:
            'https://images.unsplash.com/photo-1548365328-8b849e6f1f5a?auto=format&fit=crop&w=600&q=60',
        },
      },
    ],
  },
];

export default orders;
