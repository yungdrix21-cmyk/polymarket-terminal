// src/components/admin/AdminKYCReview.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function AdminKYCReview() {
  const [kycList, setKycList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [rejectionNotes, setRejectionNotes] = useState({});

  useEffect(() => {
    fetchPendingKYC();
  }, []);

  const fetchPendingKYC = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('kyc_documents')
      .select(`
        *,
        profiles!inner(first_name, last_name, email)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching KYC:', error);
    else setKycList(data || []);
    setLoading(false);
  };

  const handleApprove = async (kyc) => {
    setProcessingId(kyc.id);
    await supabase
      .from('kyc_documents')
      .update({ 
        status: 'approved', 
        reviewed_at: new Date().toISOString() 
      })
      .eq('id', kyc.id);

    await supabase
      .from('profiles')
      .update({ kyc_status: 'approved' })
      .eq('id', kyc.user_id);

    alert(`✅ KYC Approved for ${kyc.profiles?.first_name}`);
    fetchPendingKYC();
    setProcessingId(null);
  };

  const handleReject = async (kyc) => {
    const notes = rejectionNotes[kyc.id] || "Rejected by admin";
    if (!window.confirm(`Reject KYC for ${kyc.profiles?.first_name}?`)) return;

    setProcessingId(kyc.id);
    await supabase
      .from('kyc_documents')
      .update({ 
        status: 'rejected', 
        notes: notes, 
        reviewed_at: new Date().toISOString() 
      })
      .eq('id', kyc.id);

    await supabase
      .from('profiles')
      .update({ kyc_status: 'rejected' })
      .eq('id', kyc.user_id);

    alert(`❌ KYC Rejected for ${kyc.profiles?.first_name}`);
    fetchPendingKYC();
    setProcessingId(null);
  };

  if (loading) return <div style={{ padding: 40, color: '#fff' }}>Loading KYC requests...</div>;

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#fff', marginBottom: '30px' }}>Admin KYC Review Panel</h1>

      {kycList.length === 0 ? (
        <p style={{ color: '#aaa', fontSize: '18px' }}>No pending KYC documents at the moment.</p>
      ) : (
        kycList.map((kyc) => (
          <div key={kyc.id} style={{
            background: '#1e2030',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '20px',
            border: '1px solid #333'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
              <div>
                <strong>{kyc.profiles?.first_name} {kyc.profiles?.last_name}</strong><br />
                <small style={{ color: '#888' }}>{kyc.profiles?.email}</small>
              </div>
              <strong style={{ color: '#ffd700' }}>{kyc.doc_type.toUpperCase()}</strong>
            </div>

            <a
              href={supabase.storage.from('kyc-documents').getPublicUrl(kyc.file_path).data.publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#4f8eff', textDecoration: 'underline' }}
            >
              📄 View Document
            </a>

            <textarea
              placeholder="Rejection reason (optional)"
              value={rejectionNotes[kyc.id] || ''}
              onChange={(e) => setRejectionNotes({ ...rejectionNotes, [kyc.id]: e.target.value })}
              style={{
                width: '100%', margin: '15px 0', padding: '12px',
                background: '#14151f', border: '1px solid #555',
                borderRadius: '8px', color: 'white', minHeight: '80px'
              }}
            />

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
              <button 
                onClick={() => handleApprove(kyc)} 
                disabled={processingId === kyc.id}
                style={{ flex: 1, padding: '14px', background: '#00d4aa', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold' }}
              >
                ✅ Approve KYC
              </button>
              <button 
                onClick={() => handleReject(kyc)} 
                disabled={processingId === kyc.id}
                style={{ flex: 1, padding: '14px', background: '#ff4d6a', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold' }}
              >
                ❌ Reject KYC
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}