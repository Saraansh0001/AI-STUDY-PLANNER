export function SummaryView({ uploadedDoc }) {
  if (!uploadedDoc) {
    return (
      <div className="summary-container fade-in">
        <div className="summary-header">
          <h1>Notes Summary</h1>
          <button className="nav-btn" onClick={() => window.navigate('home')}>
            <i className="ph ph-upload-simple"></i> Upload PDF
          </button>
        </div>

        <div className="glass-card summary-content">
          <p>No PDF uploaded yet. Upload a PDF to get a summary based only on that file.</p>
        </div>
      </div>
    );
  }

  const { fileName, summary } = uploadedDoc;
  const { overview, keyConcepts, detailedBreakdown } = summary;

  return (
    <div className="summary-container fade-in">
      <div className="summary-header">
        <h1>Notes Summary</h1>
        <button className="nav-btn" onClick={() => window.navigate('dashboard')}>
          <i className="ph ph-arrow-left"></i> Back
        </button>
      </div>
      
      <div className="glass-card summary-content">
        <p className="summary-file-name">
          <strong>Source PDF:</strong> {fileName}
        </p>

        <h2>Overview</h2>
        <p>{overview}</p>

        <h2>Key Concepts Covered</h2>
        {keyConcepts.length ? (
          <ul>
            {keyConcepts.map((item, index) => (
              <li key={`${item.title}-${index}`}>
                <strong>{item.title}:</strong> {item.description}
              </li>
            ))}
          </ul>
        ) : (
          <p>No clear key concepts detected in this PDF.</p>
        )}
        
        <h2>Detailed Breakdown</h2>
        <p>{detailedBreakdown}</p>
      </div>
    </div>
  );
}
