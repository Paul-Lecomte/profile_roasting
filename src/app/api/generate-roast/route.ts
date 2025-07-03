import { NextRequest, NextResponse } from "next/server";

// --- Début Rate Limiter ---
const rateLimitMap = new Map<string, { count: number, last: number }>();
const RATE_LIMIT = 25; // max requêtes
const WINDOW = 60 * 1000; // 1 minute

function isRateLimited(ip: string) {
    const now = Date.now();
    const entry = rateLimitMap.get(ip) || { count: 0, last: now };
    if (now - entry.last > WINDOW) {
        rateLimitMap.set(ip, { count: 1, last: now });
        return false;
    }
    if (entry.count >= RATE_LIMIT) return true;
    rateLimitMap.set(ip, { count: entry.count + 1, last: entry.last });
    return false;
}
// --- Fin Rate Limiter ---

export async function POST(req: NextRequest) {
    // Récupération IP (fallback "unknown")
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(ip)) {
        return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
    }

    const { profile, roastType } = await req.json();

    const lightRoastPrompt = `
Lightly roast this GitHub user like it's a parody trading card. Keep the roast description short.

GitHub Profile:
${JSON.stringify(profile, null, 2)}

Generate:
- Name
- Title (funny dev title)
- Ability (A skill, 2 lines max)
- Attack (A funny roast attack, 2 lines max)
- Resistance (A funny resistance, 1 word)
- Weakness (A funny weakness, 1 word)
- Special Move
- Roast Description, 3 lines max
`;

    const mildRoastPrompt = `
Mildly roast this GitHub user like it's a parody trading card. Keep the roast description short.

GitHub Profile:
${JSON.stringify(profile, null, 2)}

Generate:
- Name
- Title (funny dev title)
- Ability (A skill, 2 lines max)
- Attack (A funny roast attack, 2 lines max)
- Resistance (A funny resistance, 1 word)
- Weakness (A funny weakness, 1 word)
- Special Move
- Roast Description, 3 lines max
`;

    const spicyRoastPrompt = `
Really really roast this GitHub user like it's a parody trading card. Keep the roast description short.

GitHub Profile:
${JSON.stringify(profile, null, 2)}

Generate:
- Name
- Title (funny dev title)
- Ability (A skill, 2 lines max)
- Attack (A funny roast attack, 2 lines max)
- Resistance (A funny resistance, 1 word)
- Weakness (A funny weakness, 1 word)
- Special Move
- Roast Description, 3 lines max
`;

    let prompt = mildRoastPrompt;
    if (roastType === "light") prompt = lightRoastPrompt;
    if (roastType === "spicy") prompt = spicyRoastPrompt;

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        return NextResponse.json({ error: "API key missing" }, { status: 500 });
    }

    let data;
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt,
                                },
                            ],
                        },
                    ],
                }),
            }
        );
        if (!response.ok) {
            return NextResponse.json({ error: "Gemini API error" }, { status: response.status });
        }
        data = await response.json();
    } catch (e) {
        return NextResponse.json({ error: "Request failed" }, { status: 500 });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

    const roastCard = {
        name: text.match(/Name:\s*(.*)/)?.[1]?.trim() ?? "",
        title: text.match(/Title:\s*(.*)/)?.[1]?.trim() ?? "",
        ability: text.match(/Ability:\s*(.*)/)?.[1]?.trim() ?? "",
        attack: text.match(/Attack:\s*(.*)/)?.[1]?.trim() ?? "",
        resistance: text.match(/Resistance:\s*(.*)/)?.[1]?.trim() ?? "",
        weakness: text.match(/Weakness:\s*(.*)/)?.[1]?.trim() ?? "",
        specialMove: text.match(/Special Move:\s*(.*)/)?.[1]?.trim() ?? "",
        description: text.match(/Desc(?:ription)?:\s*([\s\S]*)/)?.[1]?.trim() ?? "",
    };

    return NextResponse.json(roastCard);
}