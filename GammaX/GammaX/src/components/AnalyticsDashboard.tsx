import { useState, useEffect, useMemo } from 'react'
import { PresentationAnalytics, ViewEvent, EngagementEvent } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { motion } from 'framer-motion'
import { 
  Eye, 
  Users, 
  Clock, 
  ChartBar, 
  TrendUp,
  DeviceMobile,
  Desktop,
  DeviceTablet,
  Calendar,
  Target
} from '@phosphor-icons/react'

interface AnalyticsDashboardProps {
  presentationId: string
  analytics: PresentationAnalytics
  viewEvents: ViewEvent[]
  engagementEvents: EngagementEvent[]
  slideCount: number
}

export function AnalyticsDashboard({
  presentationId,
  analytics,
  viewEvents,
  engagementEvents,
  slideCount
}: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('7d')

  const filteredViewEvents = useMemo(() => {
    const now = Date.now()
    const cutoff = timeRange === '7d' 
      ? now - 7 * 24 * 60 * 60 * 1000
      : timeRange === '30d'
      ? now - 30 * 24 * 60 * 60 * 1000
      : 0
    
    return viewEvents.filter(e => e.timestamp >= cutoff)
  }, [viewEvents, timeRange])

  const filteredEngagementEvents = useMemo(() => {
    const now = Date.now()
    const cutoff = timeRange === '7d' 
      ? now - 7 * 24 * 60 * 60 * 1000
      : timeRange === '30d'
      ? now - 30 * 24 * 60 * 60 * 1000
      : 0
    
    return engagementEvents.filter(e => e.timestamp >= cutoff)
  }, [engagementEvents, timeRange])

  const stats = useMemo(() => {
    const totalViews = filteredViewEvents.length
    const uniqueViewers = new Set(filteredViewEvents.map(e => e.viewerId).filter(Boolean)).size
    const totalDuration = filteredViewEvents.reduce((sum, e) => sum + (e.duration || 0), 0)
    const avgDuration = totalViews > 0 ? totalDuration / totalViews : 0
    const avgCompletion = totalViews > 0 
      ? filteredViewEvents.reduce((sum, e) => sum + e.completionRate, 0) / totalViews 
      : 0

    return {
      totalViews,
      uniqueViewers,
      avgDuration: Math.round(avgDuration / 1000),
      avgCompletion: Math.round(avgCompletion * 100)
    }
  }, [filteredViewEvents])

  const viewsByDay = useMemo(() => {
    const days: Record<string, number> = {}
    const now = Date.now()
    const daysToShow = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90

    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000)
      const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      days[key] = 0
    }

    filteredViewEvents.forEach(event => {
      const date = new Date(event.timestamp)
      const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      if (key in days) {
        days[key]++
      }
    })

    return Object.entries(days).map(([date, count]) => ({ date, count }))
  }, [filteredViewEvents, timeRange])

  const maxViews = Math.max(...viewsByDay.map(d => d.count), 1)

  const slideEngagement = useMemo(() => {
    const engagement: Record<number, number> = {}
    for (let i = 0; i < slideCount; i++) {
      engagement[i] = 0
    }

    filteredViewEvents.forEach(event => {
      event.slidesViewed.forEach(slideIndex => {
        if (slideIndex in engagement) {
          engagement[slideIndex]++
        }
      })
    })

    return Object.entries(engagement).map(([index, views]) => ({
      slideIndex: parseInt(index),
      views,
      percentage: stats.totalViews > 0 ? (views / stats.totalViews) * 100 : 0
    }))
  }, [filteredViewEvents, slideCount, stats.totalViews])

  const deviceBreakdown = useMemo(() => {
    const devices = { mobile: 0, tablet: 0, desktop: 0 }
    const total = analytics.deviceBreakdown.mobile + analytics.deviceBreakdown.tablet + analytics.deviceBreakdown.desktop

    if (total > 0) {
      devices.mobile = Math.round((analytics.deviceBreakdown.mobile / total) * 100)
      devices.tablet = Math.round((analytics.deviceBreakdown.tablet / total) * 100)
      devices.desktop = Math.round((analytics.deviceBreakdown.desktop / total) * 100)
    }

    return devices
  }, [analytics])

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-foreground">Analytics Dashboard</h3>
          <p className="text-sm text-muted-foreground">
            Track views, engagement, and audience insights
          </p>
        </div>
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
          <TabsList>
            <TabsTrigger value="7d">7 days</TabsTrigger>
            <TabsTrigger value="30d">30 days</TabsTrigger>
            <TabsTrigger value="all">All time</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Total Views
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.totalViews}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all slides
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Unique Viewers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.uniqueViewers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Individual users
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Avg. Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{formatDuration(stats.avgDuration)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Time spent viewing
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="w-4 h-4" />
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stats.avgCompletion}%</div>
              <p className="text-xs text-muted-foreground mt-1">
                Slides viewed
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Views Over Time
            </CardTitle>
            <CardDescription>Daily view trends for selected period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {viewsByDay.map((day, index) => (
                <motion.div
                  key={day.date}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="flex items-center gap-3"
                >
                  <div className="text-xs text-muted-foreground w-16">{day.date}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(day.count / maxViews) * 100} 
                        className="flex-1"
                      />
                      <Badge variant="secondary" className="text-xs min-w-[32px] justify-center">
                        {day.count}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChartBar className="w-5 h-5" />
              Slide Engagement
            </CardTitle>
            <CardDescription>Views per slide</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-3">
                {slideEngagement.map((slide) => (
                  <motion.div
                    key={slide.slideIndex}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: slide.slideIndex * 0.03 }}
                    className="flex items-center gap-3"
                  >
                    <div className="text-xs font-semibold text-foreground w-16">
                      Slide {slide.slideIndex + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={slide.percentage} 
                          className="flex-1"
                        />
                        <Badge variant="outline" className="text-xs min-w-[48px] justify-center">
                          {slide.views} ({Math.round(slide.percentage)}%)
                        </Badge>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Desktop className="w-5 h-5" />
            Device Breakdown
          </CardTitle>
          <CardDescription>How viewers access your presentation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-lg bg-muted/50 border border-border"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Desktop className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold">Desktop</span>
                </div>
                <Badge variant="secondary">{deviceBreakdown.desktop}%</Badge>
              </div>
              <Progress value={deviceBreakdown.desktop} className="h-2" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="p-4 rounded-lg bg-muted/50 border border-border"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <DeviceMobile className="w-5 h-5 text-accent" />
                  <span className="text-sm font-semibold">Mobile</span>
                </div>
                <Badge variant="secondary">{deviceBreakdown.mobile}%</Badge>
              </div>
              <Progress value={deviceBreakdown.mobile} className="h-2" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="p-4 rounded-lg bg-muted/50 border border-border"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <DeviceTablet className="w-5 h-5 text-secondary-foreground" />
                  <span className="text-sm font-semibold">Tablet</span>
                </div>
                <Badge variant="secondary">{deviceBreakdown.tablet}%</Badge>
              </div>
              <Progress value={deviceBreakdown.tablet} className="h-2" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
