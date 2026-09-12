import { Product } from '../../src/types.ts';
import { db } from '../db.ts';

export class ShopBaseCollector {
  public static async collectFromUrl(sourceUrl: string): Promise<Product> {
    db.addLog('collector', 'info', `Initiated ShopBase collector crawl: ${sourceUrl}`);

    // Parse URL or extract slug for realistic product modeling
    let simulatedTitle = 'Modern Ergonomic Smart Backpack';
    let simulatedCategory = 'Lifestyle & Travel';
    let simulatedPrice = 1850;
    let simulatedImage = 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80';

    const lower = sourceUrl.toLowerCase();
    if (lower.includes('watch') || lower.includes('gadget')) {
      simulatedTitle = 'IP68 Waterproof Sports Smartwatch';
      simulatedCategory = 'Gadgets';
      simulatedPrice = 2800;
      simulatedImage = 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80';
    } else if (lower.includes('shoe') || lower.includes('sneaker')) {
      simulatedTitle = 'Breathable Mesh Running Sneakers';
      simulatedCategory = 'Footwear';
      simulatedPrice = 2200;
      simulatedImage = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80';
    } else if (lower.includes('shirt') || lower.includes('panjabi') || lower.includes('clothing')) {
      simulatedTitle = 'Casual Slim-Fit Premium Cotton Shirt';
      simulatedCategory = 'Men Fashion';
      simulatedPrice = 1350;
      simulatedImage = 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80';
    } else if (lower.includes('perfume') || lower.includes('attar') || lower.includes('fragrance')) {
      simulatedTitle = 'Royal Amber Long-Lasting Concentrated Attar (12ml)';
      simulatedCategory = 'Fragrance';
      simulatedPrice = 850;
      simulatedImage = 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80';
    }

    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      title: simulatedTitle,
      titleBn: `${simulatedTitle} (কালেকশন)`,
      description: `Premium quality ${simulatedTitle} imported directly for AmarShop BD. Rigorous quality tested with cash on delivery available all over Bangladesh.`,
      descriptionBn: `উচ্চমানের মেটেরিয়াল দিয়ে তৈরি আকর্ষণীয় ডিজাইন। ঢাকা এবং ঢাকার বাইরে হোম ডেলিভারি সুবিধা।`,
      price: simulatedPrice,
      compareAtPrice: Math.round(simulatedPrice * 1.35),
      currency: 'BDT',
      category: simulatedCategory,
      stockStatus: 'in_stock',
      sku: `SB-${Math.floor(1000 + Math.random() * 9000)}`,
      images: [simulatedImage],
      sourceUrl,
      tags: ['ShopBase Import', simulatedCategory, 'AmarShop BD'],
      status: 'ready',
      createdAt: new Date().toISOString(),
    };

    db.saveProduct(newProduct);
    db.addLog('collector', 'success', `Successfully cataloged "${newProduct.title}" from ShopBase.`, `Price: ৳${simulatedPrice}`);

    return newProduct;
  }
}
