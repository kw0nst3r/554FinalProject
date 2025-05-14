import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Box, Typography, Paper } from '@mui/material';

const filterByDays = (entries, days) => {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return entries
    .filter(entry => new Date(entry.date) >= cutoff)
    .map(entry => ({ date: entry.date, weight: parseFloat(entry.weight) }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

const ChartCard = ({ title, data }) => (
  <Paper sx={{ backgroundColor: '#1c1c1c', p: 2, borderRadius: 2, mb: 4 }}>
    <Typography variant="h6" sx={{ color: 'white', mb: 2 }}>
      {title}
    </Typography>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
        <XAxis dataKey="date" stroke="#ccc" />
        <YAxis stroke="#ccc" domain={['auto', 'auto']} />
        <Tooltip contentStyle={{ backgroundColor: '#222', borderColor: '#555', color: '#fff' }} />
        <Line type="monotone" dataKey="weight" stroke="#00bfff" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  </Paper>
);

const WeightGraph = ({ entries }) => {
  const last7Days = filterByDays(entries, 7);
  const last30Days = filterByDays(entries, 30);

  return (
    <Box sx={{ mt: 4 }}>
      <ChartCard title="Weight (Last 7 Days)" data={last7Days} />
      <ChartCard title="Weight (Last 30 Days)" data={last30Days} />
    </Box>
  );
};

export default WeightGraph;
