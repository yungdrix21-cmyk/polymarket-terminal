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
          doc_type,
          status,
          submitted_at,
          profiles:user_id (
            email
          )
        `)
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      setSubmissions(data || []);
    } catch (e) {
      console.error("KYC LOAD ERROR:", e.message);
    }
    setLoading(false);
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
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>

              <div>
                {/* ✅ EMAIL INSTEAD OF USER ID */}
                <div style={{ color: T.text0, fontWeight: 600 }}>
                  {item.profiles?.email || "Unknown User"}
                </div>

                <div style={{ color: T.text2, fontSize: 13 }}>
                  Document: {item.doc_type}
                </div>

                <div style={{ color: T.text2, fontSize: 13 }}>
                  Status: {item.status}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button 
                  onClick={() => alert('Approve clicked')}
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
                  onClick={() => alert('Reject clicked')}
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

            </div>
          </div>
        ))
      )}
    </div>
  );
}