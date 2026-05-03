/**
 * Socket.io client hook — connects once per app session
 * Provides join/leave movie room helpers + real-time CinePulse updates
 */
import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

let socket = null;

const getSocket = (token) => {
  if (!socket || socket.disconnected) {
    socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) { socket.disconnect(); socket = null; }
};

/**
 * useMovieRoom(movieId, onPulseUpdate)
 * Joins the movie socket room and calls onPulseUpdate when a vote fires live
 */
export function useMovieRoom(movieId, onPulseUpdate) {
  const handlerRef = useRef(onPulseUpdate);
  handlerRef.current = onPulseUpdate;

  useEffect(() => {
    if (!movieId) return;
    const token = localStorage.getItem('accessToken');
    const s = getSocket(token);

    s.emit('join:movie', movieId);
    const handler = (data) => handlerRef.current?.(data);
    s.on('cinepulse:update', handler);
    s.on('review:new', (review) => {
      // Trigger a custom event for review updates
      window.dispatchEvent(new CustomEvent('cinetter:review', { detail: review }));
    });

    return () => {
      s.off('cinepulse:update', handler);
      s.emit('leave:movie', movieId);
    };
  }, [movieId]);
}

/**
 * useWatchParty(roomId, callbacks)
 * For watch party rooms
 */
export function useWatchParty(roomId, { onUserJoin, onReaction, onSync } = {}) {
  useEffect(() => {
    if (!roomId) return;
    const token = localStorage.getItem('accessToken');
    const s = getSocket(token);

    s.emit('join:party', roomId);
    if (onUserJoin) s.on('party:user-joined', onUserJoin);
    if (onReaction)  s.on('party:reaction', onReaction);
    if (onSync)      s.on('party:sync', onSync);

    return () => {
      s.off('party:user-joined', onUserJoin);
      s.off('party:reaction', onReaction);
      s.off('party:sync', onSync);
    };
  }, [roomId]);

  const sendReaction = useCallback((emoji) => {
    socket?.emit('party:reaction', { roomId, emoji });
  }, [roomId]);

  const sendSync = useCallback((timestamp) => {
    socket?.emit('party:sync', { roomId, timestamp });
  }, [roomId]);

  return { sendReaction, sendSync };
}
