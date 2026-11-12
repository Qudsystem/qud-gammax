import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from './ui/card';

const data = [
  { name: 'Jan', views: 4000, creations: 2400 },
  { name: 'Feb', views: 3000, creations: 1398 },
  { name: 'Mar', views: 2000, creations: 9800 },
  { name: 'Apr', views: 2780, creations: 3908 },
  { name: 'May', views: 1890, creations: 4800 },
  { name: 'Jun', views: 2390, creations: 3800 },
  { name: 'Jul', views: 3490, creations: 4300 },
];

export function TrendChart() {
  return (
    <Card className="p-6">
      <h4 className="text-lg font-bold mb-4">Activity Trends</h4>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="creations" stroke="#8884d8" />
          <Line type="monotone" dataKey="views" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}