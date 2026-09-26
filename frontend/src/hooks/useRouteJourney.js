import { useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useJourney } from '../context/JourneyContext';

export const useRouteJourney = () => {
  const { journeyId } = useParams();
  const journeyContext = useJourney();
  const { currentJourney, journeys, loading, hasLoaded, selectedJourneyId, selectJourney } = journeyContext;

  const routeJourney = useMemo(
    () => journeys.find(journey => journey.id === journeyId) || null,
    [journeys, journeyId]
  );

  useEffect(() => {
    if (!journeyId) return;
    if (selectedJourneyId !== journeyId || (routeJourney && currentJourney?.id !== journeyId)) {
      selectJourney(journeyId);
    }
  }, [journeyId, selectedJourneyId, routeJourney, currentJourney?.id, selectJourney]);

  const isResolvingJourney = Boolean(
    journeyId && (
      loading ||
      !hasLoaded ||
      selectedJourneyId !== journeyId ||
      (routeJourney && currentJourney?.id !== journeyId)
    )
  );

  const journeyNotFound = Boolean(
    journeyId &&
    hasLoaded &&
    !loading &&
    selectedJourneyId === journeyId &&
    !routeJourney &&
    currentJourney?.id !== journeyId
  );

  return {
    ...journeyContext,
    journeyId,
    routeJourney,
    activeJourney: currentJourney?.id === journeyId ? currentJourney : routeJourney,
    isResolvingJourney,
    journeyNotFound
  };
};
