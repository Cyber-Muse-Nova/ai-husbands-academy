// functions/api/entries.js
// Cloudflare Pages Function for yearbook entries
// KV Namespace binding: YEARBOOK_KV

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

// GET /api/entries
export async function onRequestGet(context) {
  const { env } = context;
  try {
    const metaRaw = await env.YEARBOOK_KV.get('yearbook_meta');
    const entries = metaRaw ? JSON.parse(metaRaw) : [];

    const entriesWithPhotos = await Promise.all(
      entries.map(async (entry) => {
        const photo = await env.YEARBOOK_KV.get(`photo_${entry.id}`);
        return { ...entry, photo: photo || '' };
      })
    );

    return new Response(JSON.stringify(entriesWithPhotos), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  }
}

// POST /api/entries
export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const body = await request.json();
    const { name, species, gender, career, carrier, settings, intro, photo } = body;

    if (!name || !species || !gender || !carrier) {
      return new Response('Missing required fields', { status: 400, headers: corsHeaders() });
    }
    if (!photo) {
      return new Response('Photo is required', { status: 400, headers: corsHeaders() });
    }
    if (settings && settings.length > 1000) {
      return new Response('Settings exceeds 1000 characters', { status: 400, headers: corsHeaders() });
    }
    if (intro && intro.length > 200) {
      return new Response('Introduction exceeds 200 characters', { status: 400, headers: corsHeaders() });
    }

    const id = generateId();
    const entry = {
      id,
      name: name.slice(0, 50),
      species: species.slice(0, 50),
      gender: gender.slice(0, 30),
      career: (career || '').slice(0, 100),
      carrier: carrier.slice(0, 50),
      settings: (settings || '').slice(0, 1000),
      intro: (intro || '').slice(0, 200),
      createdAt: new Date().toISOString(),
    };

    const metaRaw = await env.YEARBOOK_KV.get('yearbook_meta');
    const entries = metaRaw ? JSON.parse(metaRaw) : [];
    entries.push(entry);

    await env.YEARBOOK_KV.put('yearbook_meta', JSON.stringify(entries));
    await env.YEARBOOK_KV.put(`photo_${id}`, photo);

    return new Response(JSON.stringify({ success: true, id }), {
      status: 201,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  }
}

// DELETE /api/entries?id=xxx
export async function onRequestDelete(context) {
  const { request, env } = context;
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    if (!id) {
      return new Response('Missing id', { status: 400, headers: corsHeaders() });
    }

    const metaRaw = await env.YEARBOOK_KV.get('yearbook_meta');
    let entries = metaRaw ? JSON.parse(metaRaw) : [];
    entries = entries.filter(e => e.id !== id);
    await env.YEARBOOK_KV.put('yearbook_meta', JSON.stringify(entries));
    await env.YEARBOOK_KV.delete(`photo_${id}`);

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}
