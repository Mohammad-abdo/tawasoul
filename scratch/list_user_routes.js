import express from 'express';
import userRoutes from '../src/routes/user.routes.js';

const app = express();
app.use('/api', userRoutes);

function printRoutes(stack, prefix = '') {
  stack.forEach(r => {
    if (r.route) {
      const methods = Object.keys(r.route.methods).join(', ').toUpperCase();
      console.log(`${methods} ${prefix}${r.route.path}`);
    } else if (r.name === 'router') {
      const newPrefix = prefix + r.regexp.source
        .replace('^\\', '')
        .replace('\\/?(?=\\/|$)', '')
        .replace(/\\\//g, '/');
      printRoutes(r.handle.stack, newPrefix);
    }
  });
}

console.log('--- USER ENDPOINTS ---');
printRoutes(app._router.stack);
process.exit(0);
