// Frontend: src/pages/Jobs.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [userId] = useState('user123'); // Replace with real user ID or Zustand
  const [userJobId, setUserJobId] = useState(null);

  useEffect(() => {
    axios.get('/api/jobs').then(res => setJobs(res.data));
    axios.get(`/api/users/${userId}`).then(res => {
      setUserJobId(res.data.jobId);
    });
  }, [userId]);

  const apply = (jobId) => {
    axios.post('/api/jobs/apply', { userId, jobId }).then(() => setUserJobId(jobId));
  };

  const promote = () => {
    axios.post('/api/jobs/promote', { userId }).then(res => alert(res.data.message));
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Jobs</h1>
      <div className="space-y-4">
        {jobs.map(job => (
          <div key={job.id} className="border p-4 rounded-xl shadow">
            <h2 className="text-lg font-semibold">{job.title}</h2>
            <p>Salary: ${job.salary}</p>
            <p>STR {job.statRequirements?.strength || 0}, DEX {job.statRequirements?.dexterity || 0}, DEF {job.statRequirements?.defence || 0}, LAB {job.statRequirements?.labour || 0}</p>
            <div className="mt-2 space-x-2">
              {userJobId === job.id ? (
                job.promotionTo ? <button className="btn" onClick={promote}>Promote</button> : <span>Max Job</span>
              ) : (
                <button className="btn" onClick={() => apply(job.id)}>Apply</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}