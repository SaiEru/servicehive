const mongoose = require('mongoose');

async function connectToDatabase() {
	const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/servicehive';
	mongoose.set('strictQuery', true);
	await mongoose.connect(uri, {
		serverSelectionTimeoutMS: 10000,
	});
	console.log('Connected to MongoDB');
}

module.exports = { connectToDatabase };


