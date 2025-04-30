// frontend/src/utils/uploadToPinata.js
export async function uploadToPinata(file) {
    const formData = new FormData();
    formData.append("file", file);
  
    const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
      },
      body: formData,
    });
  
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Pinata upload failed: ${res.status} - ${errorText}`);
    }
  
    const data = await res.json();
    return data.IpfsHash;
  }
  