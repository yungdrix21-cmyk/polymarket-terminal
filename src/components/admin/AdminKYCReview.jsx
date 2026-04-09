import React, { useState, useEffect } from "react";
import { supabase } from '../../lib/supabase';

const T = {
  bg0: '#0d0e14', bg1: '#12131c', bg2: '#181922', bg3: '#1e2030', bgCard: '#14151f',
  bgHover: '#1a1b28',
  border: 'rgba(255,255,255,0.06)', borderHi: 'rgba(255,255,255,0.12)',
  blue: '#4f8eff', blueDim: 'rgba(79,142,255,0.12)',
  teal: '#00d4aa', tealDim: 'rgba(0,212,170,0.12)',
  red: '#ff4d6a', redDim: 'rgba(255,77,106,0.12)',
  yellow: '#f5c842', yellowDim: 'rgba(245,200,66,0.12)',
  text0: '#e8eaf0', text1: '#8b8fa8', text2: '#4a4d62',
  mono: '"DM Mono", "Fira Code", monospace',
  font: '"DM Sans", "Sora", system-ui, sans-serif',
}

function Badge({ children, color = T.blue }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 600, color, background: `${color}18`, padding: '3px 8px', borderRadius: 20, border: `1px solid ${color}28` }}>
      {children}
    </span>
  )
}

function AdminDepositsReview() {
  const [deposits, setDeposits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDeposits()
  }, [])

  const fetchDeposits = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('transactions')
      .select('*')
      .eq('type', 'deposit')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    setDeposits(data ?? [])
    setLoading(false)
  }

  const handleApprove = async (tx) => {
    const { error: txError } = await supabase
      .from('transactions')
      .update({ status: 'completed' })
      .eq('id', tx.id)

    if (txError) { alert('Failed to approve'); return }

    const { error: rpcError } = await supabase.rpc('increment_balance', {
      user_id: tx.user_id,
      amount: tx.amount
    })

    if (rpcError) { alert('Balance update failed'); return }

    setDeposits(prev => prev.filter(d => d.id !== tx.id))
  }

  const handleDecline = async (tx) => {
    const { error } = await supabase
      .from('transactions')
      .update({ status: 'declined' })
      .eq('id', tx.id)

    if (error) { alert('Failed to decline'); return }

    setDeposits(prev => prev.filter(d => d.id !== tx.id))
  }

  return (
    <div style={{ padding: '28px', borderTop: `1px solid ${T.border}` }}>
      <h2 style={{ color: T.text0, fontSize: 22, fontWeight: 700, marginBottom: 6 }}>
        💰 Deposit Reviews
      </h2>
      <p style={{ color: T.text2, fontSize: 13, marginBottom: 20 }}>Approve or decline pending user deposits</p>

      {loading ? (
        <p style={{ color: T.text2 }}>Loading...</p>
      ) : deposits.length === 0 ? (
        <p style={{ color: T.text2 }}>No pending deposits.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {deposits.map(tx => (
            <div key={tx.id} style={{
              background: T.bgCard, borderRadius: 14,
              border: `1px solid ${T.border}`, padding: '18px 22px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', flexWrap: 'wrap', gap: 12
            }}>
              <div>
                <div style={{ color: T.text0, fontWeight: 600, fontSize: 14 }}>{tx.crypto} Deposit</div>
                <div style={{ color: T.text2, fontSize: 11, marginTop: 3 }}>User ID: {tx.user_id}</div>
                <div style={{ color: T.text2, fontSize: 11 }}>{new Date(tx.created_at).toLocaleString()}</div>
              </div>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
                <div style={{ color: T.teal, fontWeight: 700, fontSize: 16, fontFamily: T.mono }}>
                  ${Number(tx.amount).toFixed(2)}
                </div>
                <Badge color={T.yellow}>pending</Badge>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => handleApprove(tx)}
                  style={{
                    padding: '8px 18px', background: T.tealDim, color: T.teal,
                    border: `1px solid ${T.teal}30`, borderRadius: 8, cursor: 'pointer',
                    fontWeight: 600, fontSize: 13, fontFamily: T.font
                  }}
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() => handleDecline(tx)}
                  style={{
                    padding: '8px 18px', background: T.redDim, color: T.red,
                    border: `1px solid ${T.red}30`, borderRadius: 8, cursor: 'pointer',
                    fontWeight: 600, fontSize: 13, fontFamily: T.font
                  }}
                >
                  ✗ Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function AdminKYCReview() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState(null);

  const loadKYC = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('kyc_documents')
        .select(`
          id,
          user_id,
          status,
          document_url,
          submitted_at,
          profiles (
            first_name,
            last_name
          )
        `)
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const updateKYC = async (id, status) => {
    const { error } = await supabase
      .from('kyc_documents')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) {
      console.error(error);
      alert("Update failed");
      return;
    }

    setSubmissions(prev => prev.filter(s => s.id !== id));
  };

  useEffect(() => {
    loadKYC();
  }, []);

  return (
    <div style={{ overflowY: 'auto', flex: 1 }}>

      {/* Image Preview Modal */}
      {previewUrl && (
        <div
          onClick={() => setPreviewUrl(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 2000, cursor: 'zoom-out'
          }}
        >
          <div onClick={e => e.stopPropagation()} style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img
              src={previewUrl}
              alt="KYC Document"
              style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 12, objectFit: 'contain', display: 'block' }}
            />
            <button
              onClick={() => setPreviewUrl(null)}
              style={{
                position: 'absolute', top: -16, right: -16,
                background: T.red, border: 'none', color: '#fff',
                borderRadius: '50%', width: 32, height: 32,
                cursor: 'pointer', fontSize: 16, fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
            >✕</button>
          </div>
        </div>
      )}

      <div style={{ padding: '28px' }}>
        <h2 style={{ color: T.text0, fontSize: 22, fontWeight: 700, marginBottom: 20 }}>
          👑 Admin KYC Review
        </h2>

        {loading ? (
          <p style={{ color: T.text2 }}>Loading...</p>
        ) : submissions.length === 0 ? (
          <p style={{ color: T.text2 }}>No pending KYC submissions.</p>
        ) : (
          submissions.map(item => (
            <div key={item.id} style={{
              background: T.bgCard, borderRadius: 14,
              padding: 20, marginBottom: 16,
              border: `1px solid ${T.border}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ color: T.text0, fontWeight: 600 }}>
                    User: {item.profiles?.first_name && item.profiles?.last_name
                      ? `${item.profiles.first_name} ${item.profiles.last_name}`
                      : item.user_id}
                  </div>
                  <div style={{ color: T.text2, fontSize: 13, marginTop: 4 }}>
                    Submitted: {new Date(item.submitted_at).toLocaleString()}
                  </div>

                  {/* Document preview thumbnail */}
                  {item.document_url && (
                    <div style={{ marginTop: 12 }}>
                      <img
                        src={item.document_url}
                        alt="KYC Document"
                        onClick={() => setPreviewUrl(item.document_url)}
                        style={{
                          width: 120, height: 80, objectFit: 'cover',
                          borderRadius: 8, cursor: 'zoom-in',
                          border: `1px solid ${T.border}`,
                          transition: 'opacity 0.2s'
                        }}
                        onMouseEnter={e => e.target.style.opacity = '0.8'}
                        onMouseLeave={e => e.target.style.opacity = '1'}
                      />
                      <div style={{ color: T.text2, fontSize: 11, marginTop: 4 }}>Click to enlarge</div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => updateKYC(item.id, 'approved')}
                    style={{
                      padding: '8px 16px', background: T.teal, color: '#000',
                      border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600
                    }}
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => updateKYC(item.id, 'rejected')}
                    style={{
                      padding: '8px 16px', background: T.red, color: '#fff',
                      border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600
                    }}
                  >
                    ✗ Reject
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <AdminDepositsReview />
    </div>
  )
}

export default AdminKYCReview;