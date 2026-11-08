import { useEffect, useRef, useState } from 'react'

const WIDTH = 1280
const HEIGHT = 720

function drawThumbnail(canvas, image, { text, fontSize, color }) {
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, WIDTH, HEIGHT)
  ctx.fillStyle = '#222'
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  if (image) {
    // "cover": llena el lienzo recortando lo que sobre
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
    const lines = text.split('\n')
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
      alert('Por favor selecciona un archivo de imagen.')
      return
    }
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      setImage(img)
      URL.revokeObjectURL(url)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      alert('No se pudo cargar la imagen.')
    }
    img.src = url
  }

  function handleDownload() {
    canvasRef.current.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'miniatura.png'
      a.click()
      URL.revokeObjectURL(url)
    }, 'image/png')
  }

  return (
    <main className="app">
      <h1>Creador de miniaturas</h1>
      <div className="layout">
        <section className="controls">
          <label>
            Tu foto
            <input type="file" accept="image/*" onChange={handleFile} />
          </label>
          <label>
            Texto
            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Escribe el texto de tu miniatura"
            />
          </label>
          <label>
            Tamaño: {fontSize}px
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
            Descargar PNG
          </button>
        </section>
        <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="preview" />
      </div>
    </main>
  )
}
