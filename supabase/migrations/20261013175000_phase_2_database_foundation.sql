CREATE SCHEMA private;

REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;

CREATE TYPE public.restaurant_status AS ENUM (
  'draft',
  'pending',
  'active',
  'suspended',
  'closed'
);

CREATE TYPE public.restaurant_membership_status AS ENUM (
  'active',
  'revoked'
);

CREATE TABLE public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_display_name_nonempty
    CHECK (display_name IS NULL OR (length(display_name) <= 120 AND btrim(display_name) <> ''))
);

CREATE TABLE public.restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  name text NOT NULL,
  description text,
  time_zone text NOT NULL,
  status public.restaurant_status NOT NULL DEFAULT 'draft',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT restaurants_slug_format
    CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  CONSTRAINT restaurants_name_nonempty
    CHECK (length(name) <= 160 AND btrim(name) <> ''),
  CONSTRAINT restaurants_description_length
    CHECK (description IS NULL OR length(description) <= 4000),
  CONSTRAINT restaurants_time_zone_nonempty
    CHECK (length(time_zone) <= 100 AND btrim(time_zone) <> ''),
  CONSTRAINT restaurants_slug_key UNIQUE (slug)
);

CREATE TABLE public.restaurant_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
  status public.restaurant_membership_status NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz,
  CONSTRAINT restaurant_memberships_restaurant_user_key
    UNIQUE (restaurant_id, user_id),
  CONSTRAINT restaurant_memberships_revoked_at_state
    CHECK (
      (status = 'active' AND revoked_at IS NULL)
      OR (status = 'revoked' AND revoked_at IS NOT NULL)
    )
);

CREATE TABLE public.menu_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES public.restaurants (id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT menu_categories_name_nonempty
    CHECK (length(name) <= 160 AND btrim(name) <> ''),
  CONSTRAINT menu_categories_description_length
    CHECK (description IS NULL OR length(description) <= 2000),
  CONSTRAINT menu_categories_display_order_nonnegative
    CHECK (display_order >= 0),
  CONSTRAINT menu_categories_id_restaurant_key
    UNIQUE (id, restaurant_id)
);

CREATE TABLE public.menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL,
  category_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  price_minor_units bigint NOT NULL,
  currency_code text NOT NULL,
  is_published boolean NOT NULL DEFAULT false,
  is_available boolean NOT NULL DEFAULT true,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT menu_items_category_restaurant_fkey
    FOREIGN KEY (category_id, restaurant_id)
    REFERENCES public.menu_categories (id, restaurant_id)
    ON DELETE CASCADE,
  CONSTRAINT menu_items_name_nonempty
    CHECK (length(name) <= 200 AND btrim(name) <> ''),
  CONSTRAINT menu_items_description_length
    CHECK (description IS NULL OR length(description) <= 4000),
  CONSTRAINT menu_items_price_nonnegative
    CHECK (price_minor_units >= 0),
  CONSTRAINT menu_items_currency_code_format
    CHECK (currency_code ~ '^[A-Z]{3}$'),
  CONSTRAINT menu_items_display_order_nonnegative
    CHECK (display_order >= 0)
);

CREATE INDEX restaurant_memberships_active_user_restaurant_idx
  ON public.restaurant_memberships (user_id, restaurant_id)
  WHERE status = 'active';

CREATE INDEX menu_categories_restaurant_order_idx
  ON public.menu_categories (restaurant_id, display_order, id);

CREATE INDEX menu_items_restaurant_category_order_idx
  ON public.menu_items (restaurant_id, category_id, display_order, id);

CREATE FUNCTION private.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  NEW.updated_at := statement_timestamp();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.set_updated_at() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();

CREATE TRIGGER restaurants_set_updated_at
  BEFORE UPDATE ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();

CREATE TRIGGER restaurant_memberships_set_updated_at
  BEFORE UPDATE ON public.restaurant_memberships
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();

CREATE TRIGGER menu_categories_set_updated_at
  BEFORE UPDATE ON public.menu_categories
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();

CREATE TRIGGER menu_items_set_updated_at
  BEFORE UPDATE ON public.menu_items
  FOR EACH ROW EXECUTE FUNCTION private.set_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_select_own
  ON public.profiles
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY profiles_insert_own
  ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY profiles_update_own
  ON public.profiles
  FOR UPDATE TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY restaurant_memberships_select_own
  ON public.restaurant_memberships
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY restaurants_select_public
  ON public.restaurants
  FOR SELECT TO anon, authenticated
  USING (status = 'active');

CREATE POLICY restaurants_select_member
  ON public.restaurants
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.restaurant_memberships AS membership
      WHERE membership.restaurant_id = restaurants.id
        AND membership.user_id = (SELECT auth.uid())
        AND membership.status = 'active'
    )
  );

CREATE POLICY menu_categories_select_public
  ON public.menu_categories
  FOR SELECT TO anon, authenticated
  USING (
    is_active
    AND EXISTS (
      SELECT 1
      FROM public.restaurants AS restaurant
      WHERE restaurant.id = menu_categories.restaurant_id
        AND restaurant.status = 'active'
    )
  );

CREATE POLICY menu_categories_select_member
  ON public.menu_categories
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.restaurant_memberships AS membership
      WHERE membership.restaurant_id = menu_categories.restaurant_id
        AND membership.user_id = (SELECT auth.uid())
        AND membership.status = 'active'
    )
  );

CREATE POLICY menu_items_select_public
  ON public.menu_items
  FOR SELECT TO anon, authenticated
  USING (
    is_published
    AND EXISTS (
      SELECT 1
      FROM public.menu_categories AS category
      JOIN public.restaurants AS restaurant
        ON restaurant.id = category.restaurant_id
      WHERE category.id = menu_items.category_id
        AND category.restaurant_id = menu_items.restaurant_id
        AND category.is_active
        AND restaurant.status = 'active'
    )
  );

CREATE POLICY menu_items_select_member
  ON public.menu_items
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.restaurant_memberships AS membership
      WHERE membership.restaurant_id = menu_items.restaurant_id
        AND membership.user_id = (SELECT auth.uid())
        AND membership.status = 'active'
    )
  );

CREATE VIEW public.public_restaurants
WITH (security_barrier = true, security_invoker = true)
AS
SELECT id, slug, name, description, time_zone
FROM public.restaurants
WHERE status = 'active';

CREATE VIEW public.public_menu_categories
WITH (security_barrier = true, security_invoker = true)
AS
SELECT category.id, category.restaurant_id, category.name, category.description,
       category.display_order
FROM public.menu_categories AS category
JOIN public.restaurants AS restaurant
  ON restaurant.id = category.restaurant_id
WHERE category.is_active
  AND restaurant.status = 'active';

CREATE VIEW public.public_menu_items
WITH (security_barrier = true, security_invoker = true)
AS
SELECT item.id, item.restaurant_id, item.category_id, item.name, item.description,
       item.price_minor_units, item.currency_code, item.is_available, item.display_order
FROM public.menu_items AS item
JOIN public.menu_categories AS category
  ON category.id = item.category_id
 AND category.restaurant_id = item.restaurant_id
JOIN public.restaurants AS restaurant
  ON restaurant.id = item.restaurant_id
WHERE item.is_published
  AND category.is_active
  AND restaurant.status = 'active';

REVOKE ALL ON TABLE
  public.profiles,
  public.restaurants,
  public.restaurant_memberships,
  public.menu_categories,
  public.menu_items
FROM PUBLIC, anon, authenticated;

GRANT SELECT (user_id, display_name, created_at, updated_at)
  ON public.profiles TO authenticated;
GRANT INSERT (user_id, display_name)
  ON public.profiles TO authenticated;
GRANT UPDATE (display_name)
  ON public.profiles TO authenticated;

GRANT SELECT (id, slug, name, description, time_zone, status)
  ON public.restaurants TO anon, authenticated;
GRANT SELECT (id, restaurant_id, user_id, status, created_at, updated_at, revoked_at)
  ON public.restaurant_memberships TO authenticated;
GRANT SELECT (id, restaurant_id, name, description, display_order, is_active)
  ON public.menu_categories TO anon, authenticated;
GRANT SELECT (
  id, restaurant_id, category_id, name, description, price_minor_units,
  currency_code, is_published, is_available, display_order
)
  ON public.menu_items TO anon, authenticated;

GRANT SELECT ON public.public_restaurants,
  public.public_menu_categories,
  public.public_menu_items
TO anon, authenticated;
