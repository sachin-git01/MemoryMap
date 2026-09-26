import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../services/api';
import { 
  MOCK_JOURNEYS, 
  MOCK_CHECKPOINTS, 
  MOCK_NOTES 
} from '../data/mockData';

const JourneyContext = createContext(null);

const LOCAL_JOURNEYS_KEY = "memorymap_demo_journeys";
const LOCAL_CHECKPOINTS_KEY = "memorymap_demo_checkpoints";
const LOCAL_NOTES_KEY = "memorymap_demo_notes";

const readLocalArray = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  const stored = localStorage.getItem(key);
  if (!stored) return fallback;
  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const writeLocalArray = (key, data) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
};

const loadDemoJourneys = () => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(LOCAL_JOURNEYS_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_JOURNEYS_KEY, JSON.stringify(MOCK_JOURNEYS));
    return MOCK_JOURNEYS;
  }
  try {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {}
  localStorage.setItem(LOCAL_JOURNEYS_KEY, JSON.stringify(MOCK_JOURNEYS));
  return MOCK_JOURNEYS;
};

export const useJourney = () => {
  const context = useContext(JourneyContext);
  if (!context) throw new Error("useJourney must be used within a JourneyProvider");
  return context;
};

export const JourneyProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [journeys, setJourneys] = useState(() => (
    currentUser?.isDemo ? loadDemoJourneys() : []
  ));
  const [selectedJourneyId, setSelectedJourneyId] = useState(null);
  const [currentJourney, setCurrentJourney] = useState(null);
  const [checkpoints, setCheckpoints] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Auto-sync currentJourney when selectedJourneyId or journeys changes
  useEffect(() => {
    if (!selectedJourneyId) return;
    const journey = journeys.find(j => j.id === selectedJourneyId);
    setCurrentJourney(journey || null);
  }, [selectedJourneyId, journeys]);

  // Load Journeys whenever currentUser changes
  useEffect(() => {
    if (!currentUser) {
      setJourneys([]);
      setSelectedJourneyId(null);
      setCurrentJourney(null);
      setCheckpoints([]);
      setNotes([]);
      setLoading(false);
      setHasLoaded(true);
      return;
    }

    if (currentUser.isDemo) {
      // ----------------------------------------------------
      // DEMO MODE: Guaranteed 4 Default Journeys
      // ----------------------------------------------------
      const demoJourneys = loadDemoJourneys();
      setJourneys(demoJourneys);
      setLoading(false);
      setHasLoaded(true);
    } else {
      // ----------------------------------------------------
      // REAL USER (JWT API & MongoDB)
      // ----------------------------------------------------
      let isMounted = true;
      setLoading(true);

      api.journeys.list()
        .then((res) => {
          if (!isMounted) return;
          const userJourneys = res?.journeys || [];
          setJourneys(userJourneys);
          setLoading(false);
          setHasLoaded(true);
        })
        .catch((err) => {
          console.error('[Fetch Journeys Error]:', err);
          if (!isMounted) return;
          setJourneys([]);
          setLoading(false);
          setHasLoaded(true);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [currentUser]);

  // Load sub-collections (Checkpoints & Notes) for active journey
  useEffect(() => {
    if (!currentUser || !currentJourney) {
      setCheckpoints([]);
      setNotes([]);
      return;
    }

    if (currentUser.isDemo) {
      // ----------------------------------------------------
      // DEMO MODE: Local Storage
      // ----------------------------------------------------
      let allCp = readLocalArray(LOCAL_CHECKPOINTS_KEY, MOCK_CHECKPOINTS);
      if (allCp.length === 0) {
        localStorage.setItem(LOCAL_CHECKPOINTS_KEY, JSON.stringify(MOCK_CHECKPOINTS));
        allCp = MOCK_CHECKPOINTS;
      }
      const filteredCp = allCp
        .filter(cp => cp.journeyId === currentJourney.id)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      setCheckpoints(filteredCp);

      let allNotes = readLocalArray(LOCAL_NOTES_KEY, MOCK_NOTES);
      if (allNotes.length === 0) {
        localStorage.setItem(LOCAL_NOTES_KEY, JSON.stringify(MOCK_NOTES));
        allNotes = MOCK_NOTES;
      }
      const filteredNotes = allNotes
        .filter(n => n.journeyId === currentJourney.id)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
      setNotes(filteredNotes);
    } else {
      // ----------------------------------------------------
      // REAL USER: MongoDB via Backend API
      // ----------------------------------------------------
      let isMounted = true;

      Promise.all([
        api.checkpoints.list(currentJourney.id),
        api.notes.list(currentJourney.id)
      ])
        .then(([cpRes, notesRes]) => {
          if (!isMounted) return;
          setCheckpoints(cpRes?.checkpoints || []);
          setNotes(notesRes?.notes || []);
        })
        .catch((err) => {
          console.error('[Fetch Checkpoints/Notes Error]:', err);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [currentJourney, currentUser]);

  // Create Journey
  const createJourney = async (journeyData) => {
    if (!currentUser) return;

    if (currentUser.isDemo) {
      // Demo Mode
      const localId = `journey-${Date.now()}`;
      const newJourney = {
        id: localId,
        userId: currentUser.uid,
        journeyName: journeyData.journeyName,
        journeyType: journeyData.journeyType,
        theme: journeyData.theme || journeyData.journeyType,
        startDate: journeyData.startDate || new Date().toISOString().split('T')[0],
        privacy: journeyData.privacy || "private",
        customPreset: journeyData.customPreset,
        customFont: journeyData.customFont,
        customFontFamily: journeyData.customFontFamily,
        customColors: journeyData.customColors,
        createdAt: new Date().toISOString()
      };
      const currentLocal = readLocalArray(LOCAL_JOURNEYS_KEY, []);
      const updated = [newJourney, ...currentLocal];
      writeLocalArray(LOCAL_JOURNEYS_KEY, updated);
      setJourneys(updated);
      setSelectedJourneyId(localId);
      setCurrentJourney(newJourney);
      return localId;
    } else {
      // Real JWT Backend
      const res = await api.journeys.create({
        journeyName: journeyData.journeyName,
        journeyType: journeyData.journeyType,
        theme: journeyData.theme || journeyData.journeyType,
        startDate: journeyData.startDate,
        privacy: journeyData.privacy,
        customPreset: journeyData.customPreset,
        customFont: journeyData.customFont,
        customFontFamily: journeyData.customFontFamily,
        customColors: journeyData.customColors
      });

      if (res?.success && res.journey) {
        setJourneys(prev => [res.journey, ...prev]);
        setSelectedJourneyId(res.journey.id);
        setCurrentJourney(res.journey);
        return res.journey.id;
      }
      throw new Error(res?.message || 'Failed to create journey');
    }
  };

  // Update Journey
  const updateJourney = async (journeyId, updatedData) => {
    if (currentUser?.isDemo) {
      const currentLocal = readLocalArray(LOCAL_JOURNEYS_KEY, []);
      const updated = currentLocal.map(j => j.id === journeyId ? { ...j, ...updatedData } : j);
      writeLocalArray(LOCAL_JOURNEYS_KEY, updated);
      setJourneys(updated);
      if (currentJourney?.id === journeyId) {
        setCurrentJourney(prev => ({ ...prev, ...updatedData }));
      }
    } else {
      const res = await api.journeys.update(journeyId, updatedData);
      if (res?.success && res.journey) {
        setJourneys(prev => prev.map(j => j.id === journeyId ? res.journey : j));
        if (currentJourney?.id === journeyId) {
          setCurrentJourney(res.journey);
        }
      }
    }
  };

  // Delete Journey
  const deleteJourney = async (journeyId) => {
    if (currentUser?.isDemo) {
      const updated = journeys.filter(j => j.id !== journeyId);
      writeLocalArray(LOCAL_JOURNEYS_KEY, updated);
      setJourneys(updated);

      const localCp = readLocalArray(LOCAL_CHECKPOINTS_KEY, []);
      writeLocalArray(LOCAL_CHECKPOINTS_KEY, localCp.filter(c => c.journeyId !== journeyId));

      const localNotes = readLocalArray(LOCAL_NOTES_KEY, []);
      writeLocalArray(LOCAL_NOTES_KEY, localNotes.filter(n => n.journeyId !== journeyId));
    } else {
      await api.journeys.delete(journeyId);
      setJourneys(prev => prev.filter(j => j.id !== journeyId));
    }

    if (currentJourney?.id === journeyId) {
      setSelectedJourneyId(null);
      setCurrentJourney(null);
      setCheckpoints([]);
      setNotes([]);
    }
  };

  // Add Checkpoint
  const addCheckpoint = async (journeyId, checkpointData) => {
    if (!currentUser) return;

    if (currentUser.isDemo) {
      const localId = `cp-${Date.now()}`;
      const newCp = {
        id: localId,
        userId: currentUser.uid,
        journeyId,
        title: checkpointData.title,
        date: checkpointData.date || new Date().toISOString().split('T')[0],
        description: checkpointData.description || "",
        icon: checkpointData.icon || "heart",
        location: checkpointData.location || "",
        photos: checkpointData.photos || [],
        notes: checkpointData.notes || "",
        createdAt: new Date().toISOString()
      };
      const allCp = readLocalArray(LOCAL_CHECKPOINTS_KEY, []);
      const updated = [...allCp, newCp];
      writeLocalArray(LOCAL_CHECKPOINTS_KEY, updated);
      setCheckpoints(updated.filter(cp => cp.journeyId === journeyId).sort((a, b) => new Date(a.date) - new Date(b.date)));
      return localId;
    } else {
      const res = await api.checkpoints.create(journeyId, {
        title: checkpointData.title,
        date: checkpointData.date,
        description: checkpointData.description,
        icon: checkpointData.icon,
        location: checkpointData.location,
        photos: checkpointData.photos,
        notes: checkpointData.notes
      });

      if (res?.success && res.checkpoint) {
        setCheckpoints(prev => [...prev, res.checkpoint].sort((a, b) => new Date(a.date) - new Date(b.date)));
        return res.checkpoint.id;
      }
      throw new Error(res?.message || 'Failed to add checkpoint');
    }
  };

  // Update Checkpoint
  const updateCheckpoint = async (journeyId, checkpointId, updatedData) => {
    if (currentUser?.isDemo) {
      const allCp = readLocalArray(LOCAL_CHECKPOINTS_KEY, []);
      const updated = allCp.map(c => c.id === checkpointId ? { ...c, ...updatedData } : c);
      writeLocalArray(LOCAL_CHECKPOINTS_KEY, updated);
      setCheckpoints(updated.filter(cp => cp.journeyId === journeyId).sort((a, b) => new Date(a.date) - new Date(b.date)));
    } else {
      const res = await api.checkpoints.update(journeyId, checkpointId, updatedData);
      if (res?.success && res.checkpoint) {
        setCheckpoints(prev => prev.map(c => c.id === checkpointId ? res.checkpoint : c));
      }
    }
  };

  // Delete Checkpoint
  const deleteCheckpoint = async (journeyId, checkpointId) => {
    if (currentUser?.isDemo) {
      const allCp = readLocalArray(LOCAL_CHECKPOINTS_KEY, []);
      const updated = allCp.filter(c => c.id !== checkpointId);
      writeLocalArray(LOCAL_CHECKPOINTS_KEY, updated);
      setCheckpoints(updated.filter(cp => cp.journeyId === journeyId));
    } else {
      await api.checkpoints.delete(journeyId, checkpointId);
      setCheckpoints(prev => prev.filter(c => c.id !== checkpointId));
    }
  };

  // Add Note
  const addNote = async (journeyId, noteData) => {
    if (!currentUser) return;

    if (currentUser.isDemo) {
      const localId = `note-${Date.now()}`;
      const newNote = {
        id: localId,
        userId: currentUser.uid,
        journeyId,
        title: noteData.title,
        content: noteData.content,
        date: noteData.date || new Date().toISOString().split('T')[0],
        category: noteData.category || "General",
        createdAt: new Date().toISOString()
      };
      const allNotes = readLocalArray(LOCAL_NOTES_KEY, []);
      const updated = [newNote, ...allNotes];
      writeLocalArray(LOCAL_NOTES_KEY, updated);
      setNotes(updated.filter(n => n.journeyId === journeyId).sort((a, b) => new Date(b.date) - new Date(a.date)));
      return localId;
    } else {
      const res = await api.notes.create(journeyId, {
        title: noteData.title,
        content: noteData.content,
        date: noteData.date,
        category: noteData.category
      });

      if (res?.success && res.note) {
        setNotes(prev => [res.note, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));
        return res.note.id;
      }
      throw new Error(res?.message || 'Failed to add note');
    }
  };

  // Update Note
  const updateNote = async (journeyId, noteId, updatedData) => {
    if (currentUser?.isDemo) {
      const allNotes = readLocalArray(LOCAL_NOTES_KEY, []);
      const updated = allNotes.map(n => n.id === noteId ? { ...n, ...updatedData } : n);
      writeLocalArray(LOCAL_NOTES_KEY, updated);
      setNotes(updated.filter(n => n.journeyId === journeyId).sort((a, b) => new Date(b.date) - new Date(a.date)));
    } else {
      const res = await api.notes.update(journeyId, noteId, updatedData);
      if (res?.success && res.note) {
        setNotes(prev => prev.map(n => n.id === noteId ? res.note : n));
      }
    }
  };

  // Delete Note
  const deleteNote = async (journeyId, noteId) => {
    if (currentUser?.isDemo) {
      const allNotes = readLocalArray(LOCAL_NOTES_KEY, []);
      const updated = allNotes.filter(n => n.id !== noteId);
      writeLocalArray(LOCAL_NOTES_KEY, updated);
      setNotes(updated.filter(n => n.journeyId === journeyId).sort((a, b) => new Date(b.date) - new Date(a.date)));
    } else {
      await api.notes.delete(journeyId, noteId);
      setNotes(prev => prev.filter(n => n.id !== noteId));
    }
  };

  // Upload Photo File (Permanent Storage)
  const uploadPhoto = async (_journeyId, file) => {
    if (!currentUser) return null;
    const isVideo = file.type.startsWith('video/');

    if (currentUser.isDemo) {
      // Temporary Blob URL for Demo Mode
      return URL.createObjectURL(file) + (isVideo ? "#video" : "");
    } else {
      // Permanent Storage on Express Backend via Multer
      const res = await api.upload.file(file);
      if (res?.success && res.url) {
        return res.url;
      }
      throw new Error(res?.message || 'Photo upload failed');
    }
  };

  const selectJourney = useCallback((journeyId) => {
    setSelectedJourneyId(journeyId);
    setCurrentJourney(prev => {
      if (prev?.id === journeyId) return prev;
      return journeys.find(j => j.id === journeyId) || null;
    });
  }, [journeys]);

  const value = {
    journeys,
    selectedJourneyId,
    currentJourney,
    checkpoints,
    notes,
    loading,
    hasLoaded,
    createJourney,
    updateJourney,
    deleteJourney,
    addCheckpoint,
    updateCheckpoint,
    deleteCheckpoint,
    addNote,
    updateNote,
    deleteNote,
    uploadPhoto,
    selectJourney,
    setCurrentJourney
  };

  return (
    <JourneyContext.Provider value={value}>
      {children}
    </JourneyContext.Provider>
  );
};
