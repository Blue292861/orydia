-- Add shop_type enum and column to differentiate between internal Orydia shop and external Oryshop
CREATE TYPE shop_type AS ENUM ('internal', 'external');

-- Add shop_type column to shop_items table
ALTER TABLE public.shop_items 
ADD COLUMN shop_type shop_type DEFAULT 'internal'::shop_type NOT NULL;

-- Add index for better performance when filtering by shop_type
CREATE INDEX idx_shop_items_shop_type ON public.shop_items(shop_type);

-- Add comment to clarify the distinction
COMMENT ON COLUMN public.shop_items.shop_type IS 'Type of shop: internal (Orydia with Tensens) or external (Oryshop with real money)';

-- Update existing items to be internal by default (current shop)
UPDATE public.shop_items SET shop_type = 'internal' WHERE shop_type IS NULL;