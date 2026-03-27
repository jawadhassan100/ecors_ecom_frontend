import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-[50vh] items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="size-8 text-destructive" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-muted-foreground">
                We encountered an unexpected error. Please try again or return to the
                home page.
              </p>
              {this.state.error && (
                <details className="mt-4 rounded-md bg-muted p-3 text-sm">
                  <summary className="cursor-pointer font-medium">
                    Error details
                  </summary>
                  <pre className="mt-2 overflow-auto text-xs text-muted-foreground">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
            </CardContent>
            <CardFooter className="flex gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={this.handleGoHome}
              >
                <Home className="mr-2 size-4" />
                Go Home
              </Button>
              <Button className="flex-1" onClick={this.handleRetry}>
                <RefreshCw className="mr-2 size-4" />
                Try Again
              </Button>
            </CardFooter>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Functional error display component for use with TanStack Query
export function ErrorDisplay({
  error,
  onRetry,
  title = 'Error loading data',
}: {
  error: Error
  onRetry?: () => void
  title?: string
}) {
  return (
    <div className="flex min-h-[30vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="size-6 text-destructive" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">
            {error.message || 'An unexpected error occurred.'}
          </p>
        </CardContent>
        {onRetry && (
          <CardFooter>
            <Button className="w-full" onClick={onRetry}>
              <RefreshCw className="mr-2 size-4" />
              Try Again
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}
