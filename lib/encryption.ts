/**
 * Encryption Utilities
 * Provides AES-256-GCM encryption/decryption for sensitive data
 * Uses Web Crypto API for both Node.js and browser environments
 */

import { env } from "@/envConfig";

// AES-GCM configuration constants
const IV_LENGTH = 12; // 12 bytes recommended for AES-GCM
const TAG_LENGTH = 128; // 128-bit authentication tag
const ALGORITHM = { name: "AES-GCM", length: 256 } as const;

/**
 * Import encryption key from environment variable
 * Converts hex string to CryptoKey for AES-256-GCM operations
 */
async function getEncryptionKey(): Promise<CryptoKey> {
	// Convert hex string to byte array (validated by Zod, so safe to assert)
	const hexPairs = env.ENCRYPTION_KEY.match(/.{2}/g);
	if (!hexPairs) {
		throw new Error("Invalid ENCRYPTION_KEY format");
	}

	const keyBytes = new Uint8Array(
		hexPairs.map((byte) => Number.parseInt(byte, 16)),
	);

	return crypto.subtle.importKey(
		"raw",
		keyBytes.buffer as ArrayBuffer,
		ALGORITHM,
		false,
		["encrypt", "decrypt"],
	);
}

/**
 * Encrypt plaintext using AES-256-GCM
 * Returns base64-encoded string containing IV + ciphertext + auth tag
 *
 * @param plaintext - The text to encrypt
 * @returns Base64-encoded encrypted data
 * @throws Error if encryption fails
 */
export async function encrypt(plaintext: string): Promise<string> {
	const key = await getEncryptionKey();
	const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
	const plaintextBytes = new TextEncoder().encode(plaintext);

	const ciphertext = await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv, tagLength: TAG_LENGTH },
		key,
		plaintextBytes,
	);

	// Combine IV + ciphertext into single array
	const combined = new Uint8Array(IV_LENGTH + ciphertext.byteLength);
	combined.set(iv);
	combined.set(new Uint8Array(ciphertext), IV_LENGTH);

	// Convert to base64 (Node.js or browser compatible)
	return typeof Buffer !== "undefined"
		? Buffer.from(combined).toString("base64")
		: btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt base64-encoded encrypted data using AES-256-GCM
 *
 * @param encryptedData - Base64-encoded encrypted data
 * @returns Decrypted plaintext
 * @throws Error if decryption fails (wrong key, tampered data, etc.)
 */
export async function decrypt(encryptedData: string): Promise<string> {
	const key = await getEncryptionKey();

	// Decode base64 to bytes (Node.js or browser compatible)
	const combined =
		typeof Buffer !== "undefined"
			? new Uint8Array(Buffer.from(encryptedData, "base64"))
			: new Uint8Array(
					atob(encryptedData)
						.split("")
						.map((c) => c.charCodeAt(0)),
				);

	// Extract IV and ciphertext
	const iv = combined.slice(0, IV_LENGTH);
	const ciphertext = combined.slice(IV_LENGTH);

	const plaintextBytes = await crypto.subtle.decrypt(
		{ name: "AES-GCM", iv, tagLength: TAG_LENGTH },
		key,
		ciphertext,
	);

	return new TextDecoder().decode(plaintextBytes);
}

/**
 * Safely decrypt data, returning null on failure
 * Use this for non-critical paths where graceful degradation is acceptable
 *
 * @param encryptedData - Base64-encoded encrypted data
 * @returns Decrypted plaintext or null if decryption fails
 */
export async function safeDecrypt(
	encryptedData: string,
): Promise<string | null> {
	try {
		return await decrypt(encryptedData);
	} catch {
		return null;
	}
}
