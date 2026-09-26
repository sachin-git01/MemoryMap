import mongoose from 'mongoose';
import { Journey } from '../models/Journey.js';
import { Checkpoint } from '../models/Checkpoint.js';
import { Note } from '../models/Note.js';

// Helper to verify user ownership of parent journey
const verifyJourneyOwner = async (journeyId, userId) => {
  if (!journeyId || !mongoose.Types.ObjectId.isValid(journeyId)) {
    return { errorStatus: 400, errorMessage: 'Invalid journey ID format' };
  }
  const journey = await Journey.findById(journeyId);
  if (!journey) {
    return { errorStatus: 404, errorMessage: 'Journey not found' };
  }
  if (journey.userId !== userId) {
    return { errorStatus: 403, errorMessage: 'Not authorized to access this journey' };
  }
  return { journey };
};

// ==========================================
// JOURNEY CONTROLLERS
// ==========================================

// @desc    Get all journeys for authenticated user
// @route   GET /api/journeys
// @access  Private
export const getJourneys = async (req, res) => {
  try {
    const journeys = await Journey.find({ userId: req.user._id.toString() }).sort({ createdAt: -1 });
    return res.json({ success: true, count: journeys.length, journeys });
  } catch (error) {
    console.error('[getJourneys Error]:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch journeys' });
  }
};

// @desc    Get single journey by ID
// @route   GET /api/journeys/:id
// @access  Private
export const getJourneyById = async (req, res) => {
  try {
    const { journey, errorStatus, errorMessage } = await verifyJourneyOwner(req.params.id, req.user._id.toString());
    if (errorStatus) {
      return res.status(errorStatus).json({ success: false, message: errorMessage });
    }
    return res.json({ success: true, journey });
  } catch (error) {
    console.error('[getJourneyById Error]:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch journey' });
  }
};

// @desc    Create new journey
// @route   POST /api/journeys
// @access  Private
export const createJourney = async (req, res) => {
  try {
    const {
      journeyName,
      mapName,
      journeyType,
      theme,
      startDate,
      privacy,
      customPreset,
      customFont,
      customFontFamily,
      customColors
    } = req.body;

    if (!journeyName || typeof journeyName !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide a valid journey name' });
    }

    const journey = await Journey.create({
      userId: req.user._id.toString(),
      journeyName: journeyName.trim(),
      mapName: mapName ? String(mapName).trim() : 'MyMap',
      journeyType: ['love', 'friendship', 'family', 'personal', 'custom'].includes(journeyType) ? journeyType : 'custom',
      theme: theme ? String(theme).trim() : 'custom',
      startDate: startDate || new Date().toISOString().split('T')[0],
      privacy: ['private', 'public', 'unlisted'].includes(privacy) ? privacy : 'private',
      customPreset,
      customFont,
      customFontFamily,
      customColors
    });

    return res.status(201).json({ success: true, journey });
  } catch (error) {
    console.error('[createJourney Error]:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to create journey' });
  }
};

// @desc    Update journey
// @route   PUT /api/journeys/:id
// @access  Private
export const updateJourney = async (req, res) => {
  try {
    const { errorStatus, errorMessage } = await verifyJourneyOwner(req.params.id, req.user._id.toString());
    if (errorStatus) {
      return res.status(errorStatus).json({ success: false, message: errorMessage });
    }

    // Never allow updating userId to prevent privilege escalation / ownership transfer
    const safeUpdates = { ...req.body };
    delete safeUpdates.userId;

    const updatedJourney = await Journey.findByIdAndUpdate(req.params.id, safeUpdates, {
      new: true,
      runValidators: true
    });

    return res.json({ success: true, journey: updatedJourney });
  } catch (error) {
    console.error('[updateJourney Error]:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to update journey' });
  }
};

// @desc    Delete journey, checkpoints, and notes
// @route   DELETE /api/journeys/:id
// @access  Private
export const deleteJourney = async (req, res) => {
  try {
    const { errorStatus, errorMessage } = await verifyJourneyOwner(req.params.id, req.user._id.toString());
    if (errorStatus) {
      return res.status(errorStatus).json({ success: false, message: errorMessage });
    }

    await Checkpoint.deleteMany({ journeyId: req.params.id });
    await Note.deleteMany({ journeyId: req.params.id });
    await Journey.findByIdAndDelete(req.params.id);

    return res.json({ success: true, message: 'Journey and related data deleted successfully' });
  } catch (error) {
    console.error('[deleteJourney Error]:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to delete journey' });
  }
};

// ==========================================
// CHECKPOINT CONTROLLERS
// ==========================================

// @desc    Get checkpoints for a journey
// @route   GET /api/journeys/:journeyId/checkpoints
// @access  Private
export const getCheckpoints = async (req, res) => {
  try {
    const { errorStatus, errorMessage } = await verifyJourneyOwner(req.params.journeyId, req.user._id.toString());
    if (errorStatus) {
      return res.status(errorStatus).json({ success: false, message: errorMessage });
    }

    const checkpoints = await Checkpoint.find({
      journeyId: req.params.journeyId,
      userId: req.user._id.toString()
    }).sort({ date: 1 });

    return res.json({ success: true, count: checkpoints.length, checkpoints });
  } catch (error) {
    console.error('[getCheckpoints Error]:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch checkpoints' });
  }
};

// @desc    Create checkpoint
// @route   POST /api/journeys/:journeyId/checkpoints
// @access  Private
export const createCheckpoint = async (req, res) => {
  try {
    const { errorStatus, errorMessage } = await verifyJourneyOwner(req.params.journeyId, req.user._id.toString());
    if (errorStatus) {
      return res.status(errorStatus).json({ success: false, message: errorMessage });
    }

    const { title, date, description, icon, location, photos, notes } = req.body;

    if (!title || typeof title !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide checkpoint title' });
    }

    const checkpoint = await Checkpoint.create({
      userId: req.user._id.toString(),
      journeyId: req.params.journeyId,
      title: title.trim(),
      date: date || new Date().toISOString().split('T')[0],
      description: description ? String(description).trim() : '',
      icon: icon ? String(icon).trim() : 'heart',
      location: location ? String(location).trim() : '',
      photos: Array.isArray(photos) ? photos : [],
      notes: notes ? String(notes).trim() : ''
    });

    return res.status(201).json({ success: true, checkpoint });
  } catch (error) {
    console.error('[createCheckpoint Error]:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to create checkpoint' });
  }
};

// @desc    Update checkpoint
// @route   PUT /api/journeys/:journeyId/checkpoints/:checkpointId
// @access  Private
export const updateCheckpoint = async (req, res) => {
  try {
    const checkpoint = await Checkpoint.findById(req.params.checkpointId);
    if (!checkpoint) {
      return res.status(404).json({ success: false, message: 'Checkpoint not found' });
    }
    if (checkpoint.userId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this checkpoint' });
    }

    const safeUpdates = { ...req.body };
    delete safeUpdates.userId;
    delete safeUpdates.journeyId;

    const updated = await Checkpoint.findByIdAndUpdate(req.params.checkpointId, safeUpdates, {
      new: true,
      runValidators: true
    });

    return res.json({ success: true, checkpoint: updated });
  } catch (error) {
    console.error('[updateCheckpoint Error]:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to update checkpoint' });
  }
};

// @desc    Delete checkpoint
// @route   DELETE /api/journeys/:journeyId/checkpoints/:checkpointId
// @access  Private
export const deleteCheckpoint = async (req, res) => {
  try {
    const checkpoint = await Checkpoint.findById(req.params.checkpointId);
    if (!checkpoint) {
      return res.status(404).json({ success: false, message: 'Checkpoint not found' });
    }
    if (checkpoint.userId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this checkpoint' });
    }

    await Checkpoint.findByIdAndDelete(req.params.checkpointId);
    return res.json({ success: true, message: 'Checkpoint deleted' });
  } catch (error) {
    console.error('[deleteCheckpoint Error]:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to delete checkpoint' });
  }
};

// ==========================================
// NOTE CONTROLLERS
// ==========================================

// @desc    Get notes for a journey
// @route   GET /api/journeys/:journeyId/notes
// @access  Private
export const getNotes = async (req, res) => {
  try {
    const { errorStatus, errorMessage } = await verifyJourneyOwner(req.params.journeyId, req.user._id.toString());
    if (errorStatus) {
      return res.status(errorStatus).json({ success: false, message: errorMessage });
    }

    const notes = await Note.find({
      journeyId: req.params.journeyId,
      userId: req.user._id.toString()
    }).sort({ date: -1 });

    return res.json({ success: true, count: notes.length, notes });
  } catch (error) {
    console.error('[getNotes Error]:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to fetch notes' });
  }
};

// @desc    Create note
// @route   POST /api/journeys/:journeyId/notes
// @access  Private
export const createNote = async (req, res) => {
  try {
    const { errorStatus, errorMessage } = await verifyJourneyOwner(req.params.journeyId, req.user._id.toString());
    if (errorStatus) {
      return res.status(errorStatus).json({ success: false, message: errorMessage });
    }

    const { title, content, date, category } = req.body;

    if (!title || typeof title !== 'string') {
      return res.status(400).json({ success: false, message: 'Please provide note title' });
    }

    const note = await Note.create({
      userId: req.user._id.toString(),
      journeyId: req.params.journeyId,
      title: title.trim(),
      content: content ? String(content).trim() : '',
      date: date || new Date().toISOString().split('T')[0],
      category: category ? String(category).trim() : 'General'
    });

    return res.status(201).json({ success: true, note });
  } catch (error) {
    console.error('[createNote Error]:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to create note' });
  }
};

// @desc    Update note
// @route   PUT /api/journeys/:journeyId/notes/:noteId
// @access  Private
export const updateNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.noteId);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    if (note.userId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this note' });
    }

    const safeUpdates = { ...req.body };
    delete safeUpdates.userId;
    delete safeUpdates.journeyId;

    const updated = await Note.findByIdAndUpdate(req.params.noteId, safeUpdates, {
      new: true,
      runValidators: true
    });

    return res.json({ success: true, note: updated });
  } catch (error) {
    console.error('[updateNote Error]:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to update note' });
  }
};

// @desc    Delete note
// @route   DELETE /api/journeys/:journeyId/notes/:noteId
// @access  Private
export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.noteId);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    if (note.userId !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this note' });
    }

    await Note.findByIdAndDelete(req.params.noteId);
    return res.json({ success: true, message: 'Note deleted' });
  } catch (error) {
    console.error('[deleteNote Error]:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to delete note' });
  }
};
