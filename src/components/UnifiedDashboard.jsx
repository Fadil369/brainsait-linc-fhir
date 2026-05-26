/**
 * Unified Dashboard - BotFather Ecosystem Control Center
 * Premium shadcn/ui-style interface connecting all systems
 */

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'

// Worker categories with intelligent links
const WORKER_CATEGORIES = [
  {
    id: 'core',
    name: 'Core Platform',
    icon: '⚡',
    color: 'bg-blue-500',
    workers: [
      { name: 'brainsait-unified-platform', url: '/platform', status: 'active' },
      { name: 'brainsait-masterlinc-production', url: '/agents', status: 'active' },
      { name: 'brainsait-mcp-production', url: '/mcp', status: 'active' },
      { name: 'brainsait-orchestrator', url: '/orchestrate', status: 'active' },
    ]
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    icon: '🏥',
    color: 'bg-emerald-500',
    workers: [
      { name: 'brainsait-healthcare-api', url: '/healthcare', status: 'active' },
      { name: 'healthbridge-api-gateway', url: '/health/bridge', status: 'active' },
      { name: 'nphies-claimlinc', url: '/nphies/claims', status: 'active' },
      { name: 'nphies-service', url: '/nphies', status: 'active' },
      { name: 'brainsait-enrollment-api', url: '/enrollment', status: 'active' },
    ]
  },
  {
    id: 'linc',
    name: 'LINCAgents',
    icon: '🤖',
    color: 'bg-purple-500',
    workers: [
      { name: 'givc-linc-agents', url: '/linc/givc', status: 'active' },
      { name: 'givc-linc-workflows', url: '/linc/workflows', status: 'active' },
      { name: 'givc-core-academy-unified', url: '/linc/academy', status: 'active' },
    ]
  },
  {
    id: 'basma',
    name: 'BASMA',
    icon: '💳',
    color: 'bg-amber-500',
    workers: [
      { name: 'basma-api', url: '/basma/api', status: 'active' },
      { name: 'basma-gateway', url: '/basma', status: 'active' },
      { name: 'basma-portal', url: '/basma-portal', status: 'active' },
      { name: 'basma-voice-agent', url: '/basma/voice', status: 'active' },
    ]
  },
  {
    id: 'auth',
    name: 'Auth & Security',
    icon: '🔐',
    color: 'bg-red-500',
    workers: [
      { name: 'brainsait-auth-gateway-prod', url: '/auth', status: 'active' },
      { name: 'brainsait-sso', url: '/sso', status: 'active' },
      { name: 'brainsait-stripe-identity', url: '/identity', status: 'active' },
      { name: 'brainsait-webhooks', url: '/webhooks', status: 'active' },
    ]
  },
  {
    id: 'comms',
    name: 'Communication',
    icon: '📞',
    color: 'bg-cyan-500',
    workers: [
      { name: 'brainsait-voice', url: '/voice', status: 'active' },
      { name: 'basma-voice-agent', url: '/voice/basma', status: 'active' },
      { name: 'brainsait-chat-widget-prod', url: '/chat', status: 'active' },
      { name: 'brainsait-telegram-bot-prod', url: '/telegram', status: 'active' },
    ]
  },
  {
    id: 'data',
    name: 'Data & Analytics',
    icon: '📊',
    color: 'bg-violet-500',
    workers: [
      { name: 'brainsait-data-hub-prod', url: '/data', status: 'active' },
      { name: 'brainsait-realtime-hub', url: '/realtime', status: 'active' },
      { name: 'brainsait-ai-mesh', url: '/ai-mesh', status: 'active' },
      { name: 'brainsait-ml-inference-prod', url: '/ml', status: 'active' },
    ]
  },
]

// Intent-based navigation
const JOURNEY_INTENTS = [
  { id: 'patient-care', label: 'Patient Care', icon: '🩺', path: '/journey/patient-care', color: 'emerald' },
  { id: 'billing', label: 'Billing', icon: '💳', path: '/journey/billing', color: 'amber' },
  { id: 'claims', label: 'Claims', icon: '📋', path: '/journey/claims', color: 'blue' },
  { id: 'enrollment', label: 'Enrollment', icon: '📝', path: '/journey/enrollment', color: 'purple' },
  { id: 'compliance', label: 'Compliance', icon: '✅', path: '/journey/compliance', color: 'green' },
  { id: 'analytics', label: 'Analytics', icon: '📈', path: '/journey/analytics', color: 'cyan' },
]

export function UnifiedDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [searchQuery, setSearchQuery] = useState('')
  const [stats, setStats] = useState({
    workers: 130,
    pages: 10,
    do: 20,
    kv: 20,
    health: 98.5,
    uptime: 99.9
  })

  // Simulated live stats (would fetch from API in production)
  const filteredWorkers = searchQuery 
    ? WORKER_CATEGORIES.flatMap(c => 
      c.workers.filter(w => 
        w.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
    : []

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <div className="border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold flex items-center gap-3">
              <span className="text-4xl">🎯</span>
              BotFather Control Center
            </h1>
            <p className="text-muted-foreground mt-1">
              Unified Ecosystem Dashboard • {stats.health}% Health • {stats.uptime}% Uptime
            </p>
          </div>
          <div className="flex gap-3">
            <Badge variant="outline" className="gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Cloud Connected
            </Badge>
            <Badge variant="secondary">{stats.workers}+ Workers</Badge>
          </div>
        </div>
      </div>

      {/* Intent-Based Navigation */}
      <div className="px-6 py-4 border-b">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {JOURNEY_INTENTS.map(intent => (
            <Button 
              key={intent.id}
              variant="outline" 
              size="sm"
              className={`gap-2 whitespace-nowrap hover:bg-${intent.color}-500/10 hover:border-${intent.color}-500/50 transition-all`}
              onClick={() => console.log('Navigate to:', intent.path)}
            >
              <span>{intent.icon}</span>
              {intent.label}
            </Button>
          ))}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="px-6 py-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">LINC Agents</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-muted-foreground">Cloudflare Workers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.workers}+</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-muted-foreground">Pages Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.pages}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-muted-foreground">Durable Objects</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.do}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-normal text-muted-foreground">KV Namespaces</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{stats.kv}</p>
              </CardContent>
            </Card>
          </div>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Live ecosystem status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Health</span>
                  <span className="text-green-500">{stats.health}%</span>
                </div>
                <Progress value={stats.health} className="h-2" />
              </div>
              <Separator />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-500">127</p>
                  <p className="text-muted-foreground">Active</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-500">3</p>
                  <p className="text-muted-foreground">Degraded</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-muted-foreground">Down</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.uptime}%</p>
                  <p className="text-muted-foreground">Uptime</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agents Tab */}
        <TabsContent value="agents" className="mt-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {WORKER_CATEGORIES.filter(c => ['core', 'linc'].includes(c.id)).map(category => (
              <Card key={category.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-full ${category.color}`} />
                    <CardTitle>{category.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <div className="space-y-2">
                      {category.workers.map(worker => (
                        <div 
                          key={worker.name}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-green-500" />
                            <span className="text-sm font-mono">{worker.name}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-xs opacity-0 group-hover:opacity-100"
                          >
                            → Dashboard
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="mt-6">
          <Input 
            placeholder="Search workers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />
          {searchQuery && filteredWorkers.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredWorkers.map(worker => (
                <Card key={worker.name} className="hover:border-primary/50 transition-colors">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{worker.name}</CardTitle>
                  </CardHeader>
                  <CardFooter className="pt-0">
                    <Button variant="outline" size="sm" className="w-full">
                      Open Dashboard →
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {WORKER_CATEGORIES.map(category => (
                <Card key={category.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <span className={`h-3 w-3 rounded-full ${category.color}`} />
                      <CardTitle>{category.icon} {category.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {category.workers.length} workers
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Health Tab */}
        <TabsContent value="health" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Live Health Metrics</CardTitle>
              <CardDescription>Real-time ecosystem monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-6xl font-bold text-green-500">{stats.health}%</p>
                <p className="text-muted-foreground mt-2">System Health Score</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default UnifiedDashboard