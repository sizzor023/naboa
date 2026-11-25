import { count } from 'drizzle-orm';
import { db } from './index.ts';
import {
  category,
  deliveryMan,
  product,
  reviews,
  shop,
  users,
} from './schema.ts';

let seedPromise: Promise<void> | null = null;

async function runSeed() {
  const existing = await db.select({ value: count() }).from(category);
  if ((existing[0]?.value ?? 0) > 0) {
    return;
  }

  // 1. Seed Users (Merchants + Verified Reviewers)
  const insertedUsers = await db
    .insert(users)
    .values([
      {
        uid: 'seed_merchant_elgon_roasters',
        fullName: 'Daniel Masaba',
        email: 'daniel@elgonroasters.ug',
        phone: '+256 772 410 218',
        defaultAddress: 'Wing A-02, Naboa Shopping Centre, Mbale',
        role: 'merchant',
      },
      {
        uid: 'seed_merchant_aina_loom',
        fullName: 'Prossy Nandutu',
        email: 'prossy@ainaloom.ug',
        phone: '+256 701 884 312',
        defaultAddress: 'Colonnade B-05, Naboa Shopping Centre, Mbale',
        role: 'merchant',
      },
      {
        uid: 'seed_merchant_membere',
        fullName: 'Grace Khainza',
        email: 'grace@memberepantry.ug',
        phone: '+256 782 550 914',
        defaultAddress: 'Atrium A-09, Naboa Shopping Centre, Mbale',
        role: 'merchant',
      },
      {
        uid: 'seed_customer_sarah',
        fullName: 'Sarah Nambozo',
        email: 'sarah.nambozo@mbale.ug',
        phone: '+256 776 312 890',
        defaultAddress: 'Plot 14, Senior Quarters, Mbale City',
        role: 'customer',
      },
      {
        uid: 'seed_customer_david',
        fullName: 'David Wanjala',
        email: 'david.wanjala@mbale.ug',
        phone: '+256 752 190 442',
        defaultAddress: 'Nkoma Estate, Mbale City',
        role: 'customer',
      },
      {
        uid: 'seed_customer_amina',
        fullName: 'Amina Chebet',
        email: 'amina.chebet@mbale.ug',
        phone: '+256 781 644 105',
        defaultAddress: 'Republic Street, Mbale City',
        role: 'customer',
      },
    ])
    .returning();

  const [mRoaster, mLoom, mPantry, custSarah, custDavid, custAmina] = insertedUsers;

  // 2. Seed Categories
  const insertedCategories = await db
    .insert(category)
    .values([
      {
        name: 'Coffee & Tea',
        slug: 'coffee-tea',
        description:
          'Single-origin Mount Elgon Bugisu Arabica beans, highland black teas, and ceramic pour-over tools.',
        imageUrl: '/src/assets/images/product_bugisu_arabica_1795630082121.jpg',
      },
      {
        name: 'Textiles & Crafts',
        slug: 'textiles-crafts',
        description:
          'Handwoven Ugandan sisal baskets, wax-print kitenge bolts, and East African loom textiles.',
        imageUrl: '/src/assets/images/shop_mbale_loom_1795630082570.jpg',
      },
      {
        name: 'Fresh Harvest & Pantry',
        slug: 'fresh-harvest',
        description:
          'Raw Mount Elgon wildflower honey, sun-ripened Mbale avocados, ginger, and highland spices.',
        imageUrl: '/src/assets/images/shop_fresh_harvest_1795630081980.jpg',
      },
      {
        name: 'Botanicals & Wellness',
        slug: 'botanicals-wellness',
        description:
          'Cold-pressed Ugandan Nilotica shea butter, moringa infusions, and natural apothecary balms.',
        imageUrl: '/src/assets/images/product_shea_botanicals_1795630083347.jpg',
      },
      {
        name: 'Home & Ceramics',
        slug: 'home-ceramics',
        description:
          'Hand-coiled terracotta vessels, woven banana-fiber storage urns, and carved timber housewares.',
        imageUrl: '/src/assets/images/product_sisal_craft_1795630082683.jpg',
      },
    ])
    .returning();

  const [catCoffee, catTextiles, catPantry, catBotanicals, catHome] = insertedCategories;

  // 3. Seed Shops
  const insertedShops = await db
    .insert(shop)
    .values([
      {
        ownerUserId: mRoaster.id,
        categoryId: catCoffee.id,
        name: 'Elgon Summit Roasters',
        slug: 'elgon-summit-roasters',
        tagline: 'Small-batch Bugisu Arabica roasted daily at the foot of Mount Elgon.',
        description:
          'Sourcing directly from smallholder cooperatives in Bududa, Sironko, and Sipi at 1,800m–2,200m elevation. Visit our courtyard tasting bar for freshly ground espresso, pour-over flights, and whole-bean reserve bags.',
        unitLocation: 'Ground Floor · Courtyard Arch A-02',
        phone: '+256 772 410 218',
        email: 'roastery@elgonroasters.ug',
        openingHours: 'Mon–Sat 07:30 – 20:30 · Sun 09:00 – 18:00',
        imageUrl: '/src/assets/images/shop_elgon_roasters_1795630080930.jpg',
        isFeatured: true,
      },
      {
        ownerUserId: mLoom.id,
        categoryId: catTextiles.id,
        name: 'Aina Loom & Kitenge House',
        slug: 'aina-loom-kitenge',
        tagline: 'Handcrafted East African textiles, kitenge bolts, and woven sisal ware.',
        description:
          'Celebrating eastern Ugandan weaving heritage with vibrant wax-print kitenge, hand-dyed sisal market baskets, and tailored everyday garments stitched on-site in our Naboa atelier.',
        unitLocation: 'Ground Floor · East Colonnade B-05',
        phone: '+256 701 884 312',
        email: 'hello@ainaloom.ug',
        openingHours: 'Mon–Sat 08:30 – 20:00 · Sun 10:00 – 18:00',
        imageUrl: '/src/assets/images/shop_mbale_loom_1795630082570.jpg',
        isFeatured: true,
      },
      {
        ownerUserId: mPantry.id,
        categoryId: catPantry.id,
        name: 'Membere Highland Pantry',
        slug: 'membere-highland-pantry',
        tagline: 'Raw Mount Elgon honey, highland spices, and orchard-fresh Mbale produce.',
        description:
          'Curated straight from Bugisu hillside apiaries and family farms. Stock up on unfiltered wildflower honey, aromatic ginger, cardamom, cinnamon bark, and morning-picked Hass avocados.',
        unitLocation: 'Ground Floor · Market Atrium A-09',
        phone: '+256 782 550 914',
        email: 'orders@memberepantry.ug',
        openingHours: 'Mon–Sat 07:30 – 21:00 · Sun 09:00 – 19:00',
        imageUrl: '/src/assets/images/shop_fresh_harvest_1795630081980.jpg',
        isFeatured: true,
      },
      {
        ownerUserId: mPantry.id,
        categoryId: catBotanicals.id,
        name: 'Nilotica Apothecary Mbale',
        slug: 'nilotica-apothecary',
        tagline: 'Cold-pressed northern Ugandan shea butter & Mount Elgon botanical skincare.',
        description:
          'Formulated in small batches without synthetic fillers. Our whipped Nilotica shea balms and moringa botanical oils nourish skin with ingredients harvested across eastern and northern Uganda.',
        unitLocation: 'First Floor · Balcony Suite C-03',
        phone: '+256 775 903 441',
        email: 'care@niloticaapothecary.ug',
        openingHours: 'Mon–Sat 09:00 – 20:00 · Sun 10:30 – 17:30',
        imageUrl: '/src/assets/images/product_shea_botanicals_1795630083347.jpg',
        isFeatured: false,
      },
      {
        ownerUserId: mLoom.id,
        categoryId: catHome.id,
        name: 'Wanale Clay & Timber',
        slug: 'wanale-clay-timber',
        tagline: 'Terracotta vessels, woven storage baskets, and warm eucalyptus table pieces.',
        description:
          'Bringing the tactile warmth of Wanale Ridge clay and woven banana-fiber craftsmanship into Mbale homes, cafes, and hospitality spaces.',
        unitLocation: 'First Floor · Courtyard Studio C-07',
        phone: '+256 753 219 778',
        email: 'studio@wanaleclay.ug',
        openingHours: 'Mon–Sat 09:00 – 19:30 · Sun 11:00 – 17:00',
        imageUrl: '/src/assets/images/product_sisal_craft_1795630082683.jpg',
        isFeatured: false,
      },
    ])
    .returning();

  const [shopRoasters, shopAina, shopMembere, shopNilotica, shopWanale] = insertedShops;

  // 4. Seed Products
  const insertedProducts = await db
    .insert(product)
    .values([
      {
        shopId: shopRoasters.id,
        categoryId: catCoffee.id,
        name: 'Bugisu AA Whole Bean Reserve',
        slug: 'bugisu-aa-whole-bean-reserve',
        description:
          'Washed high-altitude Arabica grown on volcanic Mount Elgon slopes (1,950m). Tasting notes of dark chocolate, sweet tamarind, and roasted hazelnut.',
        priceUgx: 38000,
        stockQty: 34,
        unitLabel: '500g bag',
        imageUrl: '/src/assets/images/product_bugisu_arabica_1795630082121.jpg',
        isTrending: true,
      },
      {
        shopId: shopRoasters.id,
        categoryId: catCoffee.id,
        name: 'Sipi Falls Espresso Blend',
        slug: 'sipi-falls-espresso-blend',
        description:
          'Rich medium-dark roast balanced for moka pot, French press, and espresso extraction. Velvety crema with caramelized cane sugar finish.',
        priceUgx: 42000,
        stockQty: 18,
        unitLabel: '500g bag',
        imageUrl: '/src/assets/images/shop_elgon_roasters_1795630080930.jpg',
        isTrending: false,
      },
      {
        shopId: shopRoasters.id,
        categoryId: catCoffee.id,
        name: 'Elgon Gold Pour-Over Dripper Set',
        slug: 'elgon-gold-pour-over-set',
        description:
          'Speckled stoneware V60-style dripper, borosilicate glass carafe, and a 250g starter pouch of freshly roasted Bugisu AA ground to order.',
        priceUgx: 85000,
        stockQty: 11,
        unitLabel: '3-piece set',
        imageUrl: '/src/assets/images/product_bugisu_arabica_1795630082121.jpg',
        isTrending: false,
      },
      {
        shopId: shopAina.id,
        categoryId: catTextiles.id,
        name: 'Mount Elgon Handwoven Sisal Basket',
        slug: 'mount-elgon-sisal-basket',
        description:
          'Tightly coiled natural sisal and banana-fiber market tote dyed in terracotta clay, Elgon forest green, and cream with reinforced braided handles.',
        priceUgx: 55000,
        stockQty: 14,
        unitLabel: '32cm tote',
        imageUrl: '/src/assets/images/product_sisal_craft_1795630082683.jpg',
        isTrending: true,
      },
      {
        shopId: shopAina.id,
        categoryId: catTextiles.id,
        name: 'Naboa Wax-Print Kitenge Bolt',
        slug: 'naboa-wax-print-kitenge',
        description:
          '100% combed cotton East African wax print in warm terracotta, forest green, and gold motifs. Ideal for tailoring dresses, shirts, or home cushions.',
        priceUgx: 68000,
        stockQty: 22,
        unitLabel: '6 yards',
        imageUrl: '/src/assets/images/shop_mbale_loom_1795630082570.jpg',
        isTrending: true,
      },
      {
        shopId: shopAina.id,
        categoryId: catTextiles.id,
        name: 'Handloomed Cotton & Ochre Table Runner',
        slug: 'handloomed-cotton-table-runner',
        description:
          'Heavyweight woven cotton runner finished with hand-knotted tassels. Adds warm Mbale texture to dining tables and sideboards.',
        priceUgx: 48000,
        stockQty: 15,
        unitLabel: '180cm × 40cm',
        imageUrl: '/src/assets/images/shop_mbale_loom_1795630082570.jpg',
        isTrending: false,
      },
      {
        shopId: shopMembere.id,
        categoryId: catPantry.id,
        name: 'Mount Elgon Wildflower Raw Honey',
        slug: 'mount-elgon-wildflower-honey',
        description:
          'Pure, unfiltered highland honey harvested from forest-edge hives in Kapchorwa and Bugisu. Rich floral aroma and smooth golden texture.',
        priceUgx: 28000,
        stockQty: 40,
        unitLabel: '500g glass jar',
        imageUrl: '/src/assets/images/product_shea_botanicals_1795630083347.jpg',
        isTrending: true,
      },
      {
        shopId: shopMembere.id,
        categoryId: catPantry.id,
        name: 'Bugisu Highland Spice & Ginger Tray',
        slug: 'bugisu-highland-spice-tray',
        description:
          'Aromatic East African pantry bundle featuring sun-dried Mbale ginger root, whole green cardamom pods, cloves, and Ceylon cinnamon quills.',
        priceUgx: 24000,
        stockQty: 29,
        unitLabel: '400g curated box',
        imageUrl: '/src/assets/images/shop_fresh_harvest_1795630081980.jpg',
        isTrending: false,
      },
      {
        shopId: shopMembere.id,
        categoryId: catPantry.id,
        name: 'Kieju Farm Morning Hass Avocados',
        slug: 'kieju-farm-hass-avocados',
        description:
          'Creamy, oil-rich Hass avocados picked fresh from Bugisu hillside orchards each morning and packed in breathable woven crates.',
        priceUgx: 18000,
        stockQty: 45,
        unitLabel: '2kg basket',
        imageUrl: '/src/assets/images/shop_fresh_harvest_1795630081980.jpg',
        isTrending: false,
      },
      {
        shopId: shopNilotica.id,
        categoryId: catBotanicals.id,
        name: 'Whipped Ugandan Nilotica Shea Butter',
        slug: 'whipped-ugandan-nilotica-shea',
        description:
          'Silky, cold-pressed Vitellaria nilotica shea butter whipped to melt effortlessly on contact. Deeply moisturizing for skin and natural hair.',
        priceUgx: 35000,
        stockQty: 27,
        unitLabel: '250g amber jar',
        imageUrl: '/src/assets/images/product_shea_botanicals_1795630083347.jpg',
        isTrending: true,
      },
      {
        shopId: shopNilotica.id,
        categoryId: catBotanicals.id,
        name: 'Cold-Pressed Moringa & Lemongrass Oil',
        slug: 'cold-pressed-moringa-lemongrass-oil',
        description:
          'Lightweight botanical body and beard elixir infused with fresh Mbale lemongrass and nutrient-dense moringa seed oil.',
        priceUgx: 32000,
        stockQty: 16,
        unitLabel: '150ml bottle',
        imageUrl: '/src/assets/images/product_shea_botanicals_1795630083347.jpg',
        isTrending: false,
      },
      {
        shopId: shopWanale.id,
        categoryId: catHome.id,
        name: 'Terracotta & Banana-Fiber Woven Urn',
        slug: 'terracotta-banana-fiber-urn',
        description:
          'Architectural statement basket woven in Mbale with natural banana-bark fiber and terracotta-dyed geometric diamond bands.',
        priceUgx: 74000,
        stockQty: 9,
        unitLabel: '40cm vessel',
        imageUrl: '/src/assets/images/product_sisal_craft_1795630082683.jpg',
        isTrending: true,
      },
    ])
    .returning();

  // 5. Seed Delivery Men
  await db.insert(deliveryMan).values([
    {
      fullName: 'Ronald Mukasa',
      phone: '+256 774 310 842',
      vehicleType: 'Boda-Boda Express',
      plateNumber: 'UEY 418K',
      zone: 'mbale-central',
      isActive: true,
    },
    {
      fullName: 'Joel Wabwire',
      phone: '+256 752 609 114',
      vehicleType: 'Boda-Boda Express',
      plateNumber: 'UFA 902M',
      zone: 'senior-quarters',
      isActive: true,
    },
    {
      fullName: 'Grace Nabwire',
      phone: '+256 781 245 773',
      vehicleType: 'Cargo Tuk-Tuk',
      plateNumber: 'UBE 331P',
      zone: 'nkoma-namakwekwe',
      isActive: true,
    },
    {
      fullName: 'Samuel Kipsang',
      phone: '+256 704 883 519',
      vehicleType: 'Delivery Van',
      plateNumber: 'UBH 740R',
      zone: 'wanale-industrial',
      isActive: true,
    },
  ]);

  // 6. Seed Reviews
  const [pBugisu, pSipi, , pSisal, pKitenge, , pHoney, , , pShea, , pUrn] =
    insertedProducts;

  await db.insert(reviews).values([
    {
      productId: pBugisu.id,
      userId: custSarah.id,
      rating: 5,
      title: 'Best morning pour-over in Mbale',
      comment:
        'Bought two bags from Wing A-02 last Saturday. Freshly roasted aroma fills the whole kitchen and the dark chocolate notes really shine.',
    },
    {
      productId: pBugisu.id,
      userId: custDavid.id,
      rating: 5,
      title: 'Consistent medium roast every time',
      comment:
        'Delivered to Nkoma within 35 minutes via boda courier. Properly sealed bag with roast date printed clearly.',
    },
    {
      productId: pSisal.id,
      userId: custAmina.id,
      rating: 5,
      title: 'Sturdy weave and rich terracotta tones',
      comment:
        'Carries heavy market produce effortlessly without losing shape. Looks wonderful even sitting in our living room.',
    },
    {
      productId: pHoney.id,
      userId: custSarah.id,
      rating: 5,
      title: 'Authentic wildflower aroma',
      comment:
        'Thick, floral, and completely pure—nothing like supermarket syrups. Great with warm chapati or Bugisu tea.',
    },
    {
      productId: pShea.id,
      userId: custAmina.id,
      rating: 4,
      title: 'Melts smoothly in seconds',
      comment:
        'Nilotica shea is so much softer than West African shea. My skin stays hydrated all day even in dry harmattan breezes.',
    },
    {
      productId: pKitenge.id,
      userId: custDavid.id,
      rating: 5,
      title: 'Vibrant print and thick cotton',
      comment:
        'Picked up 6 yards for a family celebration in Sironko. Colors stayed crisp after washing.',
    },
    {
      productId: pSipi.id,
      userId: custDavid.id,
      rating: 5,
      title: 'Punchy espresso crema',
      comment:
        'Works brilliantly in my stovetop moka pot every morning before heading down Republic Street.',
    },
    {
      productId: pUrn.id,
      userId: custSarah.id,
      rating: 5,
      title: 'Craftsmanship worth every shilling',
      comment:
        'The geometric diamond band matches our warm clay tiles perfectly.',
    },
  ]);
}

export async function ensureSeeded(): Promise<void> {
  if (!seedPromise) {
    seedPromise = runSeed().catch((err) => {
      seedPromise = null;
      throw err;
    });
  }
  return seedPromise;
}
