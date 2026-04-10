export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const HF_TOKEN = process.env.HF_TOKEN;

    if (!HF_TOKEN) {
        return res.status(500).json({ 
            error: 'API key not configured. Add your Hugging Face token (HF_TOKEN) to Vercel Environment Variables.' 
        });
    }

    try {
        const response = await fetch("https://router.huggingface.co/v1/chat/completions", {
            headers: { 
                Authorization: `Bearer ${HF_TOKEN}`, 
                "Content-Type": "application/json" 
            },
            method: "POST",
            body: JSON.stringify(req.body),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMsg = errorData.error?.message || response.statusText || `HTTP ${response.status}`;
            return res.status(response.status).json({ error: `Hugging Face API Error (${response.status}): ${errorMsg}` });
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}
