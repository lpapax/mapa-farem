// frontend/src/components/ErrorBoundary.jsx
import { Component } from 'react';

const styles = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#FAF7F2',
    fontFamily: "'DM Sans', sans-serif",
    padding: '24px',
    textAlign: 'center',
  },
  icon: {
    fontSize: 48,
    marginBottom: 16,
    color: '#C8963E',
  },
  heading: {
    fontSize: 24,
    fontWeight: 700,
    color: '#2D5016',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: '#5a6a4a',
    marginBottom: 28,
    maxWidth: 420,
    lineHeight: 1.6,
  },
  button: {
    display: 'inline-block',
    padding: '12px 28px',
    background: '#2D5016',
    color: '#FAF7F2',
    border: 'none',
    borderRadius: 8,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'background 0.2s',
  },
};

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.handleReset = this.handleReset.bind(this);
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to console in development; swap for a real error tracker in production
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary] Caught error:', error, info.componentStack);
    }
  }

  handleReset() {
    this.setState({ hasError: false, error: null });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.wrapper}>
          <div style={styles.icon}>🌿</div>
          <h1 style={styles.heading}>Něco se pokazilo</h1>
          <p style={styles.message}>
            Omlouváme se, stránku se nepodařilo načíst. Zkuste to prosím znovu
            nebo se vraťte na hlavní stránku.
          </p>
          <button
            style={styles.button}
            onClick={this.handleReset}
            onMouseOver={e => (e.currentTarget.style.background = '#3d6b20')}
            onMouseOut={e => (e.currentTarget.style.background = '#2D5016')}
          >
            Zkusit znovu
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
