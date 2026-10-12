import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/lib/supabase";

// Reads ANTHROPIC_API_KEY from .env.local automatically
const client = new Anthropic();

export async function POST(request: Request) {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    const { data: userData } = await supabase.auth.getUser(token);

    if (!userData.user) {
        return Response.json({ error: "Please log in" }, { status: 401 });
    }

    const body = await request.json();
    const totals = body.totals;

    const response = await client.beta.messages.create({
        model: "claude-opus-5-5",
        max_tokens: 2000,
        output_config: { effort: "low" },   // short advice, so no deep thinking needed (faster + cheaper)
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",               // if the model declines, another model answers instead
        system: "Give a short, friendly, and encouraging advice to a student based on their study totals. Keep it under 100 words. Write plain text only. Do not use ** or any other formatting.",
        messages: [
            {
                role: "user",
                content: `My study totals this week, in minutes: ${JSON.stringify(totals)}`,
            },
        ],
    });

    // If Claude declined to answer, send a friendly message instead
    if (response.stop_reason === "refusal") {
        return Response.json({ advice: "Sorry, I couldn't generate advice right now." });
    }

    // Claude's reply comes as a list of "blocks". Collect the text ones.
    let advice = "";
    // TODO 2: loop over response.content. For each block whose
    //         block.type is "text", add block.text to advice.
    for (const block of response.content) {
        if (block.type === "text") {
            advice += block.text;
        }
    }

    return Response.json({ advice });
}