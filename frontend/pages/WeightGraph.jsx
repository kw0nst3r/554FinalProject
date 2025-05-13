import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const WeightGraph = ({ entries }) => {
  const sortedData = [...entries]
    .map(entry => ({ date: entry.date, weight: parseFloat(entry.weight) }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div style={{ marginTop: '2rem', backgroundColor: '#1c1c1c', padding: '1rem', borderRadius: '8px' }}>
      <h2 style={{ color: 'white' }}>Weight Over Time</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={sortedData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="date" stroke="#ccc" />
          <YAxis stroke="#ccc" domain={['auto', 'auto']} />
          <Tooltip contentStyle={{ backgroundColor: '#222', borderColor: '#555', color: '#fff' }} />
          <Line type="monotone" dataKey="weight" stroke="#00bfff" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeightGraph;
