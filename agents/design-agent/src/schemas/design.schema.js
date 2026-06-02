// Design Schema — Design Intelligence Agent (SmartOps IA)

const DESIGN_TYPES = [
  'instagram_post',      // single post 1080x1080
  'instagram_carousel',  // carousel multi-slide 1080x1080
  'reel_cover',          // reel thumbnail 1080x1920
  'story',               // story 1080x1920
  'meta_ad_square',      // Meta Ad 1080x1080
  'meta_ad_vertical',    // Meta Ad 1080x1920
  'google_display',      // Google Display 1200x628
  'linkedin_ad',         // LinkedIn 1200x627
  'thumbnail',           // video thumbnail 1280x720
  'proposal_pdf',        // PDF cover/section
  'website_section',     // HTML section
];

const VISUAL_STYLES = [
  'dark-premium-tech',   // default SmartOps style
  'clean-professional',  // lighter, corporate
  'tech-automation',     // green accent, more data-viz
  'authority-personal',  // Breno-forward, warmer
  'roi-focused',         // big numbers, minimal
];

const DIMENSIONS = {
  instagram_post:    { width: 1080, height: 1080 },
  instagram_carousel:{ width: 1080, height: 1080 },
  reel_cover:        { width: 1080, height: 1920 },
  story:             { width: 1080, height: 1920 },
  meta_ad_square:    { width: 1080, height: 1080 },
  meta_ad_vertical:  { width: 1080, height: 1920 },
  google_display:    { width: 1200, height: 628  },
  linkedin_ad:       { width: 1200, height: 627  },
  thumbnail:         { width: 1280, height: 720  },
};

// Base design input schema
const DESIGN_INPUT_SCHEMA = {
  design_id:   '',                  // unique id
  type:        'instagram_post',    // from DESIGN_TYPES
  format:      'instagram_post',
  dimensions:  { width: 1080, height: 1080 },
  objective:   'lead_generation',   // lead_generation | awareness | authority | conversion
  audience:    '',
  theme:       '',
  headline:    '',
  subheadline: '',
  body:        '',
  cta:         'Diagnóstico gratuito',
  template:    '',                  // from templates/
  visual_style:'dark-premium-tech',
  service_mode:'lean',              // lean | automation
  brand: {
    background: '#0A0A0F',
    primary:    '#7C3AED',
    accent:     '#10B981',
  },
  elements:    [],
  output_formats: ['html', 'png'],
  created_at:  '',
};

// Element schema for design JSON
const ELEMENT_SCHEMA = {
  type: '',         // headline | subheadline | body | cta | badge | metric_card |
                    //  accent_bar | logo | icon | divider | before_after
  text: '',
  position: '',     // top | center | bottom | top_left | top_right | bottom_center | etc.
  style: {},        // overrides
};

// Carousel slide schema
const SLIDE_SCHEMA = {
  slide_number:    1,
  type:            'hook',    // hook | problem | cause | data | solution | checklist | cta
  headline:        '',
  body:            '',
  bullets:         [],
  metrics:         [],
  visual_type:     '',        // impact_headline | data_card | list | before_after | cta_block
  cta:             null,
};

// Validate a design input object
function validateDesignInput(input) {
  const required = ['design_id', 'type', 'headline', 'cta'];
  const missing  = required.filter(f => !input[f]);
  if (missing.length > 0) throw new Error(`Design input missing: ${missing.join(', ')}`);
  if (!DESIGN_TYPES.includes(input.type)) {
    throw new Error(`Unknown design type: ${input.type}. Valid: ${DESIGN_TYPES.join(', ')}`);
  }
  return true;
}

// Resolve dimensions for a given type
function resolveDimensions(type) {
  return DIMENSIONS[type] || { width: 1080, height: 1080 };
}

module.exports = {
  DESIGN_TYPES, VISUAL_STYLES, DIMENSIONS, DESIGN_INPUT_SCHEMA,
  ELEMENT_SCHEMA, SLIDE_SCHEMA, validateDesignInput, resolveDimensions,
};
