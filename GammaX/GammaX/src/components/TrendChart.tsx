import { Card } from '@/components/ui/card'
import { TimeSeriesPoint } from '@/lib/types'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ChartLine } from '@phosphor-icons/react'
import { format } from 'date-fns'

interface TrendChartProps {
  data: TimeSeriesPoint[]
}

export function TrendChart({ data }: TrendChartProps) {
  if (data.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          <ChartLine className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium">No time-series data available</p>
          <p className="text-sm mt-1">Timestamps could not be parsed from the log file</p>
        </div>
      </Card>
    )
  }

  const chartData = data.map(point => ({
    ...point,
    time: format(new Date(point.timestamp), 'MMM dd HH:mm')
  }))

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
        <ChartLine className="w-5 h-5 text-accent" />
        Error Trends Over Time
      </h3>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.01 250)" />
          <XAxis 
            dataKey="time" 
            stroke="oklch(0.50 0.02 250)"
            style={{ fontSize: '12px' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            stroke="oklch(0.50 0.02 250)"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'oklch(1 0 0)',
              border: '1px solid oklch(0.90 0.01 250)',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '14px' }}
          />
          <Line 
            type="monotone" 
            dataKey="errors" 
            stroke="oklch(0.55 0.22 25)" 
            strokeWidth={2}
            dot={{ fill: 'oklch(0.55 0.22 25)', r: 4 }}
            activeDot={{ r: 6 }}
            name="Errors"
          />
          <Line 
            type="monotone" 
            dataKey="warnings" 
            stroke="oklch(0.75 0.15 75)" 
            strokeWidth={2}
            dot={{ fill: 'oklch(0.75 0.15 75)', r: 4 }}
            activeDot={{ r: 6 }}
            name="Warnings"
          />
          <Line 
            type="monotone" 
            dataKey="infos" 
            stroke="oklch(0.60 0.18 240)" 
            strokeWidth={2}
            dot={{ fill: 'oklch(0.60 0.18 240)', r: 4 }}
            activeDot={{ r: 6 }}
            name="Info"
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
