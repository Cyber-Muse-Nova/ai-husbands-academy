// functions/api/photo/[id].js
// 返回某个 entry 的照片(base64 dataURL 或者解码后的图片)

export async function onRequestGet(context) {
  const { params, env } = context;
  const id = params.id;

  try {
    const dataUrl = await env.YEARBOOK.get(`photo:${id}`);
    if (!dataUrl) {
      return new Response("Not found", { status: 404 });
    }

    // 解析 data URL: data:image/jpeg;base64,xxxxx
    const match = dataUrl.match(/^data:(.+?);base64,(.+)$/);
    if (!match) {
      return new Response("Invalid photo data", { status: 500 });
    }
    const mimeType = match[1];
    const base64 = match[2];

    // base64 decode
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    return new Response(bytes, {
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}
