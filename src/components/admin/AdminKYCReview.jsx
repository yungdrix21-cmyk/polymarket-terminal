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
      .order('submitted_at', { ascending: false });

    if (error) console.error('Error fetching KYC:', error);
    else setKycList(data || []);
    
    setLoading(false);
  };

  const handleApprove = async (kyc) => {
    setProcessingId(kyc.id);
    try {
      await supabase
        .from('kyc_documents')
        .update({ status: 'approved', reviewed_at: new Date().toISOString() })
        .eq('id', kyc.id);

      await supabase
        .from('profiles')
        .update({ kyc_status: 'approved' })
        .eq('id', kyc.user_id);

      alert(`✅ Approved for ${kyc.profiles?.first_name || 'User'}`);
      fetchPendingKYC();
    } catch (err) {
      alert('Approve failed: ' + err.message);
    }
    setProcessingId(null);
  };

  const handleReject = async (kyc) => {
    const notes = rejectionNotes[kyc.id] || "Rejected by admin";
    if (!window.confirm(`Reject KYC for ${kyc.profiles?.first_name || 'this user'}?`)) return;

    setProcessingId(kyc.id);
    try {
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

      alert(`❌ Rejected for ${kyc.profiles?.first_name || 'User'}`);
      fetchPendingKYC();
    } catch (err) {
      alert('Reject failed: ' + err.message);
    }
    setProcessingId(null);
  };

  if (loading) return <div style={{ padding: 40, color: '#fff' }}>Loading KYC requests...</div>;

  return (
    <div style={{ padding: '28px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ color: '#fff', marginBottom: '30px' }}>👑 Admin KYC Review</h2>

      {kycList.length === 0 ? (
        <div style={{ background: '#1e2030', borderRadius: '16px', padding: '40px', textAlign: 'center', color: '#aaa' }}>
          No pending KYC submissions at the moment.
        </div>
      ) : (
        kycList.map((kyc) => (
          <div key={kyc.id} style={{
            background: '#1e2030',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '20px',
            border: '1px solid #333'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <strong>{kyc.profiles?.first_name} {kyc.profiles?.last_name}</strong><br />
                <small style={{ color: '#888' }}>{kyc.profiles?.email}</small>
              </div>
              <strong style={{ color: '#ffd700' }}>
                {(kyc.doc_type || 'Unknown').replace('_', ' ').toUpperCase()}
              </strong>
            </div>

            {kyc.file_url && (
              <div style={{ marginBottom: '20px' }}>
                <a href={kyc.file_url} target="_blank" rel="noopener noreferrer" 
                   style={{ color: '#4f8eff', textDecoration: 'underline' }}>
                  📄 View Document
                </a>
              </div>
            )}

            <textarea
              placeholder="Rejection reason (optional)"
              value={rejectionNotes[kyc.id] || ''}
              onChange={(e) => setRejectionNotes({ ...rejectionNotes, [kyc.id]: e.target.value })}
              style={{
                width: '100%', margin: '15px 0', padding: '12px',
                background: '#14151f', border: '1px solid #555',
                borderRadius: '8px', color: '#fff', minHeight: '80px'
              }}
            />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => handleApprove(kyc)} 
                disabled={processingId === kyc.id}
                style={{ flex: 1, padding: '14px', background: '#00d4aa', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold' }}
              >
                ✅ Approve
              </button>
              <button 
                onClick={() => handleReject(kyc)} 
                disabled={processingId === kyc.id}
                style={{ flex: 1, padding: '14px', background: '#ff4d6a', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold' }}
              >
                ❌ Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}