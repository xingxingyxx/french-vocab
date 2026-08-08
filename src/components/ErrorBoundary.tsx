import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: 40,
          fontFamily: 'system-ui, sans-serif',
          maxWidth: 500,
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <h1 style={{ fontSize: 24, color: '#dc2626', marginBottom: 16 }}>
            ⚠️ 应用出错
          </h1>
          <p style={{ color: '#64748b', marginBottom: 16 }}>
            请刷新页面重试
          </p>
          <pre style={{
            background: '#f1f5f9',
            padding: 16,
            borderRadius: 12,
            fontSize: 13,
            color: '#475569',
            textAlign: 'left',
            overflow: 'auto',
            maxHeight: 200
          }}>
            {this.state.error?.message}
          </pre>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              marginTop: 16,
              padding: '10px 24px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              fontSize: 14,
              cursor: 'pointer'
            }}
          >
            重试
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
