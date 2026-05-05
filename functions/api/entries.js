// functions/api/entries.js
// Cloudflare Pages Function for yearbook entries
// KV namespace binding: YEARBOOK

export async function onRequestGet(context) {
  const { env } = context;
  try {
    const list = await env.YEARBOOK.list({ prefix: "entry:" });
    const entries = [];
    for (const key of list.keys) {
      const value = await env.YEARBOOK.get(key.name);
      if (value) {
        entries.push(JSON.parse(value));
      }
    }
    // 按创建时间倒序
    entries.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return new Response(JSON.stringify(entries), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const { name, race, gender, traits, profession, platform, intro, photo } = body;

    if (!name || !photo) {
      return new Response(
        JSON.stringify({ error: "name and photo are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 生成唯一 ID
    const id = crypto.randomUUID();
    const createdAt = Date.now();

    // photo 是 base64 dataURL,单独存到 photo:{id}
    await env.YEARBOOK.put(`photo:${id}`, photo);

    // entry 元数据存到 entry:{id}
    const entry = {
      id,
      name: String(name).slice(0, 100),
      race: String(race || "").slice(0, 50),
      gender: String(gender || "").slice(0, 50),
      traits: String(traits || "").slice(0, 1000),
      profession: String(profession || "").slice(0, 100),
      platform: String(platform || "").slice(0, 50),
      intro: String(intro || "").slice(0, 200),
      photoUrl: `/api/photo/${id}`,
      createdAt,
    };
    await env.YEARBOOK.put(`entry:${id}`, JSON.stringify(entry));

    return new Response(JSON.stringify(entry), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
