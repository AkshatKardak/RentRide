import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CRITICAL: React Error Boundary caught an error:', error, errorInfo);
    window.__REACT_ERROR__ = {
      message: error?.message || String(error),
      stack: error?.stack,
      componentStack: errorInfo?.componentStack
    };
    this.setState({ errorInfo });
  }

  handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      console.error(e);
    }
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const err = this.state.error;
      const info = this.state.errorInfo;
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#FAF7F1',
          color: '#20201E',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px'
        }}>
          <div style={{
            maxWidth: '720px',
            width: '100%',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E8E0D3',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 10px 30px rgba(32, 32, 30, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#F6E3E1',
                color: '#A83A34',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                fontSize: '20px'
              }}>
                !
              </div>
              <div>
                <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>Application Notice</h1>
                <p style={{ margin: 0, fontSize: '13px', color: '#6B6459' }}>A client-side runtime exception occurred.</p>
              </div>
            </div>

            <div style={{
              backgroundColor: '#F3EEE5',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #E8E0D3',
              marginBottom: '20px',
              fontFamily: 'monospace',
              fontSize: '13px',
              color: '#A83A34',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap'
            }}>
              <strong>{err?.name || 'Error'}:</strong> {err?.message || 'Unknown error'}
            </div>

            {info?.componentStack && (
              <details style={{ marginBottom: '20px', fontSize: '12px', color: '#6B6459' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: '8px' }}>
                  View Component Stack
                </summary>
                <pre style={{
                  backgroundColor: '#F3EEE5',
                  padding: '12px',
                  borderRadius: '8px',
                  overflowX: 'auto',
                  maxHeight: '200px'
                }}>
                  {info.componentStack}
                </pre>
              </details>
            )}

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  backgroundColor: '#A34F32',
                  color: '#FAF7F1',
                  border: 'none',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Reload Page
              </button>
              <button
                onClick={this.handleReset}
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#A34F32',
                  border: '1px solid #A34F32',
                  padding: '10px 18px',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Reset Local Storage & Cache
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
