import app from '../src/server.js';
import listEndpoints from 'express-list-endpoints';

const endpoints = listEndpoints(app);
const doctorSend = endpoints.find(e => e.path === '/api/doctor/send' && e.methods.includes('POST'));

if (doctorSend) {
  console.log('SUCCESS: Route POST /api/doctor/send is registered.');
  console.log(JSON.stringify(doctorSend, null, 2));
} else {
  console.log('FAILURE: Route POST /api/doctor/send not found.');
  console.log('Available /api/doctor routes:');
  console.log(endpoints.filter(e => e.path.startsWith('/api/doctor')).map(e => `${e.methods.join(',')} ${e.path}`));
}

process.exit(0);
