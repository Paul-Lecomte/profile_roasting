// src/app/api/generate-roast/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const profile = await req.json();

    const prompt = `
Roast this GitHub user like it's a parody trading card keep the Roast description short .

GitHub Profile:
${JSON.stringify(profile, null, 2)}

Generate:
- Name
- Title (funny dev title)
- Ability (A skill, 2 lines max)
- Attack (A funny roast attack, 2 lines max)
- Ressistance (A funny resistance, 1 word)
- Weakness (A funny weakness, 1 word)
- Special Move
- Roast Description, 3 lines max
`;

    const API_KEY = process.env.AIMLAPI_API_KEY;
    const response = await fetch("https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt }),
    });

    const data = await response.json();
    const text = data[0]?.generated_text?.replace(prompt, "").trim() ?? "";

    const roastCard = {
        name: text.match(/Name:\s*(.*)/)?.[1]?.trim() ?? "",
        title: text.match(/Title:\s*(.*)/)?.[1]?.trim() ?? "",
        ability: text.match(/Ability:\s*(.*)/)?.[1]?.trim() ?? "",
        attack: text.match(/Attack:\s*(.*)/)?.[1]?.trim() ?? "",
        ressistance: text.match(/Ressistance:\s*(.*)/)?.[1]?.trim() ?? "",
        weakness: text.match(/Weakness:\s*(.*)/)?.[1]?.trim() ?? "",
        specialMove: text.match(/Special Move:\s*(.*)/)?.[1]?.trim() ?? "",
        description: text.match(/Desc(?:ription)?:\s*([\s\S]*)/)?.[1]?.trim() ?? "",
    };

    return NextResponse.json(roastCard);
}