import { useEffect, useRef, useState } from 'react'

const WIDTH = 1280
const HEIGHT = 720

// Split text into lines that fit within maxWidth (breaks on spaces, and
// on characters for single words wider than the canvas).
function wrapLines(ctx, text, maxWidth) {
  const lines = []
  for (const paragraph of text.split('\n')) {
    let current = ''
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      let candidate = current ? `${current} ${word}` : word
      if (ctx.measureText(candidate).width <= maxWidth) {
        current = candidate
        continue
      }
      if (current) lines.push(current)
      current = ''
      for (const char of word) {
        candidate = current + char
        if (current && ctx.measureText(candidate).width > maxWidth) {
          lines.push(current)
          current = char
        } else {
          current = candidate
        }
      }
    }
    lines.push(current)
  }
  return lines
}

function drawThumbnail(canvas, image, { text, fontSize, color }) {
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, WIDTH, HEIGHT)
  ctx.fillStyle = '#222'
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  if (image) {
    // "cover": fill the canvas, cropping any overflow
    const scale = Math.max(WIDTH / image.width, HEIGHT / image.height)
    const w = image.width * scale
    const h = image.height * scale
    ctx.drawImage(image, (WIDTH - w) / 2, (HEIGHT - h) / 2, w, h)
  }

  if (text.trim()) {
    ctx.font = `900 ${fontSize}px Impact, Arial Black, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.lineJoin = 'round'
    ctx.lineWidth = fontSize / 8
    ctx.strokeStyle = '#000'
    ctx.fillStyle = color
    const lines = wrapLines(ctx, text, WIDTH * 0.9)
    const lineHeight = fontSize * 1.1
    const top = HEIGHT / 2 - ((lines.length - 1) * lineHeight) / 2
    lines.forEach((line, i) => {
      const y = top + i * lineHeight
      ctx.strokeText(line, WIDTH / 2, y)
      ctx.fillText(line, WIDTH / 2, y)
    })
  }
}

export default function App() {
  const canvasRef = useRef(null)
  const loadIdRef = useRef(0)
  const [image, setImage] = useState(null)
  const [text, setText] = useState('')
  const [fontSize, setFontSize] = useState(120)
  const [color, setColor] = useState('#ffffff')

  useEffect(() => {
    drawThumbnail(canvasRef.current, image, { text, fontSize, color })
  }, [image, text, fontSize, color])

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.')
      return
    }
    const loadId = ++loadIdRef.current
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      // Ignore stale loads if the user picked another file in the meantime
      if (loadId === loadIdRef.current) setImage(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      if (loadId === loadIdRef.current) alert('Could not load the image.')
    }
    img.src = url
  }

  function handleDownload() {
    canvasRef.current.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'thumbnail.png'
      a.click()
      // Revoke later so the browser can finish starting the download
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    }, 'image/png')
  }

  return (
    <main className="app">
      <h1>Thumbnail Maker</h1>
      <div className="layout">
        <section className="controls">
          <label>
            Your photo
            <input type="file" accept="image/*" onChange={handleFile} />
          </label>
          <label>
            Text
            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your thumbnail text"
            />
          </label>
          <label>
            Size: {fontSize}px
            <input
              type="range"
              min="40"
              max="260"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
            />
          </label>
          <label>
            Color
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
          </label>
          <button onClick={handleDownload} disabled={!image}>
            Download PNG
          </button>
        </section>
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="preview" />
      </div>
    </main>
  )
}
