export default async function loadFile(filename) {
  try {
    const res = await fetch(`/api/read-obsidian/${filename}`);
    const data = await res.json();
    return data.content || "(empty file)";
  } catch (err) {
    console.error("loadFile error:", err);
    return "(error reading file)";
  }
}
