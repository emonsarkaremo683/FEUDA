
export const CATEGORY_NAMES = ['All', 'Clear Cases', 'MagSafe', 'Screen Protectors', 'Chargers', 'Lens Guards'];

export const products = [
  {
    id: '1',
    name: 'Titanium Hybrid Clear Case',
    category: 'Clear Cases',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=800'
    ],
    modelCompatibility: 'iPhone 15 Pro, iPhone 15 Pro Max',
    description: 'Experience the perfect blend of protection and aesthetics. Our Titanium Hybrid Clear Case features a shock-absorbent TPU bumper and a crystal-clear polycarbonate back that won\'t yellow over time.',
    specifications: ['MIL-STD 810G Certified', 'Raised 1.5mm Screen Lip', 'Precision Cutouts', 'Anti-Yellowing Coating'],
    isBestSeller: true,
    stock: 45,
    colors: [
      { name: 'Crystal Clear', hex: '#FFFFFF', images: ['https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&q=80&w=800'] },
      { name: 'Graphite', hex: '#4B4B4B', images: ['https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&q=80&w=800'] }
    ],
    reviews: [
      { id: 'r1', user: 'Sarah J.', rating: 5, comment: 'Finally a clear case that actually stays clear! Fits my 15 Pro perfectly.', date: '2024-03-15' },
      { id: 'r2', user: 'Michael R.', rating: 4, comment: 'Great protection, slightly bulky but worth it.', date: '2024-03-10' }
    ]
  },
  {
    id: '2',
    name: 'MagSafe Carbon Fiber Elite',
    category: 'MagSafe',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1555489122-f441549cc21d?auto=format&fit=crop&q=80&w=800'
    ],
    modelCompatibility: 'iPhone 14/15 Series',
    description: 'Ultra-slim, ultra-strong. Crafted from real aerospace-grade aramid fiber, this case provides superior protection without the weight. Fully compatible with all MagSafe accessories.',
    specifications: ['Aramid Fiber Construction', 'N52 Strong Magnets', '0.6mm Ultra-Thin', 'Scratch Resistant'],
    isBestSeller: true,
    stock: 12,
    colors: [
      { name: 'Matte Black', hex: '#1A1A1A', images: ['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&q=80&w=800'] }
    ],
    reviews: [
      { id: 'r3', user: 'David W.', rating: 5, comment: 'The magnets are incredibly strong. Best MagSafe case I\'ve owned.', date: '2024-03-20' }
    ]
  },
  {
    id: '3',
    name: 'Privacy Tempered Glass Pro',
    category: 'Screen Protectors',
    price: 19.99,
    image: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&q=80&w=800'],
    modelCompatibility: 'Universal iPhone Sizes',
    description: 'Keep your business your own. Our 28-degree privacy filter ensures your screen is only visible to you. Made from 9H hardness tempered glass for maximum durability.',
    specifications: ['9H Hardness', '2.5D Rounded Edges', 'Oleophobic Coating', 'Bubble-Free Installation'],
    stock: 150,
    reviews: [
      { id: 'r4', user: 'Jessica T.', rating: 5, comment: 'Easy to install and the privacy filter works great on the train.', date: '2024-03-12' }
    ]
  },
  {
    id: '4',
    name: '30W GaN Nano Charger',
    category: 'Chargers',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=800'],
    modelCompatibility: 'USB-C Devices',
    description: 'Small size, massive power. Utilizing Gallium Nitride (GaN) technology, this charger is 50% smaller than standard bricks while providing full 30W fast charging.',
    specifications: ['30W PD Fast Charge', 'GaN Technology', 'Overheat Protection', 'Ultra-Compact Design'],
    stock: 85,
    colors: [
      { name: 'Arctic White', hex: '#F5F5F5', images: ['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=800'] },
      { name: 'Midnight', hex: '#000000', images: ['https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=800'] }
    ]
  },
  {
    id: '5',
    name: 'Sapphire Lens Protector',
    category: 'Lens Guards',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&q=80&w=800', // Reusing placeholder
    images: ['https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&q=80&w=800'],
    modelCompatibility: 'iPhone 15 Pro / Max',
    description: 'Protect your cameras without compromising photo quality. Individual sapphire-coated glass rings for each lens.',
    specifications: ['Sapphire Coating', 'AR Anti-Reflection', 'Aluminum Alloy Frame', 'Zero Image Distortion'],
    stock: 200
  },
  {
    id: '6',
    name: 'Liquid Silicone Soft Touch',
    category: 'Clear Cases',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=800'],
    modelCompatibility: 'iPhone 13/14/15 Series',
    description: 'Premium liquid silicone case with a soft microfiber lining. Incredible hand feel with military-grade drop protection.',
    specifications: ['Soft-Touch Silicone', 'Microfiber Lining', 'Full Coverage', 'Easy to Clean'],
    stock: 60,
    colors: [
      { name: 'Sand Pink', hex: '#F4D7D7', images: ['https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=800'] },
      { name: 'Navy Blue', hex: '#1B2E3C', images: ['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&q=80&w=800'] },
      { name: 'Pine Green', hex: '#2D3E2F', images: ['https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&q=80&w=800'] }
    ]
  },
  {
    id: '7',
    name: 'MagSafe Leather Wallet',
    category: 'MagSafe',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1622461066258-2086381e967a?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1622461066258-2086381e967a?auto=format&fit=crop&q=80&w=800'],
    modelCompatibility: 'MagSafe Compatible iPhones',
    description: 'Keep your essential cards close. Crafted from premium vegan leather with built-in magnets that snap perfectly to your iPhone.',
    specifications: ['Holds up to 3 cards', 'Shielded Magnets', 'Premium Vegan Leather', 'Slim Profile'],
    stock: 40
  },
  {
    id: '8',
    name: 'USB-C to Lightning Braided Cable',
    category: 'Chargers',
    price: 18.99,
    image: 'https://images.unsplash.com/photo-1589492477829-5e65395b66cc?auto=format&fit=crop&q=80&w=800',
    images: ['https://images.unsplash.com/photo-1589492477829-5e65395b66cc?auto=format&fit=crop&q=80&w=800'],
    modelCompatibility: 'Lightning Devices',
    description: 'Built to last. This 2-meter braided cable is MFi certified and tested to withstand over 15,000 bends.',
    specifications: ['2 Meter Length', 'Nylon Braided', 'MFi Certified', 'Fast Charge Support'],
    stock: 300
  }
];
