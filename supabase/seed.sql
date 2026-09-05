-- Ruhh bakery: seed with the real menu from the prototype.
-- Chocolate Bark prices are still pending; they are seeded as unavailable
-- until prices are entered in the admin panel.

update settings set
  whatsapp_number = '971500000000',
  instagram_handle = 'ruhh.dubai',
  pickup_address = 'Dubai (address shared on confirmation)',
  bank_details = 'Bank transfer details are shared on WhatsApp once your order is confirmed.',
  default_lead_time_hours = 24
where id = 1;

insert into categories (name, sort_order, lead_time_hours) values
  ('Cookies', 1, 4),
  ('Chocolate Barks', 2, 24),
  ('Tiramisu', 3, 24),
  ('Mono Cheesecakes', 4, 24),
  ('Cheesecakes', 5, 48),
  ('Tea Cakes', 6, 24);

insert into delivery_zones (name, fee_aed, min_order_aed, sort_order) values
  ('Downtown / Business Bay / DIFC', 15, 0, 1),
  ('Dubai Marina / JBR / JLT', 20, 0, 2),
  ('Jumeirah / Umm Suqeim / Al Safa', 15, 0, 3),
  ('Al Barsha / Motor City / Sports City', 20, 0, 4),
  ('Deira / Bur Dubai / Karama', 20, 0, 5),
  ('Mirdif / Silicon Oasis / Academic City', 25, 60, 6),
  ('Arabian Ranches / Damac Hills / Dubailand', 30, 80, 7),
  ('Other Dubai area (fee confirmed on WhatsApp)', 30, 0, 99);

-- Helper to insert an item with sizes and flavours in one go.
create or replace function seed_item(
  p_cat text, p_name text, p_desc text, p_emoji text, p_mixable boolean, p_sort int,
  p_sizes jsonb, p_flavours text[], p_available boolean default true
) returns void language plpgsql as $$
declare
  v_cat uuid; v_item uuid; s jsonb; i int := 0; f text;
begin
  select id into v_cat from categories where name = p_cat;
  insert into menu_items (category_id, name, description, emoji, mixable, sort_order, is_available)
    values (v_cat, p_name, p_desc, p_emoji, p_mixable, p_sort, p_available) returning id into v_item;
  for s in select * from jsonb_array_elements(p_sizes) loop
    i := i + 1;
    insert into item_sizes (item_id, label, piece_count, price_aed, sort_order)
      values (v_item, s->>'label', coalesce((s->>'count')::int, 1), (s->>'price')::numeric, i);
  end loop;
  i := 0;
  foreach f in array p_flavours loop
    i := i + 1;
    insert into item_flavours (item_id, name, sort_order) values (v_item, f, i);
  end loop;
end $$;

-- Cookies
select seed_item('Cookies', 'Build Your Own Cookie Box', 'Pick a box and mix the flavours', '🍪', true, 1,
  '[{"label":"Box of 6","count":6,"price":60},{"label":"Box of 12","count":12,"price":110}]',
  array['Dark Chocolate Chip','Milk Chocolate Chip','White Chocolate Chip']);
select seed_item('Cookies', 'Dark Chocolate Chip Cookies', 'Rich dark chocolate chunks', '🍪', false, 2,
  '[{"label":"Box of 6","count":6,"price":60},{"label":"Box of 12","count":12,"price":110}]', array[]::text[]);
select seed_item('Cookies', 'Milk Chocolate Chip Cookies', 'Classic milk chocolate', '🍪', false, 3,
  '[{"label":"Box of 6","count":6,"price":60},{"label":"Box of 12","count":12,"price":110}]', array[]::text[]);
select seed_item('Cookies', 'White Chocolate Chip Cookies', 'Creamy white chocolate', '🍪', false, 4,
  '[{"label":"Box of 6","count":6,"price":60},{"label":"Box of 12","count":12,"price":110}]', array[]::text[]);

-- Chocolate Barks (prices pending → unavailable until set in admin)
select seed_item('Chocolate Barks', 'Build Your Own Bark Box', 'Pick a box and mix the bark flavours', '🍫', true, 1,
  '[{"label":"Box of 3 bars","count":3,"price":0},{"label":"Box of 6 bars","count":6,"price":0}]',
  array['Milk + Pistachio','Dark + Orange Rind','White + Nuts'], false);
select seed_item('Chocolate Barks', 'Milk Chocolate with Pistachio', 'Milk chocolate, roasted pistachio', '🍫', false, 2,
  '[{"label":"100g","price":0},{"label":"250g","price":0},{"label":"500g","price":0},{"label":"1Kg","price":0}]', array[]::text[], false);
select seed_item('Chocolate Barks', 'Dark Chocolate with Orange Rind', 'Dark chocolate, candied orange', '🍫', false, 3,
  '[{"label":"100g","price":0},{"label":"250g","price":0},{"label":"500g","price":0},{"label":"1Kg","price":0}]', array[]::text[], false);
select seed_item('Chocolate Barks', 'White Chocolate with Nuts', 'White chocolate, mixed nuts', '🍫', false, 4,
  '[{"label":"100g","price":0},{"label":"250g","price":0},{"label":"500g","price":0},{"label":"1Kg","price":0}]', array[]::text[], false);

-- Tiramisu
select seed_item('Tiramisu', 'Classic Tiramisu', 'Espresso-soaked layers, mascarpone, cocoa', '☕', false, 1,
  '[{"label":"250g","price":35},{"label":"500g","price":85},{"label":"1Kg","price":160}]', array[]::text[]);

-- Mono Cheesecakes
select seed_item('Mono Cheesecakes', 'Biscoff Mono Cheesecake', 'Single-serve, Biscoff crumb', '🧁', false, 1,
  '[{"label":"Single serve","price":35}]', array[]::text[]);
select seed_item('Mono Cheesecakes', 'Nutella Mono Cheesecake', 'Single-serve, Nutella swirl', '🧁', false, 2,
  '[{"label":"Single serve","price":35}]', array[]::text[]);
select seed_item('Mono Cheesecakes', 'Baked New York Mono Cheesecake', 'Single-serve, classic baked', '🧁', false, 3,
  '[{"label":"Single serve","price":35}]', array[]::text[]);

-- Cheesecakes
select seed_item('Cheesecakes', 'Biscoff Cheesecake', 'Biscoff base & topping', '🍰', false, 1,
  '[{"label":"500g","price":85},{"label":"1Kg","price":160}]', array[]::text[]);
select seed_item('Cheesecakes', 'Nutella Cheesecake', 'Rich Nutella filling', '🍰', false, 2,
  '[{"label":"500g","price":85},{"label":"1Kg","price":160}]', array[]::text[]);
select seed_item('Cheesecakes', 'Baked New York Cheesecake', 'Classic baked New York style', '🍰', false, 3,
  '[{"label":"500g","price":85},{"label":"1Kg","price":160}]', array[]::text[]);

-- Tea Cakes
select seed_item('Tea Cakes', 'Almond Blueberry Tea Cake', 'Almond sponge, fresh blueberries', '🫐', false, 1,
  '[{"label":"500g","price":85},{"label":"1Kg","price":165}]', array[]::text[]);
select seed_item('Tea Cakes', 'Chocolate Strawberry Tea Cake', 'Chocolate sponge, strawberry', '🍓', false, 2,
  '[{"label":"500g","price":65},{"label":"1Kg","price":110}]', array[]::text[]);
select seed_item('Tea Cakes', 'Orange Tea Cake', 'Zesty orange loaf', '🍊', false, 3,
  '[{"label":"500g","price":65},{"label":"1Kg","price":110}]', array[]::text[]);
select seed_item('Tea Cakes', 'Flourless Chocolate Cake', 'Dense, gluten-free chocolate', '🍫', false, 4,
  '[{"label":"500g","price":80},{"label":"1Kg","price":165}]', array[]::text[]);

drop function seed_item(text, text, text, text, boolean, int, jsonb, text[], boolean);

insert into specials (name, description, emoji, price_aed, tag, accent, sort_order) values
  ('Classic Tiramisu', 'Our signature 500g tiramisu — espresso-soaked layers and mascarpone cream.', '☕', 85, 'Bestseller', 'lav', 1),
  ('Biscoff Cheesecake', 'Creamy Biscoff cheesecake, 500g. A weekend favourite.', '🍰', 85, 'Popular', 'peach', 2);

-- First admin: replace with Shweta's real email before running.
insert into admin_users (email, name, added_by) values ('shweta@example.com', 'Shweta', 'seed')
on conflict (email) do nothing;
