import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Mail,
  Lock,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Shield,
  AlertCircle,
  CheckCircle2,
  User
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { api } from '@/api'
import { useToast } from '@/hooks/use-toast'

export function AdminSettings() {
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [currentEmail, setCurrentEmail] = useState('')
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  })

  // Fetch current admin info on mount
  useEffect(() => {
    fetchAdminInfo()
  }, [])

  const fetchAdminInfo = async () => {
    try {
      const response = await api.get('/admin/info')
      if (response.data.email) {
        setCurrentEmail(response.data.email)
      }
    } catch (err) {
      console.error('Failed to fetch admin info:', err)
      // Try to get from localStorage as fallback
      const storedEmail = localStorage.getItem('adminEmail')
      if (storedEmail) {
        setCurrentEmail(storedEmail)
      }
    } finally {
      setIsFetching(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear messages when user starts typing
    setSuccess('')
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setSuccess('')
    setError('')

    // Validate passwords match if password is being updated
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('New passwords do not match')
      setIsLoading(false)
      return
    }

    // Validate password length if being updated
    if (formData.password && formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setIsLoading(false)
      return
    }

    // Validate email format
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address')
      setIsLoading(false)
      return
    }

    try {
      // Prepare data to send - only include fields that have values
      const updateData: any = {}
      if (formData.email) updateData.email = formData.email
      if (formData.password) updateData.password = formData.password

      // Only make the API call if there's something to update
      if (Object.keys(updateData).length === 0) {
        setError('Please enter at least one field to update')
        setIsLoading(false)
        return
      }

      const response = await api.post('/admin/update', updateData)

      if (response.data.message) {
        setSuccess(response.data.message)
        
        // If email was updated, update stored data and current email
        if (updateData.email) {
          setCurrentEmail(updateData.email)
          localStorage.setItem('adminEmail', updateData.email)
          
          // Also update in localStorage for adminUser if exists
          const storedUser = localStorage.getItem('adminUser')
          if (storedUser) {
            const user = JSON.parse(storedUser)
            user.email = updateData.email
            localStorage.setItem('adminUser', JSON.stringify(user))
          }
        }
        
        // Clear form
        setFormData({
          email: '',
          password: '',
          confirmPassword: ''
        })
        
        // Optional: Show a message that user might need to re-login
        if (updateData.password) {
          setTimeout(() => {
            setError('Password changed! Please login again with your new password.')
      toast({title: 'Password changed successfully!'})

          }, 3000)
        }
        if (updateData.email) {
          setTimeout(() => {
            setError('Password changed! Please login again with your new password.')
      toast({title: 'Email changed successfully!'})

          }, 3000)
        }
      }
    } catch (err: any) {
      console.error('Update error:', err)
      setError(err.response?.data?.message || 'Failed to update admin credentials')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setFormData({ email: '', password: '', confirmPassword: '' })
    setSuccess('')
    setError('')
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Settings</h1>
          <p className="text-muted-foreground mt-1">
            Update your admin account credentials
          </p>
        </div>
      </motion.div>

      {/* Main Settings Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-2xl"
      >
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <CardTitle>Admin Account Settings</CardTitle>
            </div>
            <CardDescription>
              Update your admin email address or password. Leave fields empty to keep current values.
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Current Info Display */}
              <div className="rounded-lg bg-muted/50 p-4">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Current Admin Email:</span>
                  <span className="text-muted-foreground">
                    {isFetching ? 'Loading...' : currentEmail || 'Not set'}
                  </span>
                </div>
              </div>

           

              {/* Error Alert */}
              {/* {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )} */}

              {/* Email Update Section */}
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="text-lg font-semibold mb-2">Email Address</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Update your admin email address. You'll use this to login.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    New Email Address
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={currentEmail || "admin@example.com"}
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="max-w-md"
                  />
                  <p className="text-xs text-muted-foreground">
                    Current: {currentEmail || 'Not set'} | Leave blank to keep current
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or
                  </span>
                </div>
              </div>

              {/* Password Update Section */}
              <div className="space-y-4">
                <div className="border-l-4 border-primary pl-4">
                  <h3 className="text-lg font-semibold mb-2">Password</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Update your password. Choose a strong password with at least 6 characters.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    New Password
                  </Label>
                  <div className="relative max-w-md">
                    <Input
                      id="password"
                      name="password"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={isLoading}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Leave blank to keep current password. Minimum 6 characters.
                  </p>
                </div>

                {formData.password && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirm New Password
                    </Label>
                    <div className="relative max-w-md">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm your new password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        disabled={isLoading}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {formData.password !== formData.confirmPassword && formData.confirmPassword && (
                      <p className="text-xs text-destructive">
                        Passwords do not match
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex justify-end gap-3 border-t pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                disabled={isLoading}
              >
                Clear
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update Settings
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Security Tips Card */}
        <Card className="mt-6 bg-muted/30">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Security Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 mt-0.5 text-primary" />
                <span>Use a strong, unique password that you don't use elsewhere</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 mt-0.5 text-primary" />
                <span>Your password should be at least 8 characters with a mix of letters, numbers, and symbols</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 mt-0.5 text-primary" />
                <span>Keep your email address up to date to receive important notifications</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 mt-0.5 text-primary" />
                <span>Always log out when using shared or public computers</span>
              </li>
              <li className="flex items-start gap-2">
                <Shield className="h-4 w-4 mt-0.5 text-primary" />
                <span>After changing your password, you'll need to login again with the new credentials</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}