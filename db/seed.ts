/**
 * Database Seeding Script
 * Creates the global admin user if it doesn't exist
 * Run with: pnpm db:seed
 */

import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";
import * as authSchema from "@/auth-schema";
import { user } from "@/auth-schema";
import { db } from "@/db";
import { env } from "@/envConfig";

// Create a minimal auth instance for seeding (without OAuth providers)
const seedAuth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "sqlite",
		schema: authSchema,
	}),
	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false,
	},
	session: {
		expiresIn: 60 * 60 * 24 * 7,
		updateAge: 60 * 60 * 24,
	},
	basePath: "/api/auth",
	baseURL: env.NEXT_PUBLIC_APP_URL,
	secret: env.BETTER_AUTH_SECRET,
});

/**
 * Seed the global admin user
 */
async function seedGlobalAdmin() {
	const adminEmail = env.GLOBAL_ADMIN_EMAIL;
	const adminPassword = env.GLOBAL_ADMIN_PASSWORD;

	console.log(`🌱 Seeding database...`);
	console.log(`📧 Global admin email: ${adminEmail}`);

	try {
		// Check if admin user already exists
		const existingUser = await db
			.select()
			.from(user)
			.where(eq(user.email, adminEmail))
			.limit(1);

		if (existingUser.length > 0) {
			console.log(
				`✅ Global admin user already exists with email: ${adminEmail}`,
			);

			// Check if they're already marked as global admin
			if (!existingUser[0].isGlobalAdmin) {
				console.log(`🔧 Updating user to be global admin...`);
				await db
					.update(user)
					.set({ isGlobalAdmin: true })
					.where(eq(user.email, adminEmail));
				console.log(`✅ User marked as global admin`);
			}

			return;
		}

		console.log(`👤 Creating global admin user...`);

		// Use better-auth's signUp API to create user with proper password hashing
		const result = await seedAuth.api.signUpEmail({
			body: {
				email: adminEmail,
				password: adminPassword,
				name: "Global Admin",
			},
		});

		if (!result || !result.user) {
			throw new Error("Failed to create user via better-auth API");
		}

		// Mark the user as global admin
		await db
			.update(user)
			.set({ isGlobalAdmin: true, emailVerified: true })
			.where(eq(user.id, result.user.id));

		console.log(`✅ Global admin user created successfully!`);
		console.log(`📧 Email: ${adminEmail}`);
		console.log(`🔑 Password: ${adminPassword}`);
		console.log(
			`\n⚠️  IMPORTANT: Change the password immediately in production!`,
		);
	} catch (error) {
		console.error(`❌ Error seeding global admin:`, error);
		throw error;
	}
}

/**
 * Main seed function
 */
async function main() {
	console.log(`\n🚀 Starting database seed...\n`);

	await seedGlobalAdmin();

	console.log(`\n✨ Database seeding completed!\n`);
	process.exit(0);
}

// Run the seed script
main().catch((error) => {
	console.error(`❌ Seed script failed:`, error);
	process.exit(1);
});
