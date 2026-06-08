/**
 * SignaturePad.jsx — Pad de firma digital con Canvas
 * Soporta mouse y touch (móvil)
 * Props: onChange(base64 | null), width, height
 */
import { useRef, useEffect, useState, useCallback } from 'react'
import { C } from '../../constants/colors'
import Icon from './Icon'

export default function SignaturePad({ onChange, width = 320, height = 140 }) {
  const canvasRef  = useRef(null)
  const drawing    = useRef(false)
  const hasMark    = useRef(false)
  const [empty,    setEmpty]    = useState(true)

  // ── Coordenadas relativas al canvas ──────────────────────────
  const getPos = (e) => {
    const canvas = canvasRef.current
    const rect   = canvas.getBoundingClientRect()
    const scaleX = canvas.width  / rect.width
    const scaleY = canvas.height / rect.height
    if (e.touches) {
      const t = e.touches[0]
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY }
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }
  }

  // ── Dibuja ────────────────────────────────────────────────────
  const startDraw = useCallback((e) => {
    e.preventDefault()
    drawing.current = true
    const ctx = canvasRef.current.getContext('2d')
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }, [])

  const draw = useCallback((e) => {
    if (!drawing.current) return
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    const pos    = getPos(e)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = '#1e293b'
    ctx.lineWidth   = 2.2
    ctx.lineCap     = 'round'
    ctx.lineJoin    = 'round'
    ctx.stroke()
    hasMark.current = true
    if (empty) setEmpty(false)
  }, [empty])

  const endDraw = useCallback((e) => {
    if (!drawing.current) return
    drawing.current = false
    if (hasMark.current) {
      const base64 = canvasRef.current.toDataURL('image/png')
      onChange?.(base64)
    }
  }, [onChange])

  // ── Limpiar ───────────────────────────────────────────────────
  const limpiar = () => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    hasMark.current = false
    setEmpty(true)
    onChange?.(null)
  }

  // ── Setup listeners para touch ────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    canvas.addEventListener('touchstart', startDraw, { passive: false })
    canvas.addEventListener('touchmove',  draw,      { passive: false })
    canvas.addEventListener('touchend',   endDraw,   { passive: false })
    return () => {
      canvas.removeEventListener('touchstart', startDraw)
      canvas.removeEventListener('touchmove',  draw)
      canvas.removeEventListener('touchend',   endDraw)
    }
  }, [startDraw, draw, endDraw])

  return (
    <div style={{ userSelect: 'none' }}>
      <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          style={{
            width:        '100%',
            height:       height,
            border:       `1.5px solid ${empty ? C.gray200 : C.teal}`,
            borderRadius: 12,
            background:   '#fafafa',
            cursor:       'crosshair',
            display:      'block',
            touchAction:  'none',
          }}
        />
        {empty && (
          <div style={{
            position:      'absolute',
            inset:         0,
            display:       'flex',
            flexDirection: 'column',
            alignItems:    'center',
            justifyContent:'center',
            pointerEvents: 'none',
          }}>
            <Icon name="edit" size={22} color={C.gray400} />
            <span style={{ fontSize: 12, color: C.gray400, marginTop: 6 }}>Dibuja tu firma aquí</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
        <button
          onClick={limpiar}
          disabled={empty}
          style={{
            background:  empty ? C.gray100 : '#FEE2E2',
            border:      'none',
            borderRadius: 8,
            padding:     '5px 12px',
            fontSize:    11,
            fontWeight:  700,
            color:       empty ? C.gray400 : '#991B1B',
            cursor:      empty ? 'default' : 'pointer',
            fontFamily:  'inherit',
            display:     'flex',
            alignItems:  'center',
            gap:         4,
          }}>
          <Icon name="trash" size={12} color={empty ? C.gray400 : '#991B1B'} />
          Limpiar
        </button>
      </div>
    </div>
  )
}
