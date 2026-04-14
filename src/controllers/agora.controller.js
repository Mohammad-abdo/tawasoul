import { validationResult } from 'express-validator';
import agoraTokenPackage from 'agora-access-token';
import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';

const { RtcTokenBuilder, RtcRole } = agoraTokenPackage;

const hashStringToUid = (value) => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  }

  const normalized = Math.abs(hash) % 100000;
  return normalized === 0 ? 1 : normalized;
};

export const generateAgoraToken = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: errors.array()[0].msg
        }
      });
    }

    const appId = process.env.AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;
    const expiresIn = parseInt(process.env.AGORA_TOKEN_EXPIRY_SECONDS || '3600', 10);

    if (!appId || !appCertificate) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'AGORA_NOT_CONFIGURED',
          message: 'Agora credentials are not configured on the server'
        }
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: req.body.bookingId },
      select: {
        id: true,
        userId: true,
        doctorId: true,
        status: true,
        videoLink: true
      }
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: 'Booking not found'
        }
      });
    }

    const requesterId = req.authActor?.id;
    const isParticipant = requesterId === booking.userId || requesterId === booking.doctorId;

    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You are not allowed to access this booking channel'
        }
      });
    }

    if (booking.status !== 'CONFIRMED') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BOOKING_NOT_CONFIRMED',
          message: 'Agora tokens can only be generated for confirmed bookings'
        }
      });
    }

    const channelName = booking.id;
    const uid = hashStringToUid(requesterId);
    const privilegeExpiredTs = Math.floor(Date.now() / 1000) + expiresIn;
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      RtcRole.PUBLISHER,
      privilegeExpiredTs
    );

    if (!booking.videoLink) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { videoLink: channelName }
      });
    }

    res.json({
      success: true,
      data: {
        token,
        channelName,
        uid,
        appId,
        expiresIn
      }
    });
  } catch (error) {
    logger.error('Generate Agora token error:', error);
    next(error);
  }
};
