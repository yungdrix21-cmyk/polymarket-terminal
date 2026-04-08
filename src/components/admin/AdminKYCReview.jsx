import React, { useState, useEffect } from "react";
import { supabase } from '../../lib/supabase';

const T = {
  bg0: '#0d0e14', bg1: '#12131c', bg2: '#181922', bg3: '#1e2030', bgCard: '#14151f',
  bgHover: '#1a1b28',
  border: 'rgba(255,255,255,0.06)', borderHi: 'rgba(255,255,255,0.12)',
  blue: '#4f8eff', blueDim: 'rgba(79,142,255,0.12)',
  teal: '#00d4aa', tealDim: 'rgba(0,212,170,0.12)',
  red: '#ff4d6a', redDim: 'rgba(255,77,106,0.12)',
  text0: '#e8eaf0', text1: '#8b8fa8', text2: '#4a4d62',
}

function AdminKYCReview() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

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
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  // ✅ FIXED: updateKYC is now defined inside the component
  const updateKYC = async (id, status) => {
    console.log("UPDATE CALLED:", id, status);

    const { data, error } = await supabase
      .from('kyc_documents')
      .update({ status })
      .eq('id', id)
      .select();

    console.log("RESPONSE:", data, error);

    if (error) {
      console.error(error);
      alert("Update failed");
      return;
    }

    setSubmissions(prev =>
      prev.map(s => s.id === id ? { ...s, status } : s)
    );
  };

  useEffect(() => {
    loadKYC();
  }, []);

  return (
    <div style={{ padding: '28px' }}>
      <h2 style={{ color: T.text0, fontSize: 22, fontWeight: 700, marginBottom: 20 }}>
        👑 Admin KYC Review
      </h2>

      {loading ? (
        <p style={{ color: T.text2 }}>Loading...</p>
      ) : submissions.length === 0 ? (
        <p style={{ color: T.text2 }}>No KYC submissions yet.</p>
      ) : (
        submissions.map(item => (
          <div key={item.id} style={{
            background: T.bgCard,
            borderRadius: 14,
            padding: 20,
            marginBottom: 16,
            border: `1px solid ${T.border}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: T.text0, fontWeight: 600 }}>
                  User: {item.profiles?.first_name && item.profiles?.last_name
                    ? `${item.profiles.first_name} ${item.profiles.last_name}`
                    : item.user_id}
                </div>
                <div style={{ color: T.text2, fontSize: 13, marginTop: 4 }}>
                  Status: {item.status}
                </div>
                {item.document_url && (
                  <a
                    href={item.document_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: T.blue, fontSize: 12, display: 'inline-block', marginTop: 4 }}
                  >
                    View Document
                  </a>
                )}
              </div>

              {item.status === 'pending' ? (
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => updateKYC(item.id, 'approved')}
                    style={{
                      padding: '8px 16px',
                      background: T.teal,
                      color: '#000',
                      border: 'none',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => updateKYC(item.id, 'rejected')}
                    style={{
                      padding: '8px 16px',
                      background: T.red,
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Reject
                  </button>
                </div>
              ) : (
                <div style={{
                  padding: '6px 12px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontWeight: 600,
                  background: item.status === 'approved' ? T.tealDim : T.redDim,
                  color: item.status === 'approved' ? T.teal : T.red
                }}>
                  {item.status === 'approved' ? '✅ Approved' : '❌ Rejected'}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default AdminKYCReview;