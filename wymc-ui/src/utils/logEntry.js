export default async function logEntry(entry) {
  try {
    const res = await fetch("/api/log-wmcy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entry }),
    });

    if (!res.ok) throw new Error(`Server error: ${res.status}`);
    return true;
  } catch (err) {
    console.error("logEntry error:", err);
    return false;
  }
}
