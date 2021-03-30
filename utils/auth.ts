import bcrypt from "bcrypt"

export async function encryptData(string: string)  {
	const salt = await bcrypt.genSalt(10);
	const hash = await bcrypt.hash(string, salt);
	return hash;
}

export async function decryptData(string: string, hash: string) {
	const match = await bcrypt.compare(string, hash);
	return match;
}
