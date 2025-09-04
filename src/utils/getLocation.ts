import axios from "axios";

export async function getLatLng(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const apiKey = process.env.LOCATIONIQ_KEY;
    const url = `https://us1.locationiq.com/v1/search.php`;

    const res = await axios.get(url, {
      params: {
        key: apiKey,
        q: address,
        format: "json"
      }
    });

    if (res.data && res.data.length > 0) {
      return {
        lat: parseFloat(res.data[0].lat),
        lng: parseFloat(res.data[0].lon)
      };
    }

    return null;
  } catch (err) {
    console.error("LocationIQ geocoding failed:", err);
    return null;
  }
}
