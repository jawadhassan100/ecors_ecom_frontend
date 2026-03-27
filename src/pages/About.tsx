import { Users, Target, Award, Globe } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const stats = [
  { label: 'Happy Customers', value: '50K+' },
  { label: 'Products Sold', value: '100K+' },
  { label: 'Countries', value: '25+' },
  { label: 'Team Members', value: '50+' },
]

const values = [
  {
    icon: Target,
    title: 'Quality First',
    description:
      'We carefully curate every product in our catalog to ensure it meets our high standards of quality and durability.',
  },
  {
    icon: Users,
    title: 'Customer Focused',
    description:
      'Our customers are at the heart of everything we do. We strive to provide exceptional service and support.',
  },
  {
    icon: Award,
    title: 'Best Prices',
    description:
      'We work directly with manufacturers to bring you the best prices without compromising on quality.',
  },
  {
    icon: Globe,
    title: 'Sustainable',
    description:
      'We are committed to reducing our environmental impact through sustainable practices and eco-friendly packaging.',
  },
]

const team = [
  {
    name: 'Sarah Johnson',
    role: 'CEO & Founder',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop',
  },
  {
    name: 'Michael Chen',
    role: 'CTO',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop',
  },
  {
    name: 'Emily Davis',
    role: 'Head of Design',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop',
  },
  {
    name: 'James Wilson',
    role: 'Head of Operations',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop',
  },
]

export function About() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-secondary/20 py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            About Ecors
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            We're on a mission to make online shopping simple, enjoyable, and
            accessible to everyone. Founded in 2020, Ecors has grown from a small
            startup to a trusted e-commerce platform serving customers worldwide.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y bg-card py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-primary sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                Our Story
              </h2>
              <div className="mt-6 space-y-4 text-muted-foreground">
                <p>
                  Ecors was born out of frustration with the complexity of online
                  shopping. Our founders, a group of tech enthusiasts and retail
                  veterans, believed that buying products online should be as simple
                  and enjoyable as visiting your favorite local store.
                </p>
                <p>
                  Starting from a small garage, we built a platform that prioritizes
                  user experience, product quality, and customer satisfaction. Today,
                  we serve millions of customers across the globe, but our core
                  values remain the same.
                </p>
                <p>
                  We continue to innovate and improve, always keeping our customers
                  at the center of everything we do. Our team works tirelessly to
                  curate the best products, negotiate the best prices, and deliver
                  the best shopping experience.
                </p>
              </div>
            </div>
            <div className="order-first lg:order-last">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop"
                alt="Team working together"
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-secondary/30 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Our Values
            </h2>
            <p className="mt-4 text-muted-foreground">
              The principles that guide everything we do
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <Card key={value.title}>
                <CardContent className="pt-6 text-center">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10">
                    <value.icon className="size-6 text-primary" />
                  </div>
                  <h3 className="mt-4 font-semibold text-foreground">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {value.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Meet Our Team
            </h2>
            <p className="mt-4 text-muted-foreground">
              The people behind Ecors
            </p>
          </div>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member) => (
              <div key={member.name} className="text-center">
                <img
                  src={member.image}
                  alt={member.name}
                  className="mx-auto size-32 rounded-full object-cover"
                />
                <h3 className="mt-4 font-semibold text-foreground">{member.name}</h3>
                <p className="text-sm text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
