const express = require('express');
const mongoose = require('mongoose');
const { authMiddleware } = require('../middleware/auth');
const { Event, EVENT_STATUS } = require('../models/Event');
const { SwapRequest, SWAP_STATUS } = require('../models/SwapRequest');

const router = express.Router();
router.use(authMiddleware);

// GET /api/swappable-slots – fetch all other users’ swappable slots
router.get('/swappable-slots', async (req, res) => {
  const slots = await Event.find({ status: EVENT_STATUS.SWAPPABLE, owner: { $ne: req.user.id } })
    .populate('owner', 'name email')
    .sort({ startTime: 1 });
  return res.json(slots);
});

// POST /api/swap-request – offer a swap (sets slots to SWAP_PENDING)
router.post('/swap-request', async (req, res) => {
  const { myEventId, targetEventId } = req.body;
  if (!myEventId || !targetEventId) return res.status(400).json({ message: 'Missing event ids' });
  let session;
  try {
    // Try transaction first
    session = await mongoose.startSession();
    session.startTransaction();
    const myEvent = await Event.findOne({ _id: myEventId, owner: req.user.id }).session(session);
    const targetEvent = await Event.findById(targetEventId).session(session);
    if (!myEvent || !targetEvent) throw new Error('Events not found');
    if (String(targetEvent.owner) === String(req.user.id)) throw new Error('Cannot swap with your own event');
    if (myEvent.status !== EVENT_STATUS.SWAPPABLE || targetEvent.status !== EVENT_STATUS.SWAPPABLE) {
      throw new Error('Both events must be SWAPPABLE');
    }

    // Ensure no existing pending involving these events
    const existing = await SwapRequest.findOne({
      status: SWAP_STATUS.PENDING,
      $or: [
        { fromEvent: myEventId },
        { toEvent: myEventId },
        { fromEvent: targetEventId },
        { toEvent: targetEventId },
      ],
    }).session(session);
    if (existing) throw new Error('A pending swap already exists for one of the events');

    myEvent.status = EVENT_STATUS.SWAP_PENDING;
    targetEvent.status = EVENT_STATUS.SWAP_PENDING;
    await myEvent.save({ session });
    await targetEvent.save({ session });

    const swap = await SwapRequest.create([
      { requester: req.user.id, responder: targetEvent.owner, fromEvent: myEvent._id, toEvent: targetEvent._id, status: SWAP_STATUS.PENDING },
    ], { session });

    await session.commitTransaction();
    return res.status(201).json(swap[0]);
  } catch (err) {
    // Fallback: non-transactional safe updates for standalone MongoDB
    if (session) {
      try { await session.abortTransaction(); } catch (_) {}
      session.endSession();
    }
    try {
      const myEvent = await Event.findOneAndUpdate(
        { _id: myEventId, owner: req.user.id, status: EVENT_STATUS.SWAPPABLE },
        { status: EVENT_STATUS.SWAP_PENDING },
        { new: true }
      );
      const targetEvent = await Event.findOneAndUpdate(
        { _id: targetEventId, status: EVENT_STATUS.SWAPPABLE, owner: { $ne: req.user.id } },
        { status: EVENT_STATUS.SWAP_PENDING },
        { new: true }
      );
      if (!myEvent || !targetEvent) {
        // rollback if one failed
        if (myEvent) await Event.findByIdAndUpdate(myEvent._id, { status: EVENT_STATUS.SWAPPABLE });
        if (targetEvent) await Event.findByIdAndUpdate(targetEvent._id, { status: EVENT_STATUS.SWAPPABLE });
        return res.status(400).json({ message: 'Both events must be SWAPPABLE' });
      }

      // Ensure no existing pending involving these events
      const existing = await SwapRequest.findOne({
        status: SWAP_STATUS.PENDING,
        $or: [
          { fromEvent: myEventId },
          { toEvent: myEventId },
          { fromEvent: targetEventId },
          { toEvent: targetEventId },
        ],
      });
      if (existing) {
        // revert status before exiting
        await Promise.all([
          Event.findByIdAndUpdate(myEvent._id, { status: EVENT_STATUS.SWAPPABLE }),
          Event.findByIdAndUpdate(targetEvent._id, { status: EVENT_STATUS.SWAPPABLE }),
        ]);
        return res.status(400).json({ message: 'A pending swap already exists for one of the events' });
      }
      const swap = await SwapRequest.create({
        requester: req.user.id,
        responder: targetEvent.owner,
        fromEvent: myEvent._id,
        toEvent: targetEvent._id,
        status: SWAP_STATUS.PENDING,
      });
      return res.status(201).json(swap);
    } catch (e2) {
      return res.status(400).json({ message: e2.message || 'Swap request failed' });
    }
  }
});

// POST /api/swap-response/:id – Accept/Reject a swap, updates owners and status atomically
router.post('/swap-response/:id', async (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'ACCEPT' | 'REJECT'
  if (!['ACCEPT', 'REJECT'].includes(action)) return res.status(400).json({ message: 'Invalid action' });
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    const swap = await SwapRequest.findById(id).session(session);
    if (!swap) throw new Error('Swap not found');
    if (String(swap.responder) !== String(req.user.id)) throw new Error('Not authorized to respond to this swap');
    if (swap.status !== SWAP_STATUS.PENDING) throw new Error('Swap no longer pending');

    const fromEvent = await Event.findById(swap.fromEvent).session(session);
    const toEvent = await Event.findById(swap.toEvent).session(session);
    if (!fromEvent || !toEvent) throw new Error('Events not found');

    if (action === 'REJECT') {
      fromEvent.status = EVENT_STATUS.SWAPPABLE;
      toEvent.status = EVENT_STATUS.SWAPPABLE;
      swap.status = SWAP_STATUS.REJECTED;
      await fromEvent.save({ session });
      await toEvent.save({ session });
      await swap.save({ session });
      await session.commitTransaction();
      return res.json({ ok: true, status: swap.status });
    }

    const ownerA = fromEvent.owner;
    fromEvent.owner = toEvent.owner;
    toEvent.owner = ownerA;
    fromEvent.status = EVENT_STATUS.BUSY;
    toEvent.status = EVENT_STATUS.BUSY;
    swap.status = SWAP_STATUS.ACCEPTED;

    await fromEvent.save({ session });
    await toEvent.save({ session });
    await swap.save({ session });

    await session.commitTransaction();
    return res.json({ ok: true, status: swap.status });
  } catch (err) {
    if (session) {
      try { await session.abortTransaction(); } catch (_) {}
      session.endSession();
    }
    try {
      const swap = await SwapRequest.findById(id);
      if (!swap) return res.status(404).json({ message: 'Swap not found' });
      if (String(swap.responder) !== String(req.user.id)) return res.status(403).json({ message: 'Not authorized' });
      if (swap.status !== SWAP_STATUS.PENDING) return res.status(400).json({ message: 'Swap no longer pending' });

      if (action === 'REJECT') {
        await Promise.all([
          Event.findByIdAndUpdate(swap.fromEvent, { status: EVENT_STATUS.SWAPPABLE }),
          Event.findByIdAndUpdate(swap.toEvent, { status: EVENT_STATUS.SWAPPABLE }),
        ]);
        swap.status = SWAP_STATUS.REJECTED;
        await swap.save();
        return res.json({ ok: true, status: swap.status });
      }

      const fromEvent = await Event.findById(swap.fromEvent);
      const toEvent = await Event.findById(swap.toEvent);
      if (!fromEvent || !toEvent) return res.status(404).json({ message: 'Events not found' });

      const ownerA = fromEvent.owner;
      const ownerB = toEvent.owner;
      await Promise.all([
        Event.findByIdAndUpdate(fromEvent._id, { owner: ownerB, status: EVENT_STATUS.BUSY }),
        Event.findByIdAndUpdate(toEvent._id, { owner: ownerA, status: EVENT_STATUS.BUSY }),
      ]);
      swap.status = SWAP_STATUS.ACCEPTED;
      await swap.save();

      // Auto-reject other pending swaps involving these events and restore counterpart events
      const others = await SwapRequest.find({
        _id: { $ne: swap._id },
        status: SWAP_STATUS.PENDING,
        $or: [
          { fromEvent: { $in: [fromEvent._id, toEvent._id] } },
          { toEvent: { $in: [fromEvent._id, toEvent._id] } },
        ],
      });
      await Promise.all(others.map(async (s) => {
        s.status = SWAP_STATUS.REJECTED;
        await s.save();
        // Determine the counterpart event to restore to SWAPPABLE
        const counterpart = String(s.fromEvent) === String(fromEvent._id) || String(s.fromEvent) === String(toEvent._id)
          ? s.toEvent
          : s.fromEvent;
        await Event.findByIdAndUpdate(counterpart, { status: EVENT_STATUS.SWAPPABLE });
      }));

      return res.json({ ok: true, status: swap.status });
    } catch (e2) {
      return res.status(400).json({ message: e2.message || 'Swap response failed' });
    }
  }
});

// List my incoming/outgoing requests
router.get('/swap-requests', async (req, res) => {
  const userId = req.user.id;
  const [incoming, outgoing] = await Promise.all([
    SwapRequest.find({ responder: userId }).populate('fromEvent toEvent requester responder', 'title startTime endTime name email status').sort({ createdAt: -1 }),
    SwapRequest.find({ requester: userId }).populate('fromEvent toEvent requester responder', 'title startTime endTime name email status').sort({ createdAt: -1 }),
  ]);
  return res.json({ incoming, outgoing });
});

module.exports = router;


