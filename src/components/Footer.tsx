import { Link } from 'react-router-dom'
import { Store, Facebook, Twitter, Instagram, Youtube } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

const footerLinks = {
  shop: {
    title: 'Shop',
   links: [
  { href: '/products?category=Home%20and%20Kitchen', label: 'Home and Kitchen' },
  { href: '/products?category=Electronics', label: 'Electronics' },
  { href: '/products?category=Home%20Decor', label: 'Home Decor' },
  { href: '/products?category=Health%20and%20Household', label: 'Health and Household' },
  { href: '/products?category=Beauty%20and%20Personal%20Care', label: 'Beauty and Personal Care' },
],

  },
  company: {
    title: 'Company',
    links: [
      { href: '/about', label: 'About Us' },
      { href: '/contact', label: 'Contact' },
      { href: '#', label: 'Careers' },
      { href: '#', label: 'Press' },
    ],
  },
  support: {
    title: 'Support',
    links: [
      { href: '#', label: 'Help Center' },
      { href: '#', label: 'Shipping Info' },
      { href: '#', label: 'Returns' },
      { href: '#', label: 'Track Order' },
    ],
  },
  legal: {
    title: 'Legal',
    links: [
      { href: '#', label: 'Privacy Policy' },
      { href: '#', label: 'Terms of Service' },
      { href: '#', label: 'Cookie Policy' },
      { href: '#', label: 'Accessibility' },
    ],
  },
}

const socialLinks = [
  { href: '#', icon: Facebook, label: 'Facebook' },
  { href: '#', icon: Twitter, label: 'Twitter' },
  { href: '#', icon: Instagram, label: 'Instagram' },
  { href: '#', icon: Youtube, label: 'YouTube' },
]

export function Footer() {
  return (
    <footer className="border-t bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 font-semibold">
              <img src="/ecors.jpg" alt="" className='w-18 h-18'/>
              {/* <span className="text-xl tracking-tight">ShopVite</span> */}
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Your one-stop shop for quality products. Fast shipping, easy returns,
              and excellent customer service.
            </p>
            {/* Social Links */}
            <div className="mt-6 flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="text-muted-foreground transition-colors hover:text-primary"
                  aria-label={social.label}
                >
                  <social.icon className="size-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.values(footerLinks).map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
              <ul className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        {/* Bottom Footer */}
        <div className="flex w-full items-center justify-center gap-4 ">
          <p className="text-sm text-muted-foreground">
            {new Date().getFullYear()} Ecors. All rights reserved.
          </p>
         
        </div>
      </div>
    </footer>
  )
}
