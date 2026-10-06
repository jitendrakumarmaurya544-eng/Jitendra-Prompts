import bcrypt from 'bcryptjs';
import { db } from './index.ts';
import {
  users,
  categories,
  aiModels,
  tags,
  prompts,
  promptTags,
  siteSettings,
  notifications,
} from './schema.ts';
import { eq } from 'drizzle-orm';

export async function seedDatabase() {
  console.log('--- Checking & Seeding JITENDRA PROMPTS Database ---');

  // Check if admin user exists
  const existingUsers = await db.select().from(users).limit(1);
  if (existingUsers.length > 0) {
    console.log('Database already has data. Skipping full seed.');
    return;
  }

  const saltRounds = 10;
  const adminPasswordHash = await bcrypt.hash('AdminPassword2026!', saltRounds);
  const creatorPasswordHash = await bcrypt.hash('Creator2026!', saltRounds);

  // 1. Seed Users
  const [adminUser] = await db
    .insert(users)
    .values([
      {
        fullName: 'Jitendra Maurya',
        username: 'jitendra_admin',
        email: 'admin@jitendraprompts.com',
        passwordHash: adminPasswordHash,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        bio: 'Founder & Lead Curator at Jitendra Prompts. Turning vision into cinematic AI art.',
        website: 'https://jitendraprompts.com',
        role: 'admin',
        status: 'active',
      },
      {
        fullName: 'Elena Vance',
        username: 'elena_creations',
        email: 'creator@jitendraprompts.com',
        passwordHash: creatorPasswordHash,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        bio: 'Visual director & prompt engineer specializing in hyper-luxury aesthetics and 3D lighting.',
        website: 'https://instagram.com/elenavance',
        role: 'user',
        status: 'active',
      },
    ])
    .returning();

  console.log('Seeded Users. Admin ID:', adminUser.id);

  // 2. Seed AI Models
  const seededModels = await db
    .insert(aiModels)
    .values([
      {
        name: 'Midjourney v6.1',
        slug: 'midjourney-v6',
        logo: 'Sparkles',
        description: 'Gold-standard photorealism, aesthetic composition, and dramatic lighting.',
        website: 'https://midjourney.com',
        status: 'active',
      },
      {
        name: 'Flux 1.1 Pro',
        slug: 'flux-pro',
        logo: 'Cpu',
        description: 'Next-gen fidelity, immaculate typography rendering, and crisp macro details.',
        website: 'https://blackforestlabs.ai',
        status: 'active',
      },
      {
        name: 'ChatGPT / DALL-E 3',
        slug: 'dalle-3',
        logo: 'Bot',
        description: 'Complex prompt adherence, spatial reasoning, and clean vector illustrations.',
        website: 'https://openai.com',
        status: 'active',
      },
      {
        name: 'Runway Gen-3 Alpha',
        slug: 'runway-gen3',
        logo: 'Video',
        description: 'Cinematic AI video generation with precision camera control and physics.',
        website: 'https://runwayml.com',
        status: 'active',
      },
      {
        name: 'Google Imagen 3',
        slug: 'imagen-3',
        logo: 'Layers',
        description: 'Advanced texture rendering, rich contrast, and photorealistic skin tones.',
        website: 'https://deepmind.google',
        status: 'active',
      },
      {
        name: 'Stable Diffusion XL',
        slug: 'sdxl',
        logo: 'Zap',
        description: 'Open-weights diffusion model fine-tuned for high dynamic range cinematography.',
        website: 'https://stability.ai',
        status: 'active',
      },
      {
        name: 'Kling AI',
        slug: 'kling-ai',
        logo: 'Film',
        description: 'High-motion cinematic video model producing ultra-smooth 1080p clips.',
        website: 'https://klingai.org',
        status: 'active',
      },
    ])
    .returning();

  // 3. Seed Categories
  const seededCategories = await db
    .insert(categories)
    .values([
      {
        name: 'Cinematic & Film',
        slug: 'cinematic',
        description: 'Anamorphic lens flares, 35mm film grain, moody shadows, and movie scenes.',
        icon: 'Film',
        image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
        sortOrder: 1,
      },
      {
        name: 'AI Photo & Realism',
        slug: 'ai-photo',
        description: 'True-to-life studio photography, natural skin pores, and authentic ambient light.',
        icon: 'Camera',
        image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
        sortOrder: 2,
      },
      {
        name: '3D Art & CGI',
        slug: '3d-art',
        description: 'Octane render, Raytracing, metallic shaders, and glass refraction.',
        icon: 'Box',
        image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        sortOrder: 3,
      },
      {
        name: 'Luxury & Lifestyle',
        slug: 'luxury-lifestyle',
        description: 'Penthouse suites, bespoke supercars, gold jewelry, and millionaire aesthetics.',
        icon: 'Crown',
        image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
        sortOrder: 4,
      },
      {
        name: 'Product Photography',
        slug: 'product-photography',
        description: 'Commercial studio setups, dark background lighting, perfume, and luxury watches.',
        icon: 'ShoppingBag',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
        sortOrder: 5,
      },
      {
        name: 'Portrait & Fashion',
        slug: 'portrait-fashion',
        description: 'High-end haute couture editorial portraits with striking gaze and rim lighting.',
        icon: 'User',
        image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80',
        sortOrder: 6,
      },
      {
        name: 'Video & B-Roll',
        slug: 'video-prompts',
        description: 'Slow-motion prompts, camera tracking, drone flyovers, and dynamic motion prompts.',
        icon: 'Video',
        image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
        sortOrder: 7,
      },
      {
        name: 'YouTube & Creator',
        slug: 'youtube-creator',
        description: 'High CTR thumbnail concepts, aesthetic studio setups, and viral visual hooks.',
        icon: 'Play',
        image: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=800&q=80',
        sortOrder: 8,
      },
      {
        name: 'Business & Solopreneur',
        slug: 'business-solopreneur',
        description: 'Executive offices, trading monitors, modern pitch deck visuals, and branding.',
        icon: 'Briefcase',
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
        sortOrder: 9,
      },
      {
        name: 'Logo & Typography',
        slug: 'logo-typography',
        description: 'Embossed gold foil monograms, futuristic luxury wordmarks, and geometric emblems.',
        icon: 'Feather',
        image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80',
        sortOrder: 10,
      },
      {
        name: 'Fantasy & Sci-Fi',
        slug: 'fantasy-scifi',
        description: 'Cyberpunk neon rain, floating golden obelisks, astral worlds, and cosmic realms.',
        icon: 'Sparkles',
        image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        sortOrder: 11,
      },
      {
        name: 'Creative & Abstract',
        slug: 'creative-abstract',
        description: 'Liquid gold fluid simulations, dark chrome waves, and minimalist geometry.',
        icon: 'Palette',
        image: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80',
        sortOrder: 12,
      },
    ])
    .returning();

  // 4. Seed Tags
  const seededTags = await db
    .insert(tags)
    .values([
      { name: 'Cinematic', slug: 'cinematic' },
      { name: 'Millionaire Mode', slug: 'millionaire-mode' },
      { name: 'Gold Accent', slug: 'gold-accent' },
      { name: '8K Photorealism', slug: '8k-photorealism' },
      { name: 'Editorial', slug: 'editorial' },
      { name: 'Supercar', slug: 'supercar' },
      { name: 'Macro', slug: 'macro' },
      { name: 'Cyberpunk', slug: 'cyberpunk' },
      { name: 'Solopreneur', slug: 'solopreneur' },
      { name: 'Watch', slug: 'watch' },
      { name: 'Studio Lighting', slug: 'studio-lighting' },
      { name: 'Video Prompt', slug: 'video-prompt' },
    ])
    .returning();

  const midjourneyModel = seededModels.find((m) => m.slug === 'midjourney-v6') || seededModels[0];
  const fluxModel = seededModels.find((m) => m.slug === 'flux-pro') || seededModels[1];
  const runwayModel = seededModels.find((m) => m.slug === 'runway-gen3') || seededModels[3];
  const dalleModel = seededModels.find((m) => m.slug === 'dalle-3') || seededModels[2];

  const catCinematic = seededCategories.find((c) => c.slug === 'cinematic') || seededCategories[0];
  const catPhoto = seededCategories.find((c) => c.slug === 'ai-photo') || seededCategories[1];
  const cat3D = seededCategories.find((c) => c.slug === '3d-art') || seededCategories[2];
  const catLuxury = seededCategories.find((c) => c.slug === 'luxury-lifestyle') || seededCategories[3];
  const catProduct = seededCategories.find((c) => c.slug === 'product-photography') || seededCategories[4];
  const catFashion = seededCategories.find((c) => c.slug === 'portrait-fashion') || seededCategories[5];
  const catVideo = seededCategories.find((c) => c.slug === 'video-prompts') || seededCategories[6];
  const catBusiness = seededCategories.find((c) => c.slug === 'business-solopreneur') || seededCategories[8];

  // 5. Seed Prompts
  const seededPrompts = await db
    .insert(prompts)
    .values([
      {
        userId: adminUser.id,
        title: 'Millionaire Mode: Rooftop Empire at Sunset',
        slug: 'millionaire-mode-rooftop-empire-at-sunset',
        description: 'Cinematic wide-angle view of a visionary creator standing over a glowing metropolis at golden hour.',
        content: `Ultra-high-definition cinematic photography of a confident entrepreneur standing at the glass edge of an ultra-luxury penthouse rooftop overlooking Manhattan skyline at golden hour. Warm atmospheric amber dusk light hitting sharp tailored dark velvet jacket with subtle gold embroidered trim. In hands, sleek obsidian smartphone with golden rim. Soft lens flare, anamorphic 35mm lens, depth of field, f/1.8, 8k resolution, photorealistic film grain, moody cinematic atmosphere --ar 16:9 --style raw --v 6.1`,
        categoryId: catLuxury.id,
        modelId: midjourneyModel.id,
        style: 'Cinematic Hyperrealism',
        previewImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
        promptType: 'free',
        status: 'published',
        isFeatured: true,
        isTrending: true,
        views: 2450,
        copyCount: 890,
      },
      {
        userId: adminUser.id,
        title: 'Solopreneur Multi-Screen Obsidian Command Center',
        slug: 'solopreneur-multi-screen-obsidian-command-center',
        description: 'Clean minimalist dark wood workspace with multiple curved OLED monitors, warm gold backlights, and espresso cup.',
        content: `A cinematic low-angle desk shot of an executive solopreneur creative suite at 2 AM. Matte black desk with warm brushed gold underglow, three ultra-wide curved OLED monitors displaying elegant trading charts and sleek neural network nodes in gold and monochrome. A steaming ceramic coffee mug with gold rim, mechanical keyboard with subtle warm backlit keys, soft volumetric mist outside the floor-to-ceiling glass windows showing city lights, hyper-detailed, photorealistic, Shot on Hasselblad H6D-100c --ar 16:9`,
        categoryId: catBusiness.id,
        modelId: fluxModel.id,
        style: 'Architectural Realism',
        previewImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
        promptType: 'premium',
        status: 'published',
        isFeatured: true,
        isTrending: true,
        views: 1840,
        copyCount: 640,
      },
      {
        userId: adminUser.id,
        title: 'Haute Couture Editorial: Gold Filigree & Dark Silk',
        slug: 'haute-couture-editorial-gold-filigree-dark-silk',
        description: 'Vogue-style luxury portrait featuring gold jewellery and obsidian velvet with dramatic studio lighting.',
        content: `Editorial fashion portrait of a striking model wearing a high-neck midnight black silk gown detailed with intricate 24-karat gold filigree embroidery along the collarbone. Elegant geometric gold earrings, polished metallic gold sunglasses with subtle mirrored reflection of studio softbox, dramatic Rembrandt lighting, deep obsidian backdrop, hyper-realistic skin texture with natural pores and golden rim light, 85mm portrait lens, f/1.4, captured on Kodak Portra 400 --ar 3:4 --v 6.1`,
        categoryId: catFashion.id,
        modelId: midjourneyModel.id,
        style: 'High Fashion Editorial',
        previewImage: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80',
        promptType: 'free',
        status: 'published',
        isFeatured: true,
        isTrending: false,
        views: 3120,
        copyCount: 1250,
      },
      {
        userId: adminUser.id,
        title: 'Midnight Matte-Black Hypercar with Liquid Gold Accents',
        slug: 'midnight-matte-black-hypercar-liquid-gold-accents',
        description: 'Wet asphalt reflections of a stealth aerodynamic hypercar parked in front of a private hangar.',
        content: `Cinematic 4K automotive commercial still of a bespoke matte black carbon-fiber hypercar parked on a rain-slicked runway at night. Glossy liquid gold pinstripes running along the aerodynamic curves and gold forged alloy wheels. Soft reflections of golden hangar spotlights in puddles, atmospheric fog, motion blur in background, anamorphic widescreen, Hasselblad camera, 8k resolution, raytracing reflections, photorealistic vehicle lighting --ar 21:9 --v 6.1`,
        categoryId: catCinematic.id,
        modelId: midjourneyModel.id,
        style: 'Cinematic Automotive',
        previewImage: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=1200&q=80',
        promptType: 'premium',
        status: 'published',
        isFeatured: false,
        isTrending: true,
        views: 4200,
        copyCount: 1680,
      },
      {
        userId: adminUser.id,
        title: 'Macro Tourbillon Luxury Watch in Liquid Obsidian & Gold',
        slug: 'macro-tourbillon-luxury-watch-liquid-obsidian-gold',
        description: 'Ultra-close macro view of exposed Swiss mechanical movement with 18k rose gold gears and black titanium.',
        content: `Ultra-macro commercial product photograph of a luxury skeletonized tourbillon wristwatch floating inside viscous dark obsidian liquid with droplets of molten gold suspended around the dial. Complex mechanical balance wheel spinning, exposed 18k gold gears with ruby bearings, anti-reflective sapphire crystal with microscopic light glints, studio focus stacking, razor sharp, Octane 3D render fidelity with photorealistic textures --ar 1:1`,
        categoryId: catProduct.id,
        modelId: fluxModel.id,
        style: 'Commercial Product Studio',
        previewImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
        promptType: 'premium',
        status: 'published',
        isFeatured: true,
        isTrending: true,
        views: 5120,
        copyCount: 1940,
      },
      {
        userId: adminUser.id,
        title: 'Law of Assumption: Serene Golden Hour Mindset Vision',
        slug: 'law-of-assumption-serene-golden-hour-mindset-vision',
        description: 'Warm, powerful meditation portrait of a modern creator in a state of supreme clarity and inner wealth.',
        content: `Close-up cinematic portrait of a peaceful visionary creator with eyes softly closed, standing in the gentle ocean breeze on a private cliffside villa terrace during an incandescent golden sunset. Warm glowing sunrays illuminating skin and glistening delicate gold chain. Text aura subtle and serene. Cinematic color grade, warm amber and dark bronze palette, peaceful euphoric expression, ARRI Alexa LF, 50mm Master Prime, f/2.0 --ar 16:9 --v 6.1`,
        categoryId: catPhoto.id,
        modelId: midjourneyModel.id,
        style: 'Cinematic Portrait',
        previewImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
        promptType: 'free',
        status: 'published',
        isFeatured: false,
        isTrending: true,
        views: 1980,
        copyCount: 780,
      },
      {
        userId: adminUser.id,
        title: 'Floating 3D Neural Cortex in Holographic Gold & Chrome',
        slug: 'floating-3d-neural-cortex-holographic-gold-chrome',
        description: 'Complex 3D artificial intelligence brain constructed from liquid gold filaments and floating particles.',
        content: `A central floating 3D biometric AI brain model made of woven polished gold filaments and translucent obsidian glass circuits, emitting golden quantum sparks and floating volumetric light particles. Dark void background with subtle circular metallic pedestal and soft floor reflection. Octane render, raytraced subsurface scattering, 8k resolution, clean futuristic sci-fi luxury tech --ar 1:1`,
        categoryId: cat3D.id,
        modelId: fluxModel.id,
        style: '3D CGI / Octane Render',
        previewImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        promptType: 'premium',
        status: 'published',
        isFeatured: true,
        isTrending: false,
        views: 3410,
        copyCount: 1120,
      },
      {
        userId: adminUser.id,
        title: 'Runway AI Camera Push: Billionaire Superyacht Mediterranean',
        slug: 'runway-ai-camera-push-billionaire-superyacht-mediterranean',
        description: 'Smooth cinematic drone tracking shot orbiting a sleek 100-meter black luxury yacht in Monaco at twilight.',
        content: `Cinematic drone camera continuous orbit around the bow of a sleek 120-meter obsidian superyacht cruising through glassy Mediterranean waters at nautical twilight. Warm golden deck lights casting soft reflections across the water surface, helicopter pad illuminated, gentle wake waves with realistic fluid dynamics, slow smooth 24fps motion, IMAX 70mm cinematic camera look, photorealistic water shaders`,
        categoryId: catVideo.id,
        modelId: runwayModel.id,
        style: 'Cinematic Drone Video',
        previewImage: 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1200&q=80',
        promptType: 'free',
        status: 'published',
        isFeatured: false,
        isTrending: true,
        views: 2900,
        copyCount: 950,
      },
    ])
    .returning();

  // Attach tags
  for (const prompt of seededPrompts) {
    const selectedTags = seededTags.slice(0, 3);
    for (const tag of selectedTags) {
      await db.insert(promptTags).values({
        promptId: prompt.id,
        tagId: tag.id,
      }).onConflictDoNothing();
    }
  }

  // 6. Seed Site Settings
  await db
    .insert(siteSettings)
    .values([
      { settingKey: 'site_name', settingValue: 'JITENDRA PROMPTS' },
      { settingKey: 'tagline', settingValue: 'Create Better. Prompt Smarter.' },
      { settingKey: 'secondary_tagline', settingValue: 'Your Ideas. Your Prompts. Your Creation.' },
      { settingKey: 'contact_email', settingValue: 'support@jitendraprompts.com' },
      { settingKey: 'hero_badge', settingValue: 'THE AI PROMPT LIBRARY' },
      { settingKey: 'hero_heading', settingValue: 'TURN YOUR IDEAS INTO VISUALS.' },
      { settingKey: 'hero_highlight', settingValue: 'POWERFUL PROMPTS.' },
      { settingKey: 'hero_description', settingValue: 'Discover premium AI prompts for images, videos, design, business, marketing and creativity.' },
      { settingKey: 'stat_prompts', settingValue: '10K+' },
      { settingKey: 'stat_categories', settingValue: '50+' },
      { settingKey: 'stat_tools', settingValue: '20+' },
      { settingKey: 'stat_creators', settingValue: '25K+' },
      { settingKey: 'prompt_of_the_day_id', settingValue: String(seededPrompts[0]?.id || 1) },
    ])
    .onConflictDoNothing();

  // 7. Seed welcome notification for admin
  await db.insert(notifications).values({
    userId: adminUser.id,
    title: 'Welcome to JITENDRA PROMPTS',
    message: 'Your luxury AI prompt marketplace is configured and ready to empower creators worldwide.',
    type: 'success',
    isRead: false,
  });

  console.log('Seeding completed successfully!');
}
