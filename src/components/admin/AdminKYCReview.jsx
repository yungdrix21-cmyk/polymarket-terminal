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
        id,
        user_id,
        doc_type,
        file_url,
        status,
        submitted_at,
        reviewed_at,
        notes,
        profiles!inner(first_name, last_name, email)
      `)
      .eq('status', 'pending')
      .order('submitted_at', { ascending: false });

    if (error) {
      console.error('Error fetching KYC:', error);
    } else {
      setKycList(data || []);
    }
    setLoading(false);
  };

  const handleApprove = async (kyc) => {
    setProcessingId(kyc.id);
    try {
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

      alert(`✅ KYC Approved for ${kyc.profiles?.first_name || 'User'}`);
      fetchPendingKYC();
    } catch (err) {
      alert('Failed to approve: ' + err.message);
    }
    setProcessingId(null);
  };

  const handleReject = async (kyc) => {
    const notes = rejectionNotes[kyc.id] || "No reason provided";
    if (!window.confirm(`Reject this KYC for ${kyc.profiles?.first_name || 'this user'}?`)) return;

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

      alert(`❌ KYC Rejected for ${kyc.profiles?.first_name || 'User'}`);
      fetchPendingKYC();
    } catch (err) {
      alert('Failed to reject: ' + err.message);
    }
    setProcessingId(null);
  };

  if (loading) return <div style={{ padding: '40px', color: '#fff' }}>Loading KYC submissions...</div>;

  return (
    <div style={{ padding: '28px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ color: '#fff', marginBottom: '30px' }}>👑 Admin KYC Review</h2>

      {kycList.length === 0 ? (
        <div style={{ 
          background: '#1e2030', 
          borderRadius: '16px', 
          padding: '40px', 
          textAlign: 'center', 
          color: '#aaa' 
        }}>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <strong style={{ fontSize: '18px' }}>
                  {kyc.profiles?.first_name} {kyc.profiles?.last_name}
                </strong>
                <div style={{ color: '#888', fontSize: '14px' }}>{kyc.profiles?.email}</div>
              </div>
              <div style={{ color: '#ffd700', fontWeight: 600 }}>
                {kyc.doc_type?.replace('_', ' ').toUpperCase()}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <a 
                href={kyc.file_url} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#4f8eff', textDecoration: 'underline', fontSize: '15px' }}
              >
                📄 View Uploaded Document
              </a>
            </div>

            <textarea
              placeholder="Rejection reason (optional)"
              value={rejectionNotes[kyc.id] || ''}
              onChange={(e) => setRejectionNotes(prev => ({ ...prev, [kyc.id]: e.target.value }))}
              style={{
                width: '100%', 
                minHeight: '80px',
                marginBottom: '16px',
                padding: '12px',
                background: '#14151f',
                border: '1px solid #555',
                borderRadius: '8px',
                color: '#fff'
              }}
            />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                onClick={() => handleApprove(kyc)}
                disabled={processingId === kyc.id}
                style={{ 
                  flex: 1, 
                  padding: '14px', 
                  background: '#00d4aa', 
                  color: '#000', 
                  border: 'none', 
                  borderRadius: '10px', 
                  fontWeight: 'bold' 
                }}
              >
                {processingId === kyc.id ? 'Approving...' : '✅ Approve'}
              </button>

              <button 
                onClick={() => handleReject(kyc)}
                disabled={processingId === kyc.id}
                style={{ 
                  flex: 1, 
                  padding: '14px', 
                  background: '#ff4d6a', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: '10px', 
                  fontWeight: 'bold' 
                }}
              >
                {processingId === kyc.id ? 'Rejecting...' : '❌ Reject'}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}