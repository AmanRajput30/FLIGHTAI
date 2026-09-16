"use client";

import { io } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://flightai-hxbd.onrender.com';

export const socket = io(API_URL, {
  reconnectionDelay: 1000,       // Start with 1s delay
  reconnectionDelayMax: 10000,   // Max delay of 10s
  randomizationFactor: 0.8       // 80% randomness to scatter reconnections widely (0.2s to 1.8s, etc)
});
