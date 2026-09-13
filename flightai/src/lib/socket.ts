"use client";

import { io } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://flightai-backend.onrender.com';

export const socket = io(API_URL);
