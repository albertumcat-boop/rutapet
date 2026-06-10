/**
 * ErrorBoundary.jsx — Barrera global de errores de React
 * Captura excepciones no manejadas durante el render y muestra
 * una pantalla amigable en lugar de una pantalla en blanco.
 */
import { Component } from 'react'
import { C } from '../../constants/colors'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // Log estructurado para debugging
    console.error('[ErrorBoundary] Error capturado:', error, info)
    // En producción aquí iría Sentry.captureException(error)
  }

  handleReload() {
    // Limpiar el estado e intentar re-renderizar
    this.setState({ hasError: false, error: null })
    window.location.reload()
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div style={{
        minHeight:     '100vh',
        background:    C.navy,
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        justifyContent:'center',
        padding:       '24px 20px',
        textAlign:     'center',
      }}>
        <div style={{
          fontSize: 56,
          marginBottom: 16,
          lineHeight: 1,
        }}>⚠️</div>

        <h2 style={{
          fontSize:   22,
          fontWeight: 900,
          color:      '#fff',
          margin:     '0 0 10px',
        }}>
          Algo salió mal
        </h2>

        <p style={{
          fontSize: 14,
          color:    C.gray400,
          margin:   '0 0 32px',
          maxWidth: 300,
          lineHeight: 1.5,
        }}>
          Ocurrió un error inesperado. Tus datos están seguros.
          Recarga la app para continuar.
        </p>

        <button
          onClick={() => this.handleReload()}
          style={{
            background:   C.teal,
            border:       'none',
            borderRadius: 14,
            padding:      '13px 32px',
            color:        '#fff',
            fontSize:     15,
            fontWeight:   800,
            cursor:       'pointer',
            fontFamily:   'inherit',
          }}
        >
          Recargar app
        </button>

        {import.meta.env.DEV && this.state.error && (
          <pre style={{
            marginTop:  24,
            fontSize:   11,
            color:      '#EF4444',
            textAlign:  'left',
            background: '#ffffff10',
            padding:    12,
            borderRadius: 8,
            maxWidth:   360,
            overflow:   'auto',
            whiteSpace: 'pre-wrap',
            wordBreak:  'break-word',
          }}>
            {this.state.error.toString()}
          </pre>
        )}
      </div>
    )
  }
}
