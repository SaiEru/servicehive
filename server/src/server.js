const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const { connectToDatabase } = require('./utils/db');

// Load env
dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Health
app.get('/health', (req, res) => {
	res.json({ ok: true });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api', require('./routes/swaps'));

const port = process.env.PORT || 4000;

connectToDatabase()
	.then(() => {
		app.listen(port, () => {
			console.log(`Server listening on http://localhost:${port}`);
		});
	})
	.catch((err) => {
		console.error('Failed to connect to DB', err);
		process.exit(1);
	});

