// src/app/api/generate-roast/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const profile = await req.json();

    const prompt = `
Roast this GitHub user like it's a parody trading card.

GitHub Profile:
${JSON.stringify(profile, null, 2)}

Generate:
- Name
- Title (funny dev title)
- Strength
- Weakness
- Special Move
- Roast Description
`;

    const API_KEY = process.env.HUGGINGFACE_API_KEY;
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
        strength: text.match(/Strength:\s*(.*)/)?.[1]?.trim() ?? "",
        weakness: text.match(/Weakness:\s*(.*)/)?.[1]?.trim() ?? "",
        specialMove: text.match(/Special Move:\s*(.*)/)?.[1]?.trim() ?? "",
        description: text.match(/Desc(?:ription)?:\s*([\s\S]*)/)?.[1]?.trim() ?? "",
    };

    return NextResponse.json(roastCard);
}