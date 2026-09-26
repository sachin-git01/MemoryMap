import express from 'express';
import {
  getJourneys,
  getJourneyById,
  createJourney,
  updateJourney,
  deleteJourney,
  getCheckpoints,
  createCheckpoint,
  updateCheckpoint,
  deleteCheckpoint,
  getNotes,
  createNote,
  updateNote,
  deleteNote
} from '../controllers/journeyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Journey Routes
router.route('/')
  .get(protect, getJourneys)
  .post(protect, createJourney);

router.route('/:id')
  .get(protect, getJourneyById)
  .put(protect, updateJourney)
  .delete(protect, deleteJourney);

// Checkpoint Routes
router.route('/:journeyId/checkpoints')
  .get(protect, getCheckpoints)
  .post(protect, createCheckpoint);

router.route('/:journeyId/checkpoints/:checkpointId')
  .put(protect, updateCheckpoint)
  .delete(protect, deleteCheckpoint);

// Note Routes
router.route('/:journeyId/notes')
  .get(protect, getNotes)
  .post(protect, createNote);

router.route('/:journeyId/notes/:noteId')
  .put(protect, updateNote)
  .delete(protect, deleteNote);

export default router;
