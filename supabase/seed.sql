truncate table products restart identity cascade;

insert into products (name, price, image)
values
  ('Ultimate Pepperoni', 15.00, 'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/food/peperoni.png'),
  ('ExtravaganZZa', 14.99, 'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/food/extravaganzza.png'),
  ('MeatZZa', 13.47, 'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/food/meat.png'),
  ('Margarita', 9.90, 'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/food/margarita.png'),
  ('Pacific Veggie', 12.99, 'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/food/veggie.png'),
  ('Hawaiian', 10.49, 'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/food/hawaiian.png'),
  ('Deluxe', 16.99, 'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/food/deluxe.png'),
  ('BBQ Chicken', 12.99, 'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/food/bbq.png'),
  ('6 Cheese', 13.29, 'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/food/6cheese.png'),
  ('Chicken Bacon Ranch', 13.98, 'https://notjustdev-dummy.s3.us-east-2.amazonaws.com/food/ranch.png'),
  ('Veg-LOL', 9.00, null);
