// src/components/admin/AdminKYCReview.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

function withTimeout(promise, ms = 15000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), ms)
    )
  ])
}

export default function AdminKYCReview() {
  const [kycList, setKycList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [rejectionNotes, setRejectionNotes] = useState({});

  useEffect(() => {
    fetchPendingKYC();
  }, []);

  const { data, error } = await supabase
  .from('kyc_documents')
  .select(`
    id,
    user_id,
    doc_type,
    file_path,
    status,
    submitted_at,
    profiles (
      first_name,
      last_name,
      email
    )
  `)
  .eq('status', 'pending')
  .order('submitted_at', { ascending: false });

      if (error) {
  console.error('Error fetching KYC:', error);
} else {
  const enhancedData = await Promise.all(
    (data || []).map(async (kyc) => {
      if (!kyc.file_path) return kyc;

      // If file_url is a FULL URL → extract path
      const path = kyc.file_path.includes('kyc-documents')
        ? kyc.file_path.split('/kyc-documents/')[1]
        : kyc.file_path;

      const { data: signed, error: signedError } = await supabase
        .storage
        .from('kyc-documents') // ✅ YOUR bucket
        .createSignedUrl(path, 60);

      if (signedError) {
        console.error('Signed URL error:', signedError);
      }

      return {
        ...kyc,
        signed_url: signed?.signedUrl || null
      };
    })
  );

  setKycList(enhancedData);
}
    } catch (err) {
      console.error('Unexpected error:', err);
    }
    setLoading(false);
  };

  const handleApprove = async (kyc) => {
  if (processingId) return // 🔥 prevents double click globally

  setProcessingId(kyc.id)
  setProcessingId(kyc.id);
  try {
    const { error: kycError } = await supabase
      .from('kyc_documents')
      .update({ status: 'approved', reviewed_at: new Date().toISOString() })
      .eq('id', kyc.id);

    if (kycError) throw kycError;

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ kyc_status: 'approved' })
      .eq('id', kyc.user_id);

    if (profileError) throw profileError;

    alert(`✅ Approved for ${kyc.profiles?.first_name || 'User'}`);
    fetchPendingKYC();
  } catch (err) {
    console.error(err);
    alert('Approve failed: ' + err.message);
  } finally {
    setProcessingId(null);
  }
};

  const handleReject = async (kyc) => {
  if (processingId) return // ✅ prevent double click

  const notes = rejectionNotes[kyc.id] || "Rejected by admin"

  if (!window.confirm(`Reject KYC for ${kyc.profiles?.first_name || 'this user'}?`)) return

  setProcessingId(kyc.id)

  try {
    const { error: kycError } = await withTimeout(
      supabase
        .from('kyc_documents')
        .update({ 
          status: 'rejected', 
          notes: notes, 
          reviewed_at: new Date().toISOString() 
        })
        .eq('id', kyc.id)
    )

    if (kycError) throw kycError

    const { error: profileError } = await withTimeout(
      supabase
        .from('profiles')
        .update({ kyc_status: 'rejected' })
        .eq('id', kyc.user_id)
    )

    if (profileError) throw profileError

    console.log(`Rejected: ${kyc.id}`)

    fetchPendingKYC()

  } catch (err) {
    console.error(err)
    alert('Reject failed: ' + err.message)
  } finally {
    setProcessingId(null)
  }
}

  if (loading) {
    return <div style={{ padding: '60px', color: '#fff', textAlign: 'center' }}>Loading KYC submissions...</div>;
  }

  return (
    <div style={{ padding: '28px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ color: '#fff', marginBottom: '30px' }}>👑 Admin KYC Review</h2>

      {kycList.length === 0 ? (
        <div style={{ 
          background: '#1e2030', 
          borderRadius: '16px', 
          padding: '60px', 
          textAlign: 'center', 
          color: '#aaa',
          fontSize: '18px'
        }}>
          No pending KYC submissions at the moment.
        </div>
      ) : (
        kycList.map((kyc) => (
          <div key={kyc.id} style={{
            background: '#1e2030',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            border: '1px solid #333'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <strong style={{ fontSize: '18px' }}>
                  {kyc.profiles?.first_name} {kyc.profiles?.last_name}
                </strong>
                <div style={{ color: '#888', marginTop: '4px' }}>{kyc.profiles?.email}</div>
              </div>
              <div style={{ color: '#ffd700', fontWeight: 600 }}>
                {kyc.doc_type ? kyc.doc_type.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
              </div>
            </div>

            {kyc.file_url && (
  <div style={{ marginBottom: '20px' }}>
    <img
      src={kyc.file_url}
      alt="KYC Document"
      style={{
        width: '100%',
        maxWidth: '400px',
        borderRadius: '10px',
        border: '1px solid #333',
        cursor: 'pointer'
      }}
      onClick={() => window.open(kyc.file_url, '_blank')}
    />
  </div>
)}

    <a
      href={kyc.signed_url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: '#4f8eff', textDecoration: 'underline' }}
    >
      📄 Open Full Document
    </a>
  </div>
)}

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
                {processingId === kyc.id ? 'Approving...' : '✅ Approve KYC'}
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
                {processingId === kyc.id ? 'Rejecting...' : '❌ Reject KYC'}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}