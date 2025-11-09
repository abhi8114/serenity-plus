export async function POST(req) {
  try {
    const body = await req.json();
    const res = await fetch("https://serenity-recommendation-model.onrender.com/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("External API Error:", text);
      return Response.json({ error: "External API failed", detail: text }, { status: res.status });
    }

    const data = await res.json();
    return Response.json(data);
  } catch (err) {
    console.error("Internal API Error:", err);
    return Response.json({ error: "Internal Server Error", detail: err.message }, { status: 500 });
  }
}
