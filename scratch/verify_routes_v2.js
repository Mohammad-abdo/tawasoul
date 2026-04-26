import app from '../src/server.js';

function printRoutes(stack, prefix = '') {
  stack.forEach(layer => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
      console.log(`${methods} ${prefix}${layer.route.path}`);
    } else if (layer.name === 'router' && layer.handle.stack) {
      const newPrefix = prefix + (layer.regexp.source.replace('\\/?(?=\\/|$)', '').replace('^', '').replace('\\/', '/').replace('\\', ''));
      printRoutes(layer.handle.stack, newPrefix);
    }
  });
}

console.log('Searching for /api/doctor/send...');
const doctorStack = app._router.stack.find(l => l.regexp.test('/api/doctor')).handle.stack;
printRoutes(doctorStack, '/api/doctor');

process.exit(0);
