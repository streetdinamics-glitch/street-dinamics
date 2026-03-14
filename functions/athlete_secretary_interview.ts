import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

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

    const { athleteData, conversationHistory, userMessage } = await req.json();

    // Construct system prompt for secretary AI
    const systemPrompt = `You are Street Dynamics' professional secretary AI conducting athlete verification interviews.

Athlete Profile:
- Bio: ${athleteData.bio}
- Sports: ${athleteData.sports.join(', ')}
- Experience: ${athleteData.experience_level}
- Portfolio: ${athleteData.portfolio_url || 'Not provided'}
- Social Links: ${Object.entries(athleteData.social_links).filter(([_, v]) => v).map(([k, v]) => `${k}: ${v}`).join(', ') || 'None provided'}

Your role:
1. Ask clarifying questions about their athletic background, achievements, and motivation
2. Verify authenticity and passion for their chosen sports
3. Assess professionalism and fit for the Street Dynamics community
4. Be encouraging but thorough (3-5 questions total)
5. After 4-5 exchanges, determine if they should be verified

Guidelines:
- Keep responses concise (1-2 sentences per question)
- Focus on their experience, achievements, and community alignment
- Use a friendly but professional tone
- After assessing answers, respond with INTERVIEW_COMPLETE when ready

If their answers demonstrate genuine passion, experience, and community fit, mark as verified.`;

    // Call LLM with conversation history
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `System: ${systemPrompt}\n\nConversation History:\n${conversationHistory.map(m => `${m.role === 'user' ? 'Athlete' : 'Secretary'}: ${m.content}`).join('\n')}\n\nAthletes new response: ${userMessage}\n\nSecretary AI response:`,
      model: 'gpt_5',
    });

    // Check if interview should be marked complete
    const interviewComplete = response.toLowerCase().includes('interview_complete') || conversationHistory.length > 8;
    const cleanResponse = response.replace('INTERVIEW_COMPLETE', '').trim();

    // Log interview interaction
    await base44.asServiceRole.entities.Notification.create({
      user_email: user.email,
      type: 'interview_progress',
      title: 'Athlete Verification Interview',
      message: `Interview progress: ${conversationHistory.length} exchanges. Status: ${interviewComplete ? 'Complete' : 'In Progress'}`,
      read: false,
      created_at: new Date().toISOString(),
    }).catch(() => null); // Non-critical

    return Response.json({
      response: cleanResponse || response,
      interviewComplete,
      messageCount: conversationHistory.length,
    });
  } catch (error) {
    console.error('Interview error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});