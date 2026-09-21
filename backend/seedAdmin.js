import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import prompts from 'prompts';
import User from './models/User.js';

const MONGO_URI =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI;

const ADMIN_EMAIL = 'admin@devgear.com';

const seedAdmin = async () => {
    try {
        const response = await prompts([
            {
                type: 'password',
                name: 'password',
                message: 'Enter admin password:',
                validate: (value) =>
                    value.length >= 8 ||
                    'Password must be at least 8 characters'
            }
        ]);

        if (!response.password) {
            console.log('Admin setup cancelled.');
            return;
        }

        await mongoose.connect(MONGO_URI);

        console.log('Connected to MongoDB.');

        const hashedPassword = await bcrypt.hash(
            response.password,
            12
        );

        const admin = await User.findOneAndUpdate(
            { email: ADMIN_EMAIL },
            {
                name: 'DevGear Admin',
                email: ADMIN_EMAIL,
                password: hashedPassword,
                role: 'admin'
            },
            {
                new: true,
                upsert: true,
                runValidators: true
            }
        );

        console.log(`Admin ready: ${admin.email}`);
        console.log(`Role: ${admin.role}`);
    } catch (error) {
        console.error('Admin setup error:', error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect().catch(() => { });
    }
};

seedAdmin();