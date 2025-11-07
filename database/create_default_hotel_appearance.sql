-- Create default hotel appearance settings for Centro Hotel Mondial
-- This ensures guests can see the themed UI properly

INSERT INTO hotel_appearance_settings (
  hotel_id,
  font_family,
  font_size_base,
  font_size_heading,
  font_size_small,
  font_weight_normal,
  font_weight_medium,
  font_weight_semibold,
  font_weight_bold,
  color_primary,
  color_text_primary,
  color_text_secondary,
  color_text_inverse,
  stay_card_gradient_from,
  stay_card_gradient_to,
  about_us_background_color,
  icon_size,
  border_radius,
  card_style
)
VALUES (
  '086e11e4-4775-4327-8448-3fa0ee7be0a5', -- Centro Hotel Mondial
  'Inter, system-ui, sans-serif',          -- font_family
  '16px',                                  -- font_size_base
  '24px',                                  -- font_size_heading
  '14px',                                  -- font_size_small
  '400',                                   -- font_weight_normal
  '500',                                   -- font_weight_medium
  '600',                                   -- font_weight_semibold
  '700',                                   -- font_weight_bold
  '#10b981',                               -- color_primary (emerald-500)
  '#111827',                               -- color_text_primary (gray-900)
  '#6b7280',                               -- color_text_secondary (gray-500)
  '#ffffff',                               -- color_text_inverse (white)
  '#3b82f6',                               -- stay_card_gradient_from (blue-500)
  '#9333ea',                               -- stay_card_gradient_to (purple-600)
  '#f3f4f6',                               -- about_us_background_color (gray-100)
  '20px',                                  -- icon_size
  '0.75rem',                               -- border_radius (12px)
  'elevated'                               -- card_style
)
ON CONFLICT (hotel_id) DO UPDATE SET
  font_family = EXCLUDED.font_family,
  font_size_base = EXCLUDED.font_size_base,
  font_size_heading = EXCLUDED.font_size_heading,
  font_size_small = EXCLUDED.font_size_small,
  font_weight_normal = EXCLUDED.font_weight_normal,
  font_weight_medium = EXCLUDED.font_weight_medium,
  font_weight_semibold = EXCLUDED.font_weight_semibold,
  font_weight_bold = EXCLUDED.font_weight_bold,
  color_primary = EXCLUDED.color_primary,
  color_text_primary = EXCLUDED.color_text_primary,
  color_text_secondary = EXCLUDED.color_text_secondary,
  color_text_inverse = EXCLUDED.color_text_inverse,
  stay_card_gradient_from = EXCLUDED.stay_card_gradient_from,
  stay_card_gradient_to = EXCLUDED.stay_card_gradient_to,
  about_us_background_color = EXCLUDED.about_us_background_color,
  icon_size = EXCLUDED.icon_size,
  border_radius = EXCLUDED.border_radius,
  card_style = EXCLUDED.card_style,
  updated_at = NOW();

-- Verify the record was created
SELECT * FROM hotel_appearance_settings 
WHERE hotel_id = '086e11e4-4775-4327-8448-3fa0ee7be0a5';
