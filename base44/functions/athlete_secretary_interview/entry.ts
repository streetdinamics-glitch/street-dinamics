import { createClientFromRequest } from 'npm:@base44/sdk@0.8.0';

// ── Types ────────────────────────────────────────────────────────────────────
interface SocialLinks {
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  youtube?: string;
  [key: string]: string | undefined;
}

interface AthleteData {
  bio: string;
  sports: string[];
  experience_level: string;
  portfolio_url?: string;
  social_links: SocialLinks;
}

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  athleteData: AthleteData;
  conversationHistory: ConversationMessage[];
  userMessage: string;
  athleteId: string; // FIX #3 & #10: required to persist outcome server-side
}

// ── Constants ─────────────────────────────────────────────────────────────────
const MAX_EXCHANGES = 8;
const MIN_EXCHANGES_BEFORE_COMPLETE = 3; // FIX #2: prevent premature completion

// ── Helper ────────────────────────────────────────────────────────────────────
function buildSystemPrompt(athleteData: AthleteData): string {
  const sports = Array.isArray(athleteData.sports) && athleteData.sports.length > 0
    ? athleteData.sports.join(', ')
    : 'Not specified'; // FIX #5: guard against null/undefined sports

  const socialLinks = athleteData.social_links && typeof athleteData.social_links === 'object'
    ? Object.entries(athleteData.social_links)
        .filter(([_, v]) => v)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ') || 'None provided'
    : 'None provided'; // FIX #5: guard against null social_links

  return `You are Street Dynamics' professional secretary AI conducting athlete verification interviews.

Athlete Profile:
- Bio: ${athleteData.bio ?? 'Not provided'}
- Sports: ${sports}
- Experience: ${athleteData.experience_level ?? 'Not specified'}
- Portfolio: ${athleteData.portfolio_url || 'Not provided'}
- Social Links: ${socialLinks}

Your role:
1. Ask clarifying questions about their athletic background, achievements, and motivation
2. Verify authenticity and passion for their chosen sports
3. Assess professionalism and fit for the Street Dynamics community
4. Be encouraging but thorough (${MIN_EXCHANGES_BEFORE_COMPLETE}-5 questions minimum before concluding)
5. After at least ${MIN_EXCHANGES_BEFORE_COMPLETE} substantive exchanges, determine if they should be verified

Guidelines:
- Keep responses concise (1-2 sentences per question)
- Focus on their experience, achievements, and community alignment
- Use a friendly but professional tone
- Only after sufficient assessment, append exactly: INTERVIEW_COMPLETE:APPROVED or INTERVIEW_COMPLETE:REJECTED

If their answers demonstrate genuine passion, experience, and community fit → INTERVIEW_COMPLETE:APPROVED
If they fail to demonstrate fit → INTERVIEW_COMPLETE:REJECTED`;
}

// ── Main Handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // FIX #4: validate body before using it
    let body: RequestBody;
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { athleteData, conversationHistory, userMessage, athleteId } = body;

    // FIX #4: explicit field validation
    if (!athleteData || !userMessage || !athleteId) {
      return Response.json({ error: 'Missing required fields: athleteData, userMessage, athleteId' }, { status: 400 });
    }

    // FIX #6: guard conversationHistory type
    const history: ConversationMessage[] = Array.isArray(conversationHistory)
      ? conversationHistory
      : [];

    // FIX #2: prevent abuse — force-complete only after MAX_EXCHANGES
    const forceComplete = history.length >= MAX_EXCHANGES;

    // FIX #8: system prompt passed correctly as separate field, not string-prefixed
    const response: string = await base44.integrations.Core.InvokeLLM({
      system: buildSystemPrompt(athleteData), // proper system role
      prompt: [
        'Conversation History:',
        ...history.map(m => `${m.role === 'user' ? 'Athlete' : 'Secretary'}: ${m.content}`),
        '',
        `Athlete's new response: ${userMessage}`,
        '',
        forceComplete
          ? 'This is the final exchange. You must now conclude the interview with INTERVIEW_COMPLETE:APPROVED or INTERVIEW_COMPLETE:REJECTED.'
          : 'Secretary AI response:',
      ].join('\n'),
      model: 'gpt-4o', // FIX #1: valid model identifier
    });

    // FIX #2 & #7: robust outcome detection
    const isApproved  = response.includes('INTERVIEW_COMPLETE:APPROVED');
    const isRejected  = response.includes('INTERVIEW_COMPLETE:REJECTED');
    const interviewComplete = forceComplete || isApproved || isRejected;

    // FIX #7: strip ALL completion tokens cleanly, never leak them to the client
    const cleanResponse = response
      .replace('INTERVIEW_COMPLETE:APPROVED', '')
      .replace('INTERVIEW_COMPLETE:REJECTED', '')
      .replace('INTERVIEW_COMPLETE', '')
      .trim();

    // FIX #3: persist verification outcome when interview concludes
    if (interviewComplete) {
      const verified = isApproved; // false if rejected or force-completed without approval

      await base44.asServiceRole.entities.Athlete.update(athleteId, {
        verified,
        verification_status: verified ? 'approved' : 'rejected',
        verification_date: new Date().toISOString(),
        interview_exchanges: history.length,
      });

      // FIX #11: only log notification on meaningful state change (completion)
      await base44.asServiceRole.entities.Notification.create({
        user_email: user.email,
        type: 'interview_complete',
        title: 'Athlete Verification Interview Complete',
        message: `Interview concluded after ${history.length} exchanges. Result: ${verified ? 'APPROVED ✅' : 'REJECTED ❌'}`,
        read: false,
        created_at: new Date().toISOString(),
      }).catch(() => null); // non-critical
    }

    return Response.json({
      response: cleanResponse || "Thank you for your response. Let's continue.",
      interviewComplete,
      verified: interviewComplete ? isApproved : null,
      messageCount: history.length + 1,
    });

  } catch (error: unknown) {
    // FIX #14: surface meaningful error detail
    const message = error instanceof Error ? error.message : 'Unknown error';
    const name    = error instanceof Error ? error.name    : 'Error';
    console.error(`[athlete_secretary_interview] ${name}:`, error);
    return Response.json({ error: message, type: name }, { status: 500 });
  }
});
