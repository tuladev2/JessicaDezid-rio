import { Component } from 'react';

/**
 * Error Boundary para capturar erros de componentes React
 * Exibe fallback UI quando há erros não tratados
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Atualiza o state para mostrar a UI de fallback
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log do erro para debugging
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // UI de fallback customizada
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface-container-lowest">
          <div className="text-center p-8 max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 bg-error/10 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-error text-2xl">error</span>
            </div>
            
            <h2 className="font-serif text-xl text-on-surface mb-2">
              Ops! Algo deu errado
            </h2>
            
            <p className="text-sm text-secondary mb-6">
              Ocorreu um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors"
              >
                Tentar Novamente
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 text-secondary hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors"
              >
                Recarregar Página
              </button>
            </div>
            
            {/* Detalhes do erro (apenas em desenvolvimento) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-xs text-secondary cursor-pointer">
                  Detalhes do erro (desenvolvimento)
                </summary>
                <pre className="mt-2 text-xs text-error bg-error/5 p-3 rounded overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;