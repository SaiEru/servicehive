const express = require('express');
const { authMiddleware } = require('../middleware/auth');
const { Event, EVENT_STATUS } = require('../models/Event');

const router = express.Router();

router.use(authMiddleware);

// List my events
router.get('/', async (req, res) => {
	const events = await Event.find({ owner: req.user.id }).sort({ startTime: 1 });
	return res.json(events);
});

// Create event
router.post('/', async (req, res) => {
	try {
		const { title, startTime, endTime, status } = req.body;
		const event = await Event.create({
			title,
			startTime,
			endTime,
			status: status || EVENT_STATUS.BUSY,
			owner: req.user.id,
		});
		return res.status(201).json(event);
	} catch (err) {
		return res.status(400).json({ message: 'Failed to create event' });
	}
});

// Update event (only owner)
router.put('/:id', async (req, res) => {
	const { id } = req.params;
	const updates = req.body;
	const event = await Event.findOneAndUpdate({ _id: id, owner: req.user.id }, updates, { new: true });
	if (!event) return res.status(404).json({ message: 'Event not found' });
	return res.json(event);
});

// Delete event (only owner)
router.delete('/:id', async (req, res) => {
	const { id } = req.params;
	const deleted = await Event.findOneAndDelete({ _id: id, owner: req.user.id });
	if (!deleted) return res.status(404).json({ message: 'Event not found' });
	return res.json({ ok: true });
});

// Toggle swappable
router.post('/:id/swappable', async (req, res) => {
	const { id } = req.params;
	const { swappable } = req.body; // boolean
	const status = swappable ? EVENT_STATUS.SWAPPABLE : EVENT_STATUS.BUSY;
	const event = await Event.findOneAndUpdate({ _id: id, owner: req.user.id }, { status }, { new: true });
	if (!event) return res.status(404).json({ message: 'Event not found' });
	return res.json(event);
});

module.exports = router;


