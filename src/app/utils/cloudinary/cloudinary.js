export async function uploadToCloudinary(file) {
	const form = new FormData();
	form.append("file", file);
	form.append("upload_preset", "ippo_sampo");
	form.append("folder", "ippo");

	const res = await fetch(
		"https://api.cloudinary.com/v1_1/dnehmdy45/image/upload",
		{ method: "POST", body: form }
	);
	
	const data = await res.json();

	if (res.ok) {
		return data.secure_url;
	} else {
		console.error("Cloudinary upload failed:", data);
		throw new Error("Cloudinaryアップロード失敗");
	}
}
