import { GLib, Gio, Variable, execAsync } from "astal";
import { readFile } from "astal/file";
import { chatHistory } from "../LeftPanel";

interface ImageMetadata {
  sample_url: string;
  file_url: string;
}

const CACHE_DIR = `${GLib.get_user_cache_dir()}/ags/api`;
const MAX_MESSAGES = 10;

function ensureCacheDir() {
  const cacheDir = Gio.File.new_for_path(CACHE_DIR);
  if (!cacheDir.query_exists(null)) {
    cacheDir.make_directory_with_parents(null);
  }
}

function readApiKey() {
  ensureCacheDir();
  const keyFile = `${CACHE_DIR}/api_key`;
  const key: string = readFile(keyFile);
  if (key) {
    return key.trim();
  } else {
    return null;
  }
}

function escapeShellArg(str: string): string {
  // Minimal escaping: only handle quotes for shell, avoiding over-escaping for JSON
  return str.replace(/'/g, "'\\''"); // Escape single quotes for shell
}

export async function fetchChatGPTResponse(prompt: string): Promise<string> {
  const API_KEY = readApiKey();
  if (!API_KEY) {
    console.error("API key not found. Please set the API key");
  }

  let history = chatHistory.get().slice(-MAX_MESSAGES);
  const messages = [...history, { role: "user", content: prompt }];

  const jsonData = JSON.stringify({
    model: "gpt-4o-mini",
    messages: messages,
    max_tokens: 2500,
  });

  const escapeJsonData = escapeShellArg(jsonData);

  const command = `
    curl -s -X POST https://api.openai.com/v1/chat/completions \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer ${API_KEY}" \
      -d '${escapeJsonData}'`;

  try {
    const response = await execAsync(command);
    const json = JSON.parse(response);
    return json.choices[0]?.message?.content.trim() || "No response received.";
  } catch (err) {
    console.error("ChatGPT API error");
    return "Failed to fetch response.";
  }
}

export const booruImageMetadata = Variable<Record<string, ImageMetadata>>({});

export async function fetchYandereResponse(tags: string): Promise<string[]> {
  ensureCacheDir();

  booruImageMetadata.set({}); // Clear metadata for new search

  // Ensure NSFW content is included by adding rating:explicit
  // You can modify this based on your needs (e.g., rating:questionable or rating:safe)
  const nsfwTags = "rating:safe"; // Default to safe content
  const limit = 20;
  const formattedTags = `${nsfwTags} ${tags}`.trim();
  const encodedTags = encodeURIComponent(formattedTags)
    .replace(/%3A/g, ":") // Fix rating encoding
    .replace(/%20/g, "+"); // Ensure spaces are +

  const command = `
    curl -s "https://yande.re/post.json?limit=${limit}&tags=${encodedTags}"
  `;

  try {
    const urlResponse = await execAsync(command);
    console.log("Yandere API response:", urlResponse); // Debug the response
    const json = JSON.parse(urlResponse);
    if (!json || json.length === 0) return ["No response received."];

    const tempFiles: string[] = [];
    // get the dictionary even though it is empty for typing purposes
    const metadata = booruImageMetadata.get();

    // fetch up to 20 images
    for (let i = 0; i < Math.min(json.length, limit); i++) {
      const sampleUrl = json[i]?.sample_url || json[i]?.file_url;
      const fileUrl = json[i]?.file_url;
      const displayUrl = json[i]?.preview_url || json[i]?.sample_url || json[i]?.file_url;

      if (!displayUrl) continue;

      const tempFile = `/tmp/booru_${i}.jpg`;
      await execAsync(`curl -s -o ${tempFile} ${displayUrl}`);
      tempFiles.push(tempFile);
      console.log(`Downloaded image ${i}: ${displayUrl}`);

      // handle storing metadata for later use
      metadata[tempFile] = { sample_url: sampleUrl, file_url: fileUrl };
    }

    booruImageMetadata.set(metadata);

    // Download the image to a temporary file
    return tempFiles.length > 0 ? tempFiles : ["No image found."];
  } catch (err) {
    console.error("Yandere API error:", err);
    return ["Failed to fetch response."];
  }
}
