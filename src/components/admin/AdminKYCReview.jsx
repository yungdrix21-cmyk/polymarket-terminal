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
  profiles:profiles!kyc_documents_user_id_fkey (
    email
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

  const updateKYC = async (userId, status) => {
  console.log("CLICKED", userId, status)

  try {
    const { error } = await supabase
      .from('kyc_documents')
      .update({ status })
      .eq('user_id', userId)   // ✅ FIX HERE

    if (error) throw error

    console.log("UPDATED SUCCESS")

    setSubmissions(prev =>
      prev.map(s =>
        s.user_id === userId ? { ...s, status } : s
      )
    )

  } catch (err) {
    console.error("UPDATE FAILED:", err)
    alert("Failed to update KYC")
  }
}

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
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ color: T.text0, fontWeight: 600 }}>
                  User: {item.profiles?.email || item.user_id}
                </div>
                <div style={{ color: T.text2, fontSize: 13 }}>
                  Status: {item.status}
                </div>
                {item.document_url && (
                  <a
                    href={item.document_url}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: T.blue, fontSize: 12 }}
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
        borderRadius: 8
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
        borderRadius: 8
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