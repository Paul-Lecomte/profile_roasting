export async function generateRoastCardData() {
    const raw = localStorage.getItem("githubUserProfile");
    if (!raw) throw new Error("No GitHub profile found in localStorage.");

    const profile = JSON.parse(raw);

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

    const response = await fetch("https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta", {
        method: "POST",
        headers: {
            Authorization: `Bearer hf_API_KEY`, // Replace with your Hugging Face API key
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt }),
    });

    const data = await response.json();
    const text = data[0]?.generated_text?.replace(prompt, "").trim() ?? "";

    // Extraction structurée
    const roastCard = {
        name: text.match(/Name:\s*(.*)/)?.[1]?.trim() ?? "",
        title: text.match(/Title:\s*(.*)/)?.[1]?.trim() ?? "",
        strength: text.match(/Strength:\s*(.*)/)?.[1]?.trim() ?? "",
        weakness: text.match(/Weakness:\s*(.*)/)?.[1]?.trim() ?? "",
        specialMove: text.match(/Special Move:\s*(.*)/)?.[1]?.trim() ?? "",
        description: text.match(/Desc(?:ription)?:\s*([\s\S]*)/)?.[1]?.trim() ?? "",
    };

    localStorage.setItem("roastCard", JSON.stringify(roastCard));
}