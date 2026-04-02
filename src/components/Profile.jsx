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
  font: '"DM Sans", "Sora", system-ui, sans-serif',
  mono: '"DM Mono", "Fira Code", monospace',
}

const Icon = ({ name, size = 16, color = 'currentColor', strokeWidth = 1.6 }) => {
  const paths = {
    profile:  <><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></>,
    shield:   <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
    edit:     <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    check:    <><polyline points="20 6 9 17 4 12"/></>,
    upload:   <><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></>,
    clock:    <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    close:    <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    camera:   <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></>,
    file:     <><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></>,
    trash:    <><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></>,
    lock:     <><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
    save:     <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></>,
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {paths[name] || null}
    </svg>
  )
}

function Input({ label, value, onChange, placeholder, type = 'text', disabled }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.text1, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 7 }}>{label}</label>
      <input
        type={type} value={value || ''} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} disabled={disabled}
        style={{
          width: '100%', padding: '11px 14px', background: disabled ? T.bg0 : T.bg3,
          border: `1px solid ${T.border}`, borderRadius: 10,
          color: disabled ? T.text2 : T.text0, fontSize: 13,
          fontFamily: T.font, outline: 'none', boxSizing: 'border-box',
          opacity: disabled ? 0.6 : 1,
          transition: 'border-color 0.15s',
        }}
        onFocus={e => { if (!disabled) e.target.style.borderColor = T.blue }}
        onBlur={e => { e.target.style.borderColor = T.border }}
      />
    </div>
  )
}

function KYCStatusBadge({ status }) {
  const map = {
    unverified:  { label: 'Not Started',    color: T.text2,   bg: T.bg3        },
    not_started: { label: 'Not Started',    color: T.text2,   bg: T.bg3        },
    pending:     { label: 'Under Review',   color: T.yellow,  bg: T.yellowDim  },
    approved:    { label: 'Verified ✓',     color: T.teal,    bg: T.tealDim    },
    rejected:    { label: 'Rejected',       color: T.red,     bg: T.redDim     },
  }
  const s = map[status] || map.unverified
  return (
    <span style={{ fontSize: 11, fontWeight: 700, color: s.color, background: s.bg, padding: '4px 12px', borderRadius: 20, border: `1px solid ${s.color}30` }}>
      {s.label}
    </span>
  )
}

export default function Profile({ user, kycStatus, onKycUpdate }) {
  const [profile, setProfile] = useState({ first_name: '', last_name: '', phone: '', address: '', city: '', country: '' })
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [tab, setTab] = useState('details') // details | kyc | security
  const [kycDocs, setKycDocs] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState('')
  const [docType, setDocType] = useState('passport')
  const fileRef = useRef()

  useEffect(() => {
    if (!user) return
    supabase.from('profiles').select('*').eq('id', user.id).single()
      .then(({ data }) => { if (data) setProfile(data) })
    supabase.from('kyc_documents').select('*').eq('user_id', user.id).order('uploaded_at', { ascending: false })
      .then(({ data }) => { if (data) setKycDocs(data) })
  }, [user])

  const saveProfile = async () => {
    setSaving(true)
    setSaveMsg('')
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      first_name: profile.first_name,
      last_name: profile.last_name,
      phone: profile.phone,
      address: profile.address,
      city: profile.city,
      country: profile.country,
    })
    setSaving(false)
    if (error) { setSaveMsg('Error saving. Please try again.') }
    else { setSaveMsg('Profile saved successfully!') }
    setTimeout(() => setSaveMsg(''), 3000)
  }

  const uploadKYCDoc = async (file) => {
    if (!file) return
    setUploading(true)
    setUploadMsg('')
    try {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${docType}_${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('kyc-documents').upload(path, file, { upsert: true })
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('kyc-documents').getPublicUrl(path)

      const { error: dbError } = await supabase.from('kyc_documents').insert({
        user_id: user.id, doc_type: docType, file_url: publicUrl, status: 'pending',
      })
      if (dbError) throw dbError

      // Update profile kyc_status to pending
      await supabase.from('profiles').update({ kyc_status: 'pending' }).eq('id', user.id)
      if (onKycUpdate) onKycUpdate('pending')

      // Refresh docs list
      const { data } = await supabase.from('kyc_documents').select('*').eq('user_id', user.id).order('uploaded_at', { ascending: false })
      if (data) setKycDocs(data)

      setUploadMsg('Document uploaded! Under review within 1-2 business days.')
    } catch (err) {
      setUploadMsg('Upload failed: ' + (err.message || 'Unknown error'))
    }
    setUploading(false)
    setTimeout(() => setUploadMsg(''), 5000)
  }

  const deleteDoc = async (docId, fileUrl) => {
    // Extract path from URL
    const path = fileUrl.split('/kyc-documents/')[1]
    if (path) await supabase.storage.from('kyc-documents').remove([path])
    await supabase.from('kyc_documents').delete().eq('id', docId)
    setKycDocs(prev => prev.filter(d => d.id !== docId))
  }

  const tabStyle = (id) => ({
    padding: '9px 18px', fontSize: 13, fontWeight: tab === id ? 600 : 400,
    color: tab === id ? T.text0 : T.text1, background: tab === id ? T.bg3 : 'transparent',
    border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: T.font,
    transition: 'all 0.15s',
  })

  return (
    <div style={{ padding: '28px', overflowY: 'auto', flex: 1 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 28 }}>
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: `${T.purple}20`, border: `2px solid ${T.purple}40`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26, fontWeight: 700, color: T.purple,
        }}>
          {profile.first_name ? profile.first_name[0].toUpperCase() : user?.email?.[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: T.text0, marginBottom: 4 }}>
            {profile.first_name && profile.last_name
              ? `${profile.first_name} ${profile.last_name}`
              : user?.email}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: T.text2 }}>{user?.email}</span>
            <KYCStatusBadge status={kycStatus} />
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: T.bgCard, padding: 4, borderRadius: 14, border: `1px solid ${T.border}`, width: 'fit-content' }}>
        <button style={tabStyle('details')} onClick={() => setTab('details')}>Personal Details</button>
        <button style={tabStyle('kyc')} onClick={() => setTab('kyc')}>KYC Verification</button>
        <button style={tabStyle('security')} onClick={() => setTab('security')}>Security</button>
      </div>

      {/* ── PERSONAL DETAILS TAB ── */}
      {tab === 'details' && (
        <div style={{ maxWidth: 680 }}>
          <div style={{ background: T.bgCard, borderRadius: 18, border: `1px solid ${T.border}`, padding: '24px 28px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
              <Icon name="profile" size={16} color={T.blue} />
              <span style={{ fontSize: 15, fontWeight: 600, color: T.text0 }}>Personal Information</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <Input label="First Name" value={profile.first_name} onChange={v => setProfile(p => ({ ...p, first_name: v }))} placeholder="John" />
              <Input label="Last Name" value={profile.last_name} onChange={v => setProfile(p => ({ ...p, last_name: v }))} placeholder="Smith" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <Input label="Email Address" value={user?.email} onChange={() => {}} disabled />
            </div>
            <div style={{ marginBottom: 16 }}>
              <Input label="Phone Number" value={profile.phone} onChange={v => setProfile(p => ({ ...p, phone: v }))} placeholder="+1 234 567 8900" type="tel" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <Input label="Home Address" value={profile.address} onChange={v => setProfile(p => ({ ...p, address: v }))} placeholder="123 Main Street" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Input label="City" value={profile.city} onChange={v => setProfile(p => ({ ...p, city: v }))} placeholder="New York" />
              <Input label="Country" value={profile.country} onChange={v => setProfile(p => ({ ...p, country: v }))} placeholder="United States" />
            </div>
          </div>

          {saveMsg && (
            <div style={{
              padding: '12px 18px', borderRadius: 10, marginBottom: 16, fontSize: 13, fontWeight: 500,
              background: saveMsg.includes('Error') ? T.redDim : T.tealDim,
              color: saveMsg.includes('Error') ? T.red : T.teal,
              border: `1px solid ${saveMsg.includes('Error') ? T.red : T.teal}30`,
            }}>{saveMsg}</div>
          )}

          <button onClick={saveProfile} disabled={saving} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '12px 28px', background: saving ? T.bg3 : T.blue,
            color: saving ? T.text2 : '#fff', border: 'none', borderRadius: 12,
            fontSize: 14, fontWeight: 600, cursor: saving ? 'default' : 'pointer',
            fontFamily: T.font, transition: 'all 0.2s',
          }}>
            <Icon name="save" size={15} color={saving ? T.text2 : '#fff'} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}

      {/* ── KYC TAB ── */}
      {tab === 'kyc' && (
        <div style={{ maxWidth: 680 }}>

          {/* Status card */}
          <div style={{ background: T.bgCard, borderRadius: 18, border: `1px solid ${T.border}`, padding: '22px 28px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name="shield" size={18} color={kycStatus === 'approved' ? T.teal : T.yellow} />
                <span style={{ fontSize: 15, fontWeight: 600, color: T.text0 }}>Identity Verification</span>
              </div>
              <KYCStatusBadge status={kycStatus} />
            </div>
            <div style={{ fontSize: 13, color: T.text1, lineHeight: 1.6, marginBottom: 16 }}>
              {kycStatus === 'approved'
                ? 'Your identity has been verified. You have full access to all platform features.'
                : kycStatus === 'pending'
                ? 'Your documents are being reviewed by our team. This typically takes 1–2 business days.'
                : 'Upload a government-issued ID to verify your identity and unlock deposits, trading, and withdrawals.'}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {['Deposits', 'Copy Trading', 'Withdrawals'].map(feature => (
                <div key={feature} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, background: kycStatus === 'approved' ? T.tealDim : T.bg3, border: `1px solid ${kycStatus === 'approved' ? T.teal + '30' : T.border}` }}>
                  <Icon name={kycStatus === 'approved' ? 'check' : 'lock'} size={11} color={kycStatus === 'approved' ? T.teal : T.text2} />
                  <span style={{ fontSize: 11, color: kycStatus === 'approved' ? T.teal : T.text2 }}>{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Upload section */}
          {kycStatus !== 'approved' && (
            <div style={{ background: T.bgCard, borderRadius: 18, border: `1px solid ${T.border}`, padding: '22px 28px', marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.text0, marginBottom: 16 }}>Upload Identity Document</div>

              {/* Doc type selector */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: T.text1, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>Document Type</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[['passport', 'Passport'], ['drivers_license', "Driver's License"], ['national_id', 'National ID']].map(([val, label]) => (
                    <button key={val} onClick={() => setDocType(val)} style={{
                      flex: 1, padding: '10px 8px', borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 500,
                      background: docType === val ? T.blueDim : T.bg3,
                      color: docType === val ? T.blue : T.text1,
                      border: `1px solid ${docType === val ? T.blue + '50' : T.border}`,
                      fontFamily: T.font, transition: 'all 0.15s',
                    }}>{label}</button>
                  ))}
                </div>
              </div>

              {/* Upload area */}
              <div
                onClick={() => fileRef.current?.click()}
                style={{
                  border: `2px dashed ${T.borderHi}`, borderRadius: 14, padding: '32px 20px',
                  textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
                  background: uploading ? T.blueDim : 'transparent',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.blue; e.currentTarget.style.background = T.blueDim }}
                onMouseLeave={e => { if (!uploading) { e.currentTarget.style.borderColor = T.borderHi; e.currentTarget.style.background = 'transparent' } }}
              >
                <div style={{ marginBottom: 12, opacity: 0.6 }}>
                  <Icon name="upload" size={32} color={T.blue} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text0, marginBottom: 6 }}>
                  {uploading ? 'Uploading...' : 'Click to upload document'}
                </div>
                <div style={{ fontSize: 12, color: T.text2 }}>JPG, PNG, or PDF · Max 10MB</div>
                <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf" style={{ display: 'none' }}
                  onChange={e => { if (e.target.files[0]) uploadKYCDoc(e.target.files[0]) }} />
              </div>

              {uploadMsg && (
                <div style={{
                  marginTop: 14, padding: '12px 16px', borderRadius: 10, fontSize: 13,
                  background: uploadMsg.includes('failed') ? T.redDim : T.tealDim,
                  color: uploadMsg.includes('failed') ? T.red : T.teal,
                  border: `1px solid ${uploadMsg.includes('failed') ? T.red : T.teal}30`,
                }}>{uploadMsg}</div>
              )}
            </div>
          )}

          {/* Uploaded docs list */}
          {kycDocs.length > 0 && (
            <div style={{ background: T.bgCard, borderRadius: 18, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
              <div style={{ padding: '16px 24px', borderBottom: `1px solid ${T.border}`, fontSize: 14, fontWeight: 600, color: T.text0 }}>
                Uploaded Documents ({kycDocs.length})
              </div>
              {kycDocs.map((doc, i) => (
                <div key={doc.id} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 24px',
                  borderBottom: i < kycDocs.length - 1 ? `1px solid ${T.border}` : 'none',
                }}>
                  <div style={{ width: 36, height: 36, borderRadius: 9, background: T.blueDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name="file" size={16} color={T.blue} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: T.text0, textTransform: 'capitalize', marginBottom: 2 }}>
                      {doc.doc_type?.replace('_', ' ')}
                    </div>
                    <div style={{ fontSize: 11, color: T.text2 }}>
                      {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : 'Uploaded'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {doc.status === 'pending' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: T.yellowDim, border: `1px solid ${T.yellow}30` }}>
                        <Icon name="clock" size={11} color={T.yellow} />
                        <span style={{ fontSize: 11, color: T.yellow, fontWeight: 600 }}>Pending</span>
                      </div>
                    )}
                    {doc.status === 'approved' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: T.tealDim, border: `1px solid ${T.teal}30` }}>
                        <Icon name="check" size={11} color={T.teal} />
                        <span style={{ fontSize: 11, color: T.teal, fontWeight: 600 }}>Approved</span>
                      </div>
                    )}
                    {doc.status === 'rejected' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 20, background: T.redDim, border: `1px solid ${T.red}30` }}>
                        <span style={{ fontSize: 11, color: T.red, fontWeight: 600 }}>Rejected</span>
                      </div>
                    )}
                    {doc.status !== 'approved' && (
                      <button onClick={() => deleteDoc(doc.id, doc.file_url)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 6, color: T.text2, transition: 'color 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.color = T.red}
                        onMouseLeave={e => e.currentTarget.style.color = T.text2}>
                        <Icon name="trash" size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── SECURITY TAB ── */}
      {tab === 'security' && (
        <div style={{ maxWidth: 680 }}>
          <div style={{ background: T.bgCard, borderRadius: 18, border: `1px solid ${T.border}`, padding: '24px 28px', marginBottom: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: T.text0, marginBottom: 18 }}>Change Password</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <Input label="New Password" value="" onChange={() => {}} placeholder="••••••••" type="password" />
              <Input label="Confirm New Password" value="" onChange={() => {}} placeholder="••••••••" type="password" />
            </div>
            <button style={{ marginTop: 20, padding: '12px 24px', background: T.blue, color: '#fff', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: T.font }}>
              Update Password
            </button>
          </div>

          <div style={{ background: T.bgCard, borderRadius: 18, border: `1px solid ${T.border}`, padding: '24px 28px' }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: T.text0, marginBottom: 6 }}>Account Information</div>
            <div style={{ fontSize: 13, color: T.text2, marginBottom: 18 }}>Your account details and registration info</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                ['Email', user?.email],
                ['User ID', user?.id?.slice(0, 18) + '...'],
                ['Account Created', user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'],
                ['Last Sign In', user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : '—'],
              ].map(([label, val]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: T.bg3, borderRadius: 10 }}>
                  <span style={{ fontSize: 13, color: T.text1 }}>{label}</span>
                  <span style={{ fontSize: 12, color: T.text0, fontFamily: T.mono }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}