import { authenticate } from '@pcd/zuauth/server';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { Zuconfig, SessionData, ironOptions } from '@/constant';

/**
 * Once the front-end has received a PCD from the popup window, it sends it to
 * the back-end for verification.
 *
 * Calling {@link authenticate} will check that the PCD is cryptographically
 * valid, has the correct watermark, and that its contents match the expected
 * event config (public key, event ID, product ID).
 */
export async function POST(req: NextRequest) {
  const cookieStore = cookies();
  const body = await req.json();
  if (!body.pcd || !(typeof body.pcd === 'string')) {
    console.error(`[ERROR] No PCD specified`);
    return new Response('No PCD specified', { status: 400 });
  }
  console.log(`[INFO] PCD:`, body.pcd);

  try {
    const session = await getIronSession<SessionData>(cookieStore, ironOptions);
    console.log(`[INFO] Session: ${JSON.stringify(session)}`);
    const pcd = await authenticate(body.pcd, {
      watermark: session.watermark ?? '',
      config: Zuconfig,
      fieldsToReveal: {
        revealAttendeeEmail: true,
        revealAttendeeName: true,
        revealEventId: true,
        revealProductId: true,
      },
      externalNullifier: session.watermark ?? '',
    });
    console.log(`[INFO] PCD: ${JSON.stringify(pcd)}`);

    session.user = pcd.claim.partialTicket;
    await session.save();
    return Response.json({
      user: session.user,
      nullifier: pcd.claim.nullifierHash,
    });
  } catch (e) {
    console.error(`[ERROR] ${e}`);
    return new Response(
      e instanceof Error ? e.message : 'An unexpected error occurred',
      { status: 400 },
    );
  }
}
