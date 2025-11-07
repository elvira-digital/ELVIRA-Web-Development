-- Guest Analytics Tracking Schema
-- Tracks guest interactions with hotel-specific items

-- Table to track guest interactions with dashboard items
CREATE TABLE IF NOT EXISTS guest_analytics_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  
  -- What section/category
  section_type TEXT NOT NULL, -- 'amenities', 'restaurant', 'shop', 'laundry', etc.
  
  -- What specific item (if applicable)
  item_id UUID, -- ID of the specific amenity, menu item, product, etc.
  item_name TEXT, -- Name of the item for analytics
  item_category TEXT, -- Category within the section (e.g., 'pool', 'housekeeping', 'breakfast')
  
  -- Interaction type
  action_type TEXT NOT NULL, -- 'view', 'click', 'add_to_cart', 'order', 'detail_view'
  
  -- Time tracking
  duration_seconds INTEGER, -- How long they viewed this item
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes for fast queries
  CONSTRAINT valid_action_type CHECK (action_type IN ('view', 'click', 'add_to_cart', 'order', 'detail_view', 'section_enter', 'section_exit'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_guest_analytics_hotel ON guest_analytics_interactions(hotel_id);
CREATE INDEX IF NOT EXISTS idx_guest_analytics_guest ON guest_analytics_interactions(guest_id);
CREATE INDEX IF NOT EXISTS idx_guest_analytics_section ON guest_analytics_interactions(section_type);
CREATE INDEX IF NOT EXISTS idx_guest_analytics_item ON guest_analytics_interactions(item_id);
CREATE INDEX IF NOT EXISTS idx_guest_analytics_created ON guest_analytics_interactions(created_at);

-- Table to track session timing per section
CREATE TABLE IF NOT EXISTS guest_section_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
  hotel_id UUID NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  
  section_type TEXT NOT NULL,
  
  entered_at TIMESTAMPTZ DEFAULT NOW(),
  exited_at TIMESTAMPTZ,
  duration_seconds INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for session queries
CREATE INDEX IF NOT EXISTS idx_section_sessions_hotel ON guest_section_sessions(hotel_id);
CREATE INDEX IF NOT EXISTS idx_section_sessions_created ON guest_section_sessions(created_at);

-- Enable RLS
ALTER TABLE guest_analytics_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_section_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hotel staff to view their hotel's data
CREATE POLICY "Hotel staff can view their hotel analytics"
  ON guest_analytics_interactions
  FOR SELECT
  USING (
    hotel_id IN (
      SELECT hotel_id FROM hotel_staff
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Hotel staff can view their hotel session data"
  ON guest_section_sessions
  FOR SELECT
  USING (
    hotel_id IN (
      SELECT hotel_id FROM hotel_staff
      WHERE user_id = auth.uid()
    )
  );

-- Policy for guests to insert their own data
CREATE POLICY "Guests can insert their own analytics"
  ON guest_analytics_interactions
  FOR INSERT
  WITH CHECK (true); -- We'll validate on the application side

CREATE POLICY "Guests can insert their own session data"
  ON guest_section_sessions
  FOR INSERT
  WITH CHECK (true);

-- View for aggregated analytics by hotel and section
CREATE OR REPLACE VIEW guest_behavior_summary AS
SELECT 
  hotel_id,
  section_type,
  item_category,
  COUNT(*) as interaction_count,
  COUNT(DISTINCT guest_id) as unique_guests,
  AVG(duration_seconds) as avg_duration_seconds,
  SUM(CASE WHEN action_type = 'click' THEN 1 ELSE 0 END) as total_clicks,
  SUM(CASE WHEN action_type = 'add_to_cart' THEN 1 ELSE 0 END) as add_to_cart_count,
  SUM(CASE WHEN action_type = 'order' THEN 1 ELSE 0 END) as order_count
FROM guest_analytics_interactions
GROUP BY hotel_id, section_type, item_category;

-- View for most popular items by hotel
CREATE OR REPLACE VIEW popular_items_by_hotel AS
SELECT 
  hotel_id,
  section_type,
  item_id,
  item_name,
  item_category,
  COUNT(*) as interaction_count,
  COUNT(DISTINCT guest_id) as unique_guests,
  AVG(duration_seconds) as avg_time_spent,
  SUM(CASE WHEN action_type = 'order' THEN 1 ELSE 0 END) as order_count
FROM guest_analytics_interactions
WHERE item_id IS NOT NULL
GROUP BY hotel_id, section_type, item_id, item_name, item_category
ORDER BY interaction_count DESC;
