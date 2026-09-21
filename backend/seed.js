import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const MONGO_URI =
    process.env.MONGO_URI ||
    'mongodb://127.0.0.1:27017/devgear';

const sampleProducts = [
    {
        title: 'Mechanical Gaming Keyboard',

        description:
            'Tactile mechanical switches with customizable RGB backlighting and durable aluminum frame.',

        price: 119.99,

        category: 'Keyboards',

        image:
            'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',

        stock: 25
    },

    {
        title: 'Ergonomic Wireless Mouse',

        description:
            'Precision tracking mouse with multi-device switching and customizable thumb controls.',

        price: 79.99,

        category: 'Mice',

        image:
            'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=600&q=80',

        stock: 40
    },

    {
        title: 'UltraWide 34" Curved Monitor',

        description:
            '144Hz WQHD curved monitor designed for immersive coding and multitasking environments.',

        price: 499.99,

        category: 'Monitors',

        image:
            'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80',

        stock: 12
    },

    {
        title: 'Noise-Canceling Wireless Headphones',

        description:
            'Over-ear headphones featuring active noise cancellation and up to 30 hours of battery life.',

        price: 199.99,

        category: 'Audio',

        image:
            'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',

        stock: 18
    },

    {
        title: 'Adjustable Aluminium Laptop Stand',

        description:
            'Elevates your laptop screen to eye level for improved ergonomics and thermal ventilation.',

        price: 39.99,

        category: 'Accessories',

        image:
            'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80',

        stock: 50
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(MONGO_URI);

        console.log('Connected to MongoDB for seeding...');

        // Development-only behavior:
        // Clear existing products before inserting sample data.
        await Product.deleteMany({});

        console.log('Existing products cleared.');

        const createdProducts = await Product.insertMany(
            sampleProducts
        );

        console.log(
            `Successfully seeded ${createdProducts.length} products!`
        );

        await mongoose.disconnect();

        process.exit(0);
    } catch (err) {
        console.error('Error seeding database:', err);

        await mongoose.disconnect().catch(() => { });

        process.exit(1);
    }
};

seedDB();