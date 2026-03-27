import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  X,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  Shield,
  User,
  Mail,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { api } from '@/api/axios'

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  badge?: number
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Products',
    href: '/admin/products',
    icon: Package,
  },
  {
    title: 'Add Product',
    href: '/admin/add-products',
    icon: Plus,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
]

interface AdminUser {
  email: string
  name?: string
  avatar?: string
}

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // Check authentication and get admin info
  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    const userEmail = localStorage.getItem('adminEmail')
    
    if (!token && location.pathname !== '/admin/login') {
      navigate('/admin/login')
    } else if (userEmail) {
      // Get user email from localStorage
      setAdminUser({
        email: userEmail,
        name: userEmail.split('@')[0],
      })
    }
  }, [location, navigate])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      // Call logout endpoint
      await api.post('/admin/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear all admin data from localStorage
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminEmail')
      localStorage.removeItem('adminAuth')
      
      // Navigate to login
      navigate('/admin/login')
      setIsLoggingOut(false)
    }
  }

  const getInitials = (email: string) => {
    return email.split('@')[0].slice(0, 2).toUpperCase()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Menu Button */}
      <div className="fixed top-4 left-4 z-50 lg:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isSidebarOpen ? 280 : 80,
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'fixed left-0 top-0 z-50 h-full border-r bg-card',
          'hidden lg:block'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4">
            <AnimatePresence mode="wait">
              {isSidebarOpen ? (
                <motion.div
                  key="logo-expanded"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <Shield className="h-6 w-6 text-primary" />
                  <span className="text-lg font-bold">StoreAdmin</span>
                </motion.div>
              ) : (
                <motion.div
                  key="logo-collapsed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mx-auto"
                >
                  <Shield className="h-6 w-6 text-primary" />
                </motion.div>
              )}
            </AnimatePresence>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden lg:inline-flex"
            >
              {isSidebarOpen ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <AnimatePresence mode="wait">
                    {isSidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1"
                      >
                        {item.title}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {item.badge && isSidebarOpen && (
                    <Badge
                      variant={isActive ? 'secondary' : 'default'}
                      className="ml-auto"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Menu */}
          <div className="border-t p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={adminUser?.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {adminUser ? getInitials(adminUser.email) : 'AD'}
                </AvatarFallback>
              </Avatar>
              <AnimatePresence mode="wait">
                {isSidebarOpen && adminUser && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 min-w-0"
                  >
                    <p className="text-sm font-medium truncate">
                      {adminUser.name || adminUser.email.split('@')[0]}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {adminUser.email}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{adminUser?.email}</p>
                      <p className="text-xs text-muted-foreground">Administrator</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
            className="fixed left-0 top-0 z-50 h-full w-64 border-r bg-card lg:hidden"
          >
            <div className="flex h-full flex-col">
              <div className="flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  <span className="text-lg font-bold">StoreAdmin</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* User Info in Mobile Sidebar */}
              {adminUser && (
                <div className="border-b p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(adminUser.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {adminUser.name || adminUser.email.split('@')[0]}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {adminUser.email}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <nav className="flex-1 space-y-1 px-3 py-4">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.href

                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="flex-1">{item.title}</span>
                      {item.badge && (
                        <Badge variant={isActive ? 'secondary' : 'default'}>
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  )
                })}
              </nav>

              <div className="border-t p-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-destructive hover:text-destructive"
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                >
                  <LogOut className="h-4 w-4" />
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </Button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div
        className={cn(
          'transition-all duration-300',
          'lg:ml-[280px]',
          !isSidebarOpen && 'lg:ml-20'
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-16 items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-4">
              {/* Mobile menu button placeholder for spacing */}
              <div className="w-10 lg:hidden" />
              
              <div className="hidden md:flex">
                <h1 className="text-lg font-semibold">
                  {navItems.find(item => item.href === location.pathname)?.title || 'Dashboard'}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Search Bar */}
              <div className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search..."
                    className="w-64 pl-9"
                  />
                </div>
              </div>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="max-h-96 overflow-y-auto">
                    <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-default">
                      <p className="text-sm font-medium">Welcome to Admin Panel</p>
                      <p className="text-xs text-muted-foreground">You're now logged in as administrator</p>
                      <p className="text-xs text-muted-foreground">Just now</p>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu - Desktop */}
              {adminUser && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(adminUser.email)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium">{adminUser.email}</p>
                        <p className="text-xs text-muted-foreground">Administrator</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate('/admin/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Mail className="mr-2 h-4 w-4" />
                      Email Preferences
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {isLoggingOut ? 'Logging out...' : 'Logout'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}