import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { api } from '../services/api';
import { 
  MOCK_JOURNEYS, 
  MOCK_CHECKPOINTS, 
  MOCK_NOTES 
} from '../data/mockData';

const JourneyContext = createContext(null);

// Clean up any old persistent demo keys from localStorage so demo mode is 100% ephemeral
if (typeof window !== 'undefined') {
  localStorage.removeItem("memorymap_demo_journeys");
  localStorage.removeItem("memorymap_demo_checkpoints");
  localStorage.removeItem("memorymap_demo_notes");
  localStorage.removeItem("photoflow_demo_journeys");
  localStorage.removeItem("photoflow_demo_checkpoints");
  localStorage.removeItem("photoflow_demo_notes");
}

export const useJourney = () => {
  const context = useContext(JourneyContext);
  if (!context) throw new Error("useJourney must be used within a JourneyProvider");
  return context;
};

export const JourneyProvider = ({ children }) => {
  const { currentUser } = useAuth();

  // In-Memory Demo Collections (RAM only - resets to pristine mockData on page refresh)
  const [demoCheckpoints, setDemoCheckpoints] = useState(() => JSON.parse(JSON.stringify(MOCK_CHECKPOINTS)));
  const [demoNotes, setDemoNotes] = useState(() => JSON.parse(JSON.stringify(MOCK_NOTES)));

  const [journeys, setJourneys] = useState(() => (
    currentUser?.isDemo ? JSON.parse(JSON.stringify(MOCK_JOURNEYS)) : []
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
      // DEMO MODE: In-Memory Only (Resets on Refresh)
      // ----------------------------------------------------
      const initialMock = JSON.parse(JSON.stringify(MOCK_JOURNEYS));
      setJourneys(initialMock);
      setDemoCheckpoints(JSON.parse(JSON.stringify(MOCK_CHECKPOINTS)));
      setDemoNotes(JSON.parse(JSON.stringify(MOCK_NOTES)));
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
      // DEMO MODE: In-Memory Filter (Never in localStorage)
      // ----------------------------------------------------
      const filteredCp = demoCheckpoints
        .filter(cp => cp.journeyId === currentJourney.id)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      setCheckpoints(filteredCp);

      const filteredNotes = demoNotes
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
  }, [currentJourney, currentUser, demoCheckpoints, demoNotes]);

  // Create Journey
  const createJourney = async (journeyData) => {
    if (!currentUser) return;

    if (currentUser.isDemo) {
      // Demo Mode: In-Memory Only
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
      setJourneys(prev => [newJourney, ...prev]);
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
      setJourneys(prev => prev.map(j => j.id === journeyId ? { ...j, ...updatedData } : j));
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
      setJourneys(prev => prev.filter(j => j.id !== journeyId));
      setDemoCheckpoints(prev => prev.filter(c => c.journeyId !== journeyId));
      setDemoNotes(prev => prev.filter(n => n.journeyId !== journeyId));
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
      setDemoCheckpoints(prev => [...prev, newCp]);
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
      setDemoCheckpoints(prev => prev.map(c => c.id === checkpointId ? { ...c, ...updatedData } : c));
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
      setDemoCheckpoints(prev => prev.filter(c => c.id !== checkpointId));
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
      setDemoNotes(prev => [newNote, ...prev]);
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
      setDemoNotes(prev => prev.map(n => n.id === noteId ? { ...n, ...updatedData } : n));
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
      setDemoNotes(prev => prev.filter(n => n.id !== noteId));
    } else {
      await api.notes.delete(journeyId, noteId);
      setNotes(prev => prev.filter(n => n.id !== noteId));
    }
  };

  // Upload Single Photo File
  const uploadPhoto = async (_journeyId, file) => {
    if (!currentUser || !file) return null;
    const isVideo = file.type.startsWith('video/');

    if (currentUser.isDemo) {
      // In-Memory Blob URL only - disappears completely on refresh
      return URL.createObjectURL(file) + (isVideo ? "#video" : "");
    } else {
      // Permanent Storage on Express Backend via Multer / Cloudinary
      const res = await api.upload.file(file);
      if (res?.success && res.url) {
        return res.url;
      }
      throw new Error(res?.message || 'Photo upload failed');
    }
  };

  // Upload Multiple Photo Files (Batch Upload)
  const uploadPhotos = async (_journeyId, files) => {
    if (!currentUser) return [];
    const fileList = Array.from(files || []);
    if (fileList.length === 0) return [];

    if (currentUser.isDemo) {
      // In-Memory Blob URLs only - disappears completely on refresh
      return fileList.map(file => {
        const isVideo = file.type.startsWith('video/');
        return URL.createObjectURL(file) + (isVideo ? "#video" : "");
      });
    } else {
      // 1. Try parallel batch upload endpoint first
      try {
        const res = await api.upload.multiple(fileList);
        if (res?.success && Array.isArray(res.urls) && res.urls.length > 0) {
          return res.urls;
        }
        if (res?.success && Array.isArray(res.files) && res.files.length > 0) {
          return res.files.map(f => f.url);
        }
      } catch (multipleErr) {
        console.warn('[uploadPhotos multiple endpoint failed, falling back to individual uploads]:', multipleErr.message);
      }

      // 2. Fallback: upload each file individually
      const results = [];
      for (const f of fileList) {
        try {
          const res = await api.upload.file(f);
          if (res?.success && res.url) {
            results.push(res.url);
          }
        } catch (singleErr) {
          console.error(`[Upload single file error on ${f.name}]:`, singleErr.message);
        }
      }
      return results;
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
    uploadPhotos,
    selectJourney,
    setCurrentJourney
  };

  return (
    <JourneyContext.Provider value={value}>
      {children}
    </JourneyContext.Provider>
  );
};
