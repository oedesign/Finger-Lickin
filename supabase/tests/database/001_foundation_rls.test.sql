CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;

BEGIN;

SELECT extensions.plan(46);

INSERT INTO auth.users (id, aud, role)
VALUES
  ('10000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated'),
  ('10000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated'),
  ('10000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated'),
  ('10000000-0000-4000-8000-000000000004', 'authenticated', 'authenticated');

INSERT INTO public.profiles (user_id, display_name)
VALUES
  ('10000000-0000-4000-8000-000000000001', 'Customer A'),
  ('10000000-0000-4000-8000-000000000002', 'Customer B'),
  ('10000000-0000-4000-8000-000000000003', 'Restaurant A member'),
  ('10000000-0000-4000-8000-000000000004', 'Restaurant B member');

INSERT INTO public.restaurants (id, slug, name, time_zone, status)
VALUES
  ('20000000-0000-4000-8000-000000000001', 'sample-active', 'Sample Active', 'Etc/UTC', 'active'),
  ('20000000-0000-4000-8000-000000000002', 'sample-draft', 'Sample Draft', 'Etc/UTC', 'draft');

INSERT INTO public.restaurant_memberships (restaurant_id, user_id, status, revoked_at)
VALUES
  (
    '20000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000003',
    'active',
    NULL
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000004',
    'active',
    NULL
  ),
  (
    '20000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000002',
    'revoked',
    now()
  );

INSERT INTO public.menu_categories (id, restaurant_id, name, display_order, is_active)
VALUES
  (
    '30000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    'Published category',
    0,
    true
  ),
  (
    '30000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000001',
    'Inactive category',
    1,
    false
  ),
  (
    '30000000-0000-4000-8000-000000000003',
    '20000000-0000-4000-8000-000000000002',
    'Draft restaurant category',
    0,
    true
  );

INSERT INTO public.menu_items (
  id, restaurant_id, category_id, name, price_minor_units, currency_code,
  is_published, is_available, display_order
)
VALUES
  (
    '40000000-0000-4000-8000-000000000001',
    '20000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000001',
    'Available sample item',
    1234,
    'USD',
    true,
    true,
    0
  ),
  (
    '40000000-0000-4000-8000-000000000002',
    '20000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000001',
    'Sold-out sample item',
    999,
    'USD',
    true,
    false,
    1
  ),
  (
    '40000000-0000-4000-8000-000000000003',
    '20000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000001',
    'Unpublished sample item',
    100,
    'USD',
    false,
    true,
    2
  ),
  (
    '40000000-0000-4000-8000-000000000004',
    '20000000-0000-4000-8000-000000000001',
    '30000000-0000-4000-8000-000000000002',
    'Inactive-category sample item',
    100,
    'USD',
    true,
    true,
    0
  ),
  (
    '40000000-0000-4000-8000-000000000005',
    '20000000-0000-4000-8000-000000000002',
    '30000000-0000-4000-8000-000000000003',
    'Draft restaurant sample item',
    100,
    'USD',
    true,
    true,
    0
  );

SELECT extensions.ok(
  NOT EXISTS (
    SELECT 1
    FROM pg_class AS rel
    JOIN pg_namespace AS nsp ON nsp.oid = rel.relnamespace
    WHERE nsp.nspname = 'public'
      AND rel.relname IN (
        'profiles',
        'restaurants',
        'restaurant_memberships',
        'menu_categories',
        'menu_items'
      )
      AND rel.relrowsecurity IS NOT TRUE
  ),
  'RLS is enabled on every foundation table'
);

SELECT extensions.ok(
  (
    SELECT count(*) = 5
    FROM pg_trigger AS trig
    JOIN pg_class AS rel ON rel.oid = trig.tgrelid
    JOIN pg_namespace AS nsp ON nsp.oid = rel.relnamespace
    WHERE nsp.nspname = 'public'
      AND NOT trig.tgisinternal
      AND trig.tgname LIKE '%_set_updated_at'
  ),
  'all foundation tables use the updated_at trigger'
);

SELECT extensions.ok(
  NOT has_table_privilege('anon', 'public.profiles', 'SELECT'),
  'anonymous users have no profile table access'
);
SELECT extensions.ok(
  NOT has_table_privilege('anon', 'public.restaurant_memberships', 'SELECT'),
  'anonymous users cannot read restaurant memberships'
);
SELECT extensions.ok(
  NOT has_schema_privilege('anon', 'private', 'USAGE')
    AND NOT has_schema_privilege('authenticated', 'private', 'USAGE')
    AND NOT has_function_privilege('authenticated', 'private.set_updated_at()', 'EXECUTE'),
  'client roles cannot access the private trigger function'
);
SELECT extensions.ok(
  NOT has_column_privilege('authenticated', 'public.profiles', 'user_id', 'UPDATE')
    AND NOT has_table_privilege('authenticated', 'public.profiles', 'DELETE'),
  'a customer cannot change profile identity or delete the profile'
);
SELECT extensions.ok(
  NOT has_table_privilege('authenticated', 'public.restaurant_memberships', 'INSERT')
    AND NOT has_table_privilege('authenticated', 'public.restaurant_memberships', 'UPDATE')
    AND NOT has_table_privilege('authenticated', 'public.restaurant_memberships', 'DELETE'),
  'users cannot grant, change, or delete restaurant memberships'
);
SELECT extensions.ok(
  NOT has_table_privilege('authenticated', 'public.restaurants', 'INSERT')
    AND NOT has_table_privilege('authenticated', 'public.restaurants', 'UPDATE'),
  'users cannot create, activate, or change restaurants'
);
SELECT extensions.ok(
  NOT has_table_privilege('authenticated', 'public.menu_categories', 'INSERT')
    AND NOT has_table_privilege('authenticated', 'public.menu_items', 'UPDATE'),
  'users cannot write catalog data through the client API'
);
SELECT extensions.ok(
  NOT EXISTS (
    SELECT 1
    FROM pg_class AS rel
    JOIN pg_namespace AS nsp ON nsp.oid = rel.relnamespace
    WHERE nsp.nspname = 'public'
      AND rel.relname IN ('admin_memberships', 'administrator_memberships')
      AND rel.relkind IN ('r', 'p', 'v', 'm')
  )
  AND NOT EXISTS (
    SELECT 1
    FROM pg_attribute AS attr
    JOIN pg_class AS rel ON rel.oid = attr.attrelid
    JOIN pg_namespace AS nsp ON nsp.oid = rel.relnamespace
    WHERE nsp.nspname = 'public'
      AND rel.relname = 'profiles'
      AND attr.attnum > 0
      AND NOT attr.attisdropped
      AND attr.attname IN ('role', 'is_admin', 'is_administrator')
  ),
  'the schema has no client-assignable administrator role'
);
SELECT extensions.ok(
  NOT EXISTS (
    SELECT 1
    FROM pg_class AS rel
    JOIN pg_namespace AS nsp ON nsp.oid = rel.relnamespace
    WHERE nsp.nspname = 'public'
      AND rel.relname IN (
        'public_restaurants',
        'public_menu_categories',
        'public_menu_items'
      )
      AND (
        rel.reloptions IS NULL
        OR NOT rel.reloptions @> ARRAY['security_invoker=true']
        OR NOT rel.reloptions @> ARRAY['security_barrier=true']
      )
  ),
  'every public catalog view is an invoker-security barrier view'
);

SET LOCAL ROLE anon;
SELECT extensions.is((SELECT count(*)::integer FROM public.public_restaurants), 1, 'anonymous sees only active restaurants');
SELECT extensions.is((SELECT count(*)::integer FROM public.public_menu_categories), 1, 'anonymous sees only active categories');
SELECT extensions.is((SELECT count(*)::integer FROM public.public_menu_items), 2, 'anonymous sees published items in active categories');
SELECT extensions.is(
  (SELECT count(*)::integer FROM public.public_menu_items WHERE NOT is_available),
  1,
  'public catalog preserves sold-out item visibility'
);
RESET ROLE;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
SELECT set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}',
  true
);
SELECT extensions.throws_ok(
  $$
    INSERT INTO public.restaurant_memberships (restaurant_id, user_id)
    VALUES (
      '20000000-0000-4000-8000-000000000001',
      '10000000-0000-4000-8000-000000000001'
    )
  $$,
  '42501',
  NULL,
  'a customer cannot grant themselves restaurant membership'
);
SELECT extensions.throws_ok(
  $$
    INSERT INTO public.profiles (user_id, display_name)
    VALUES (
      '10000000-0000-4000-8000-000000000002',
      'Spoofed customer profile'
    )
  $$,
  '42501',
  NULL,
  'a customer cannot create a profile for another user'
);
SELECT extensions.is((SELECT count(*)::integer FROM public.profiles), 1, 'a customer reads only their own profile');
SELECT extensions.is(
  (SELECT count(*)::integer FROM public.profiles WHERE user_id = '10000000-0000-4000-8000-000000000002'),
  0,
  'a customer cannot read another customer profile'
);
SELECT extensions.is(
  (
    WITH updated AS (
      UPDATE public.profiles
      SET display_name = 'Updated Customer A'
      WHERE user_id = '10000000-0000-4000-8000-000000000001'
      RETURNING 1
    )
    SELECT count(*)::integer FROM updated
  ),
  1,
  'a customer can update their own profile'
);
SELECT extensions.is(
  (
    WITH updated AS (
      UPDATE public.profiles
      SET display_name = 'Unauthorized change'
      WHERE user_id = '10000000-0000-4000-8000-000000000002'
      RETURNING 1
    )
    SELECT count(*)::integer FROM updated
  ),
  0,
  'a customer cannot update another customer profile'
);
SELECT extensions.is((SELECT count(*)::integer FROM public.restaurant_memberships), 0, 'a customer cannot read another user membership');
SELECT extensions.is((SELECT count(*)::integer FROM public.restaurants), 1, 'a customer reads only the public restaurant');
SELECT extensions.is((SELECT count(*)::integer FROM public.menu_categories), 1, 'a customer reads only the public category');
SELECT extensions.is((SELECT count(*)::integer FROM public.menu_items), 2, 'a customer reads only published public items');
RESET ROLE;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000003', true);
SELECT set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000003","role":"authenticated"}',
  true
);
SELECT extensions.is((SELECT count(*)::integer FROM public.restaurant_memberships), 1, 'a member reads only their own membership');
SELECT extensions.is((SELECT count(*)::integer FROM public.restaurants), 1, 'a member reads their active restaurant');
SELECT extensions.is((SELECT count(*)::integer FROM public.menu_categories), 2, 'a member reads active and inactive categories for their restaurant');
SELECT extensions.is((SELECT count(*)::integer FROM public.menu_items), 4, 'a member reads published and unpublished items for their restaurant');
SELECT extensions.is(
  (SELECT count(*)::integer FROM public.restaurants WHERE id = '20000000-0000-4000-8000-000000000002'),
  0,
  'a member cannot read another restaurant private record'
);
SELECT extensions.is(
  (SELECT count(*)::integer FROM public.menu_items WHERE restaurant_id = '20000000-0000-4000-8000-000000000002'),
  0,
  'a member cannot read another restaurant catalog'
);
RESET ROLE;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000004', true);
SELECT set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000004","role":"authenticated"}',
  true
);
SELECT extensions.is((SELECT count(*)::integer FROM public.restaurant_memberships), 1, 'a second member reads only their own membership');
SELECT extensions.is(
  (SELECT count(*)::integer FROM public.restaurants WHERE id = '20000000-0000-4000-8000-000000000002'),
  1,
  'a member can read their own non-public restaurant'
);
SELECT extensions.is(
  (SELECT count(*)::integer FROM public.menu_categories WHERE restaurant_id = '20000000-0000-4000-8000-000000000002'),
  1,
  'a member can read their own non-public catalog'
);
SELECT extensions.is((SELECT count(*)::integer FROM public.public_restaurants), 1, 'public views still exclude the member draft restaurant');
SELECT extensions.is((SELECT count(*)::integer FROM public.public_menu_items), 2, 'public views still exclude the member draft menu');
RESET ROLE;

UPDATE public.restaurant_memberships
SET status = 'revoked', revoked_at = now()
WHERE restaurant_id = '20000000-0000-4000-8000-000000000002'
  AND user_id = '10000000-0000-4000-8000-000000000004';

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000004', true);
SELECT set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000004","role":"authenticated"}',
  true
);
SELECT extensions.is(
  (SELECT count(*)::integer FROM public.restaurants WHERE id = '20000000-0000-4000-8000-000000000002'),
  0,
  'revoking an active membership immediately removes restaurant access'
);
SELECT extensions.is(
  (SELECT count(*)::integer FROM public.menu_categories WHERE restaurant_id = '20000000-0000-4000-8000-000000000002'),
  0,
  'revoking an active membership immediately removes private catalog access'
);
RESET ROLE;

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000002', true);
SELECT set_config(
  'request.jwt.claims',
  '{"sub":"10000000-0000-4000-8000-000000000002","role":"authenticated"}',
  true
);
SELECT extensions.is((SELECT count(*)::integer FROM public.restaurant_memberships), 1, 'a former member sees only their own revoked membership');
SELECT extensions.is(
  (SELECT count(*)::integer FROM public.restaurants WHERE id = '20000000-0000-4000-8000-000000000002'),
  0,
  'a revoked member cannot read the former restaurant'
);
SELECT extensions.is(
  (SELECT count(*)::integer FROM public.menu_categories WHERE restaurant_id = '20000000-0000-4000-8000-000000000002'),
  0,
  'a revoked member cannot read the former restaurant catalog'
);
SELECT extensions.is((SELECT count(*)::integer FROM public.profiles), 1, 'another customer still sees only their own profile');
RESET ROLE;

SELECT extensions.throws_ok(
  $$
    INSERT INTO public.menu_items (
      restaurant_id, category_id, name, price_minor_units, currency_code
    )
    VALUES (
      '20000000-0000-4000-8000-000000000001',
      '30000000-0000-4000-8000-000000000001',
      'Invalid currency',
      100,
      'usd'
    )
  $$,
  '23514',
  NULL,
  'currency codes must use three uppercase letters'
);
SELECT extensions.throws_ok(
  $$
    INSERT INTO public.menu_items (
      restaurant_id, category_id, name, price_minor_units, currency_code
    )
    VALUES (
      '20000000-0000-4000-8000-000000000001',
      '30000000-0000-4000-8000-000000000003',
      'Cross-restaurant category',
      100,
      'USD'
    )
  $$,
  '23503',
  NULL,
  'a menu item cannot reference another restaurant category'
);
SELECT extensions.throws_ok(
  $$
    INSERT INTO public.menu_items (
      restaurant_id, category_id, name, price_minor_units, currency_code
    )
    VALUES (
      '20000000-0000-4000-8000-000000000001',
      '30000000-0000-4000-8000-000000000001',
      'Negative price',
      -1,
      'USD'
    )
  $$,
  '23514',
  NULL,
  'menu item prices cannot be negative'
);

UPDATE public.profiles
SET updated_at = '2000-01-01T00:00:00Z'
WHERE user_id = '10000000-0000-4000-8000-000000000001';
SELECT extensions.ok(
  (
    SELECT updated_at > '2000-01-01T00:00:00Z'::timestamptz
    FROM public.profiles
    WHERE user_id = '10000000-0000-4000-8000-000000000001'
  ),
  'the updated_at trigger replaces caller-supplied timestamps'
);

SELECT * FROM extensions.finish();
ROLLBACK;
