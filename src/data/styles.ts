import { HeadshotStyle } from '../types';

export const SAMPLE_CASUAL_SELFIE = '/src/assets/images/sample_casual_selfie_1792077168806.jpg';

export const HEADSHOT_STYLES: HeadshotStyle[] = [
  {
    id: 'corporate-grey',
    name: 'Corporate Grey Backdrop',
    tagline: 'Timeless C-Suite & Boardroom Standard',
    description: 'Smooth neutral grey seamless studio backdrop with soft diffuse 3-point key lighting and crisp executive tailoring.',
    sampleImage: '/src/assets/images/sample_corporate_grey_1792077167672.jpg',
    recommendedFor: 'LinkedIn · Corporate Bios · Finance · Legal',
    defaultAttire: 'Charcoal tailored wool blazer with clean crisp collar',
    defaultLighting: 'Soft diffuse studio softbox lighting with gentle eye catchlights',
    backgroundPrompt: 'Neutral studio backdrop in medium charcoal grey with subtle radial vignette falloff, studio grade seamless paper',
  },
  {
    id: 'modern-tech',
    name: 'Modern Tech Office',
    tagline: 'Contemporary Startup & Venture Aesthetic',
    description: 'Architectural open-plan workspace with soft glass, warm blonde timber bokeh, and smart casual poise.',
    sampleImage: '/src/assets/images/sample_tech_office_1792077170342.jpg',
    recommendedFor: 'Founders · Tech Leaders · Product Managers',
    defaultAttire: 'Navy structured blazer over an open-collar Italian cotton shirt',
    defaultLighting: 'Warm ambient architectural window lighting with soft background rim',
    backgroundPrompt: 'Modern high-ceiling tech office interior, blurred glass partitions, warm timber tables, and architectural greenery in shallow depth-of-field bokeh',
  },
  {
    id: 'outdoor-natural',
    name: 'Outdoor Natural Light',
    tagline: 'Approachable Golden-Hour Organic Warmth',
    description: 'Golden hour diffused sunlit setting with lush botanical bokeh, radiating approachability and authentic warmth.',
    sampleImage: '/src/assets/images/sample_outdoor_light_1792077168499.jpg',
    recommendedFor: 'Consultants · Real Estate · Keynote Speakers',
    defaultAttire: 'Tailored dark navy suit jacket with soft neutral blouse or shirt',
    defaultLighting: 'Diffused late afternoon golden-hour sunlight with gentle hair rim light',
    backgroundPrompt: 'Softly blurred outdoor garden terrace with organic botanical greenery bokeh, warm natural sunlight filtering through leaves',
  },
  {
    id: 'executive-studio',
    name: 'Executive Studio Dark',
    tagline: 'High-Impact Editorial Chiaroscuro',
    description: 'Dramatic chiaroscuro studio lighting against dark textured graphite slate canvas, highlighting sharp commanding presence.',
    sampleImage: '/src/assets/images/sample_studio_portrait_1792077169409.jpg',
    recommendedFor: 'Managing Directors · CEOs · Thought Leaders',
    defaultAttire: 'Bespoke dark charcoal suit with subtle tie and pocket square',
    defaultLighting: 'Dramatic studio chiaroscuro with precise hair rim light and sculpted key light',
    backgroundPrompt: 'Textured dark slate graphite canvas backdrop with subtle artistic mottling and deep studio shadows',
  },
  {
    id: 'creative-editorial',
    name: 'Warm Creative Editorial',
    tagline: 'Minimalist Architectural Studio Tone',
    description: 'Warm plaster architectural studio with soft daylight and high-end creative director minimalism.',
    sampleImage: '/src/assets/images/sample_tech_office_1792077170342.jpg',
    recommendedFor: 'Creative Directors · Architects · Brand Strategists',
    defaultAttire: 'Charcoal fine-gauge merino turtleneck or structured minimalist jacket',
    defaultLighting: 'Soft diffuse north-facing skylight daylight with balanced shadows',
    backgroundPrompt: 'Minimalist design atelier with warm limestone plaster walls, geometric architectural shadow lines, and clean negative space',
  },
  {
    id: 'high-key-white',
    name: 'High-Key Clean White',
    tagline: 'Luminous Clinical & Academic Precision',
    description: 'Crisp shadowless pure white cyclorama studio portrait offering immaculate clarity and vibrant approachability.',
    sampleImage: '/src/assets/images/sample_corporate_grey_1792077167672.jpg',
    recommendedFor: 'Medical Doctors · Academic Faculty · Public Sector',
    defaultAttire: 'Crisp tailored blazer or professional white clinical attire',
    defaultLighting: 'Clean shadowless high-key white commercial studio illumination',
    backgroundPrompt: 'Clean pure white cyclorama studio wall with subtle shadow gradient at feet level, crisp high-key commercial finish',
  },
];

export const ATTIRE_PRESETS = [
  'Charcoal tailored wool blazer with clean crisp collar',
  'Navy structured blazer over an open-collar shirt',
  'Classic black two-piece suit with white dress shirt and dark silk tie',
  'Charcoal fine-gauge merino wool turtleneck',
  'Clean white tailored medical lab coat with formal inner shirt',
  'Relaxed cream linen blazer with subtle textured weave',
];

export const LIGHTING_PRESETS = [
  'Soft diffuse studio softbox lighting with gentle eye catchlights',
  'Warm ambient architectural window lighting with soft background rim',
  'Diffused late afternoon golden-hour sunlight with gentle hair rim light',
  'Dramatic studio chiaroscuro with precise hair rim light and sculpted key light',
  'Clean shadowless high-key commercial studio illumination',
];

export const QUICK_EDIT_PROMPTS = [
  'Change suit color to deep navy blue with silk lapels',
  'Add classic sleek tortoiseshell reading glasses',
  'Change the background to a modern brick loft interior',
  'Adjust lighting to warmer golden hour glow',
  'Make the facial expression slightly warmer with a subtle smile',
  'Switch attire to a minimalist black turtleneck',
  'Add soft studio hair backlight for separation',
  'Make the background darker charcoal textured canvas',
];
