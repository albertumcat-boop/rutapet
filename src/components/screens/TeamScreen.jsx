/**
 * TeamScreen.jsx — Gestión de equipo: admin + vendedores
 * Solo visible para rol admin
 */
import { useState, useEffect } from 'react'
import { C } from '../../constants/colors'
import { useConfig } from '../../context/ConfigContext'
import { useToast } from '../../context/ToastContext'
import { auth } from '../../../firebase/firebase.config'
import {
  obtenerMiembrosEquipo,
  invitarVendedor,
  obtenerInvitacionesPendientes,
} from '../../services/firestore'
import Icon from '../shared/Icon'
import Card from '../shared/Card'
import Badge from '../shared/Badge'
import Button from '../shared/Button'
import TopBar from '../shared/TopBar'
import Avatar from '../shared/Avatar'

const ROL_INFO = {
  admin:    { label: 'Admin',    bg: '#EDE9FE', txt: '#5B21B6', icon: 'crown'  },
  vendedor: { label: 'Vendedor', bg: '#DBEAFE', txt: '#1E40AF', icon: 'person' },
}

export default function TeamScreen({ onBack }) {
  const { empresaId, userRole, isAdmin } = useConfig()
  const toast  = useToast()
  const user   = auth.currentUser

  const [miembros,     setMiembros]     = useState([])
  const [invitaciones, setInvitaciones] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [showInvite,   setShowInvite]   = useState(false)
  const [email,        setEmail]        = useState('')
  const [sending,      setSending]      = useState(false)

  const empId = empresaId || user?.uid

  useEffect(() => {
    if (!empId) return
    const cargar = async () => {
      setLoading(true)
      try {
        const [m, i] = await Promise.all([
          obtenerMiembrosEquipo(empId),
          obtenerInvitacionesPendientes(empId),
        ])
        setMiembros(m)
        setInvitaciones(i)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [empId])

  const handleInvitar = async () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.warning('Ingresa un email válido')
      return
    }
    setSending(true)
    try {
      await invitarVendedor(email.trim())
      toast.success(`Invitación enviada a ${email}`)
      setEmail('')
      setShowInvite(false)
      // Recargar invitaciones
      const i = await obtenerInvitacionesPendientes(empId)
      setInvitaciones(i)
    } catch (err) {
      toast.error(err.message)
    } finally {
      setSending(false)
    }
  }

  if (!isAdmin) {
    return (
      <div className="screen-enter" style={{ background: C.gray50, minHeight: '100vh' }}>
        <TopBar title="Mi equipo" onBack={onBack} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Icon name="lock" size={28} color={C.red} />
          </div>
          <h3 style={{ fontSize: 18, fontWeight: 800, color: C.gray800, marginBottom: 8 }}>Solo para administradores</h3>
          <p style={{ fontSize: 14, color: C.gray400, lineHeight: 1.6 }}>
            Solo el administrador de la empresa puede gestionar el equipo de vendedores.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="screen-enter" style={{ background: C.gray50, minHeight: '100vh' }}>
      <TopBar
        title="Mi equipo"
        onBack={onBack}
        right={
          <button onClick={() => setShowInvite(true)}
            style={{ background: C.teal, border: 'none', borderRadius: 10, padding: '6px 14px', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="plus" size={14} color="#fff" /> Invitar
          </button>
        }
      />

      {/* Header info */}
      <div style={{ background: C.navy, padding: '14px 16px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div style={{ background: '#ffffff10', borderRadius: 12, padding: '12px', textAlign: 'center' }}>
            <p style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: 0 }}>{miembros.length}</p>
            <p style={{ fontSize: 11, color: C.gray400, margin: '3px 0 0' }}>Miembros activos</p>
          </div>
          <div style={{ background: '#ffffff10', borderRadius: 12, padding: '12px', textAlign: 'center' }}>
            <p style={{ fontSize: 24, fontWeight: 900, color: invitaciones.length > 0 ? C.amber : '#ffffff60', margin: 0 }}>{invitaciones.length}</p>
            <p style={{ fontSize: 11, color: C.gray400, margin: '3px 0 0' }}>Invitaciones pendientes</p>
          </div>
        </div>
      </div>

      <div style={{ padding: '14px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <span style={{ width: 32, height: 32, border: `3px solid ${C.teal}`, borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
          </div>
        ) : (
          <>
            {/* Miembros */}
            <p style={{ fontSize: 13, fontWeight: 800, color: C.gray800, marginBottom: 10 }}>
              Miembros del equipo
            </p>
            {miembros.length === 0 ? (
              <Card>
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <Icon name="team" size={28} color={C.gray400} />
                  <p style={{ fontSize: 13, color: C.gray400, marginTop: 8 }}>
                    Aún no hay miembros. Invita a tus vendedores.
                  </p>
                </div>
              </Card>
            ) : miembros.map(m => {
              const rolInfo = ROL_INFO[m.rol] || ROL_INFO.vendedor
              const initials = (m.nombre || m.email || '?').slice(0, 2).toUpperCase()
              const isMe = m.id === user?.uid

              return (
                <Card key={m.id} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar initials={initials} size={44} bg={m.rol === 'admin' ? '#6D28D9' : C.teal} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: C.gray800, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {m.nombre || m.email || 'Sin nombre'}
                        </p>
                        {isMe && <Badge bg="#DCFCE7" txt="#166534">Tú</Badge>}
                      </div>
                      <p style={{ fontSize: 11, color: C.gray400, margin: '2px 0' }}>{m.email || '—'}</p>
                      <Badge bg={rolInfo.bg} txt={rolInfo.txt}>{rolInfo.label}</Badge>
                    </div>
                    <Icon name={rolInfo.icon} size={18} color={rolInfo.txt} />
                  </div>
                </Card>
              )
            })}

            {/* Invitaciones pendientes */}
            {invitaciones.length > 0 && (
              <>
                <p style={{ fontSize: 13, fontWeight: 800, color: C.gray800, margin: '20px 0 10px' }}>
                  Invitaciones pendientes
                </p>
                {invitaciones.map(inv => (
                  <Card key={inv.id} style={{ marginBottom: 8, borderColor: C.amber + '60' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FEF9C3', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon name="mail" size={20} color={C.amber} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: C.gray800, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {inv.emailInvitado}
                        </p>
                        <p style={{ fontSize: 11, color: C.gray400, margin: '2px 0 0' }}>Esperando que acepte</p>
                      </div>
                      <Badge bg="#FEF9C3" txt="#854D0E">Pendiente</Badge>
                    </div>
                  </Card>
                ))}
              </>
            )}

            {/* Info sobre invitaciones */}
            <div style={{ background: '#EFF6FF', borderRadius: 12, padding: '12px 14px', border: '1.5px solid #BFDBFE', marginTop: 20 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <Icon name="info" size={16} color="#3B82F6" style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#1E40AF', margin: '0 0 4px' }}>¿Cómo funciona?</p>
                  <p style={{ fontSize: 12, color: '#1E40AF', margin: 0, lineHeight: 1.6, opacity: 0.8 }}>
                    Invita a tus vendedores por email. Cuando inicien sesión, encontrarán tu invitación y podrán unirse al equipo. Todos los vendedores compartirán la misma configuración y catálogo de productos.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal invitar */}
      {showInvite && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ background: '#fff', borderRadius: '20px 20px 0 0', padding: '24px 20px', width: '100%', maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: C.gray800, margin: 0 }}>Invitar vendedor</h3>
              <button onClick={() => setShowInvite(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <Icon name="x_circle" size={22} color={C.gray400} />
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#EFF6FF', borderRadius: 12, padding: '10px 12px', marginBottom: 16 }}>
              <Icon name="mail" size={16} color="#3B82F6" />
              <span style={{ fontSize: 12, color: '#1E40AF' }}>El vendedor recibirá acceso cuando inicie sesión con este email</span>
            </div>

            <label style={{ fontSize: 12, fontWeight: 700, color: C.gray600, display: 'block', marginBottom: 6 }}>
              Email del vendedor *
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleInvitar()}
              placeholder="vendedor@empresa.com"
              style={{ width: '100%', padding: '12px', borderRadius: 12, border: `1.5px solid ${C.gray200}`, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 16 }}
              autoFocus
            />

            <Button icon="send" size="lg" fullWidth disabled={!email || sending} onClick={handleInvitar}>
              {sending ? 'Enviando...' : 'Enviar invitación'}
            </Button>
          </div>
        </div>
      )}

      <div style={{ height: 90 }} />
    </div>
  )
}
