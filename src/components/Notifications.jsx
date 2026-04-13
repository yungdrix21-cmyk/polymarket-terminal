import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

const T = {
  bg0: '#0d0e14', bg1: '#12131c', bg2: '#181922', bg3: '#1e2030', bgCard: '#14151f',
  bgHover: '#1a1b28',
  border: 'rgba(255,255,255,0.06)', borderHi: 'rgba(255,255,255,0.12)',
  blue: '#4f8eff', blueDim: 'rgba(79,142,255,0.12)',
  teal: '#00d4aa', tealDim: 'rgba(0,212,170,0.12)',
  red: '#ff4d6a', redDim: 'rgba(255,77,106,0.12)',
  purple: '#9b7dff', purpleDim: 'rgba(155,125,255,0.12)',
  yellow: '#f5c842', yellowDim: 'rgba(245,200,66,0.12)',
  text0: '#e8eaf0', text1: '#8b8fa8', text2: '#4a4d62',
  font: '"DM Sans", system-ui, sans-serif',
  mono: '"DM Mono", monospace',
}

const NOTIF_META = {
  order_placed:    { color: T.teal,   icon: '✓',  label: 'Order Placed'      },
  order_cancelled: { color: T.red,    icon: '✕',  label: 'Order Cancelled'   },
  ai_analysis:     { color: T.purple, icon: '⚡', label: 'AI Analysis'       },
  probability:     { color: T.blue,   icon: '◎',  label: 'Probability Update' },
  kyc_update:      { color: T.yellow, icon: '⬡',  label: 'KYC Status'        },
  deposit:         { color: T.teal,   icon: '↓',  label: 'Deposit'           },
  withdrawal:      { color: T.red,    icon: '↑',  label: 'Withdrawal'        },
}

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function Notifications({ userId }) {
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState([])
  const panelRef = useRef(null)

  const unread = notifs.filter(n => !n.read).length

  // Load notifications
  useEffect(() => {
    if (!userId) return
    const load = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30)
      setNotifs(data ?? [])
    }
    load()

    // Realtime subscription
    const channel = supabase
      .channel('notifications-' + userId)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, payload => {
        setNotifs(prev => [payload.new, ...prev])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [userId])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Mark all as read when opening
  const handleOpen = async () => {
    setOpen(o => !o)
    if (!open && unread > 0) {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false)
      setNotifs(prev => prev.map(n => ({ ...n, read: true })))
    }
  }

  const clearAll = async () => {
    await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
    setNotifs([])
  }

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      {/* Bell button */}
      <div
        onClick={handleOpen}
        style={{
          position: 'relative',
          width: 34,
          height: 34,
          borderRadius: 9,
          background: open ? T.bg3 : 'transparent',
          border: `1px solid ${open ? T.borderHi : 'transparent'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { if (!open) e.currentTarget.style.background = T.bg3 }}
        onMouseLeave={e => { if (!open) e.currentTarget.style.background = 'transparent' }}
      >
        {/* Bell SVG */}
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={unread > 0 ? T.teal : T.text2} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>

        {/* Unread badge */}
        {unread > 0 && (
          <div style={{
            position: 'absolute',
            top: -3,
            right: -3,
            minWidth: 16,
            height: 16,
            borderRadius: 8,
            background: T.red,
            color: '#fff',
            fontSize: 9,
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 4px',
            border: `2px solid ${T.bg1}`,
            fontFamily: T.mono,
            boxShadow: `0 0 8px ${T.red}60`,
            animation: 'pulse 2s infinite',
          }}>
            {unread > 99 ? '99+' : unread}
          </div>
        )}
      </div>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: 'absolute',
          top: 42,
          right: 0,
          width: 340,
          maxHeight: 480,
          background: T.bgCard,
          border: `1px solid ${T.borderHi}`,
          borderRadius: 16,
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'dropIn 0.18s ease',
        }}>
          <style>{`
            @keyframes pulse {
              0%, 100% { box-shadow: 0 0 8px ${T.red}60; }
              50% { box-shadow: 0 0 16px ${T.red}90; }
            }
            @keyframes dropIn {
              from { opacity: 0; transform: translateY(-8px) scale(0.97); }
              to   { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>

          {/* Header */}
          <div style={{
            padding: '14px 16px',
            borderBottom: `1px solid ${T.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: T.text0 }}>Notifications</span>
              {unread === 0 && notifs.length > 0 && (
                <span style={{ fontSize: 10, color: T.teal, background: T.tealDim, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>All read</span>
              )}
            </div>
            {notifs.length > 0 && (
              <button
                onClick={clearAll}
                style={{ background: 'none', border: 'none', color: T.text2, fontSize: 11, cursor: 'pointer', fontFamily: T.font, padding: '3px 8px', borderRadius: 6, transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = T.red}
                onMouseLeave={e => e.currentTarget.style.color = T.text2}
              >
                Clear all
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {notifs.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 28, marginBottom: 10, opacity: 0.3 }}>🔔</div>
                <div style={{ color: T.text2, fontSize: 13 }}>No notifications yet</div>
              </div>
            ) : (
              notifs.map((n, i) => {
                const meta = NOTIF_META[n.type] || { color: T.blue, icon: '•', label: n.type }
                return (
                  <div
                    key={n.id}
                    style={{
                      display: 'flex',
                      gap: 12,
                      padding: '13px 16px',
                      borderBottom: i < notifs.length - 1 ? `1px solid ${T.border}` : 'none',
                      background: n.read ? 'transparent' : `${meta.color}06`,
                      transition: 'background 0.15s',
                      position: 'relative',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = T.bgHover}
                    onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : `${meta.color}06`}
                  >
                    {/* Unread dot */}
                    {!n.read && (
                      <div style={{
                        position: 'absolute',
                        left: 5,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 4,
                        height: 4,
                        borderRadius: '50%',
                        background: meta.color,
                      }} />
                    )}

                    {/* Icon */}
                    <div style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      background: `${meta.color}18`,
                      border: `1px solid ${meta.color}30`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      fontSize: 14,
                      color: meta.color,
                      fontWeight: 700,
                    }}>
                      {meta.icon}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: meta.color }}>{meta.label}</span>
                        <span style={{ fontSize: 10, color: T.text2, flexShrink: 0, fontFamily: T.mono }}>{timeAgo(n.created_at)}</span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.text0, marginBottom: 2, lineHeight: 1.4 }}>{n.title}</div>
                      <div style={{ fontSize: 11, color: T.text1, lineHeight: 1.5 }}>{n.message}</div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Helper to insert notifications from anywhere in the app
export async function addNotification(userId, type, title, message) {
  await supabase.from('notifications').insert({ user_id: userId, type, title, message })
}