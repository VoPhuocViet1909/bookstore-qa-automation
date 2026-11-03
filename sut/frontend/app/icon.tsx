const ICON_SOURCE =
  "https://static.vecteezy.com/system/resources/previews/006/115/725/original/black-and-white-open-book-logo-illustration-on-white-background-free-vector.jpg"

export const size = {
  width: 512,
  height: 512,
}

export const contentType = "image/jpeg"

export default async function Icon() {
  try {
    const response = await fetch(ICON_SOURCE)
    if (!response.ok) {
      return new Response(null, { status: 502 })
    }

    const arrayBuffer = await response.arrayBuffer()

    return new Response(arrayBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, immutable",
      },
    })
  } catch (error) {
    console.error("Failed to fetch icon:", error)
    return new Response(null, { status: 500 })
  }
}

