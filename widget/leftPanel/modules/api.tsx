import { execAsync } from "astal";

// Replace with your OpenAI API key

export async function fetchChatGPTResponse(prompt: string): Promise<string> {
  const promptText = prompt || "Say something interesting."; // Fallback if empty
  const command = `
    curl -s -X POST https://api.openai.com/v1/chat/completions \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${API_KEY}" \
      -d '{
        "model": "gpt-3.5-turbo",
        "messages": [{"role": "user", "content": "${promptText}"}],
        "max_tokens": 50
      }'
  `;

  try {
    const response = await execAsync(command);
    const json = JSON.parse(response);
    return json.choices[0]?.message?.content.trim() || "No response received.";
  } catch (err) {
    console.error("ChatGPT API error:", err);
    return "Failed to fetch response.";
  }
}

export async function fetchBooruResponse(tags: string): Promise<string> {
  const command = `
    curl -s "https://safebooru.org/index.php?page=dapi&s=post&q=index&json=1&limit=1&tags=${tags}"
  `;

  const tempFile = "/tmp/booru.jpg";

  try {
    const urlResponse = await execAsync(command);
    const json = JSON.parse(urlResponse);
    const imageUrl = json[0]?.file_url;

    if (!imageUrl) return "No response received.";
    
    await execAsync(`curl -s -o ${tempFile} ${imageUrl}`);
    return tempFile;
  } catch (err) {
    console.error("Booru API error:", err);
    return "Failed to fetch response.";
  }
}
