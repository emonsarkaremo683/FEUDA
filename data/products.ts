
import { Product, Review } from '../types';

const generateReviews = (count: number): Review[] => {
  const users = ['Alex R.', 'Sarah M.', 'Jordan K.', 'Taylor B.', 'Casey W.'];
  const comments = [
    'Amazing quality! Fits perfectly.',
    'Fast shipping and great packaging.',
    'Highly recommended, looks very premium.',
    'The best case I have ever owned.',
    'Excellent value for the price.'
  ];
  return Array.from({ length: count }, (_, i) => ({
    id: `rev-${i}`,
    user: users[i % users.length],
    rating: 4 + Math.random(),
    comment: comments[i % comments.length],
    date: '2 days ago'
  }));
};

export const CATEGORY_NAMES: string[] = ['Clear Cases', 'MagSafe', 'Screen Protectors', 'Chargers', 'Lens Guards'];

const generateProducts = (): Product[] => {
  const categories = CATEGORY_NAMES;
  const baseProducts: Product[] = [];

  // Add specific products from screenshot
  const featuredProducts: Product[] = [
    {
      id: 'torras-gawx-q3',
      name: 'TORRAS X GAWX Q3 Air Limited Edition',
      category: 'MagSafe',
      price: 99.18, // Adjusted to match approximate relation if using USD, or strictly visual
      image: 'https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?q=80&w=800&auto=format&fit=crop',
      images: ['https://images.unsplash.com/photo-1603313011101-320f26a4f6f6?q=80&w=800&auto=format&fit=crop'],
      modelCompatibility: 'iPhone 17 Pro Max',
      description: 'Limited edition collaboration featuring unique artwork and superior protection.',
      specifications: ['MagSafe Compatible', 'Drop Protection', 'Limited Edition'],
      isBestSeller: true,
      colors: ['#A78BFA', '#4B5563'], // Purple, Gray
      reviews: generateReviews(5),
      stock: 10
    },
    {
      id: 'ostand-o3-winter',
      name: 'Ostand O3 Air Winter Edition',
      category: 'Clear Cases',
      price: 80.58,
      image: 'https://images.unsplash.com/photo-1592917760305-d85086663f29?q=80&w=800&auto=format&fit=crop',
      images: ['https://images.unsplash.com/photo-1592917760305-d85086663f29?q=80&w=800&auto=format&fit=crop'],
      modelCompatibility: 'iPhone 17 Pro Max',
      description: 'Crystal clear protection with a built-in stand, winter edition.',
      specifications: ['Clear Back', 'Kickstand', 'Anti-Yellowing'],
      isBestSeller: false,
      colors: ['#C4B5FD', '#9CA3AF'], 
      reviews: generateReviews(2),
      stock: 20
    },
    {
      id: 'ostand-q3-colorblock',
      name: 'Ostand Q3 Air',
      category: 'MagSafe',
      price: 81.82,
      image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3bd99?q=80&w=800&auto=format&fit=crop',
      images: ['https://images.unsplash.com/photo-1541807084-5c52b6b3bd99?q=80&w=800&auto=format&fit=crop'],
      modelCompatibility: 'iPhone 17 Pro Max Colorblock',
      description: 'Vibrant colorblock design with magsafe capability.',
      specifications: ['Colorblock', 'MagSafe', 'Slim Fit'],
      isBestSeller: true,
      colors: ['#8B5CF6', '#EC4899'], // Violet, Pink
      reviews: generateReviews(8),
      stock: 15
    },
    {
      id: 'ostand-q3-air',
      name: 'Ostand Q3 Air',
      category: 'MagSafe',
      price: 81.82,
      image: 'https://images.unsplash.com/photo-1696446700547-4952054238e5?q=80&w=800&auto=format&fit=crop',
      images: ['https://images.unsplash.com/photo-1696446700547-4952054238e5?q=80&w=800&auto=format&fit=crop'],
      modelCompatibility: 'iPhone 17 Pro Max',
      description: 'The standard for protection and utility.',
      specifications: ['MagSafe', 'Stand', 'Durable'],
      isBestSeller: false,
      colors: ['#1F2937', '#0EA5E9', '#64748B', '#F97316', '#65A30D'], // Dark, Blue, Slate, Orange, Green
      reviews: generateReviews(12),
      stock: 50
    }
  ];

  baseProducts.push(...featuredProducts);

  categories.forEach((cat) => {
    for (let i = 1; i <= 6; i++) {
      const id = `${cat.toLowerCase().replace(' ', '-')}-${i}`;
      baseProducts.push({
        id,
        name: `${cat} Premium ${i}`,
        category: cat,
        price: 19.99 + (i * 5),
        image: `https://picsum.photos/seed/${id}/600/600`,
        images: [
          `https://picsum.photos/seed/${id}-1/600/600`,
          `https://picsum.photos/seed/${id}-2/600/600`
        ],
        modelCompatibility: 'iPhone 15 Pro Max',
        description: `This high-performance ${cat} is engineered with premium materials.`,
        specifications: ['Material: Polycarbonate', 'Warranty: 1 Year'],
        isBestSeller: i < 2,
        colors: i % 2 === 0 ? ['#000000', '#FFFFFF'] : ['#EF4444', '#3B82F6', '#10B981'],
        reviews: generateReviews(1)
      });
    }
  });

  return baseProducts;
};

export const products: Product[] = generateProducts();
export const CATEGORIES: string[] = ['All', ...CATEGORY_NAMES];
