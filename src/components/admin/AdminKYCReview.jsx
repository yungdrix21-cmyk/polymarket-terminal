function AdminKYCReview() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadKYC = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('kyc_documents')
        .select('*') // ✅ get everything (including file URLs)
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      setSubmissions(data || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadKYC();
  }, []);

  // ✅ Approve KYC
  const handleApprove = async (user_id) => {
    try {
      await supabase
        .from('kyc_documents')
        .update({ status: 'approved' })
        .eq('user_id', user_id);

      alert('KYC Approved');

      loadKYC(); // refresh list
    } catch (err) {
      console.error(err);
    }
  };

  // ❌ Reject KYC
  const handleReject = async (user_id) => {
    try {
      await supabase
        .from('kyc_documents')
        .update({ status: 'rejected' })
        .eq('user_id', user_id);

      alert('KYC Rejected');

      loadKYC();
    } catch (err) {
      console.error(err);
    }
  };

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
        submissions.map((item) => (
          <div
            key={item.id}
            style={{
              background: T.bgCard,
              borderRadius: 14,
              padding: 20,
              marginBottom: 16,
              border: `1px solid ${T.border}`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ color: T.text0, fontWeight: 600 }}>
                  User ID: {item.user_id}
                </div>

                <div style={{ color: T.text2, fontSize: 13 }}>
                  Status: {item.status}
                </div>

                <div style={{ color: T.text2, fontSize: 12, marginTop: 4 }}>
                  {new Date(item.submitted_at).toLocaleString()}
                </div>

                {/* ✅ Document links */}
                <div style={{ marginTop: 10 }}>
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
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => handleApprove(item.user_id)}
                  style={{
                    padding: '8px 16px',
                    background: T.teal,
                    color: '#000',
                    border: 'none',
                    borderRadius: 8,
                  }}
                >
                  Approve
                </button>

                <button
                  onClick={() => handleReject(item.user_id)}
                  style={{
                    padding: '8px 16px',
                    background: T.red,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                  }}
                >
                  Reject
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