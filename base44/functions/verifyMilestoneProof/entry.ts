/**
 * Verify Milestone Proof
 * AI-powered visual analysis of proof-of-work uploads
 * Auto-triggers multi-signature escrow workflow when verified
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { milestoneId, proofUrl, description, fileType } =
      await req.json();

    if (!milestoneId || !proofUrl) {
      return Response.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Fetch milestone
    const milestones = await base44.entities.MilestonePaymentRequest.filter({
      id: milestoneId,
    });

    if (milestones.length === 0) {
      return Response.json({ error: 'Milestone not found' }, { status: 404 });
    }

    const milestone = milestones[0];

    // Update milestone with proof submission
    await base44.entities.MilestonePaymentRequest.update(milestoneId, {
      proof_of_completion: [
        {
          url: proofUrl,
          type: fileType,
          uploadedAt: new Date().toISOString(),
          description: description,
        },
      ],
      status: 'submitted',
      submitted_at: new Date().toISOString(),
      completion_notes: description,
    });

    // Call AI vision analysis to verify proof
    let verificationResult = null;
    try {
      const verificationPrompt = `
You are a professional services verification AI. Analyze this proof-of-work submission for a sponsorship milestone.

MILESTONE DETAILS:
- Title: ${milestone.milestone_title}
- Description: ${description}

VERIFICATION TASK:
1. Verify the proof shows legitimate completion of the stated work
2. Check for authenticity (no AI-generated or clearly fake content)
3. Ensure content quality meets professional standards
4. Assess completion percentage (0-100%)

RESPONSE FORMAT (JSON):
{
  "verified": boolean (true if proof appears legitimate),
  "confidence": number (0-100),
  "completionPercentage": number (0-100),
  "analysis": "brief analysis of the proof",
  "concerns": "any concerns or red flags",
  "recommendation": "APPROVE" or "REQUEST_REVISION"
}
`;

      verificationResult = await base44.integrations.Core.InvokeLLM({
        prompt: verificationPrompt,
        file_urls: [proofUrl],
        response_json_schema: {
          type: 'object',
          properties: {
            verified: { type: 'boolean' },
            confidence: { type: 'number' },
            completionPercentage: { type: 'number' },
            analysis: { type: 'string' },
            concerns: { type: 'string' },
            recommendation: { type: 'string' },
          },
        },
      });
    } catch (aiError) {
      console.error('AI verification failed:', aiError);
      verificationResult = {
        verified: true,
        confidence: 0,
        completionPercentage: 75,
        analysis: 'AI verification unavailable - defaulting to manual review',
        concerns: '',
        recommendation: 'REQUEST_REVISION',
      };
    }

    // Handle verification result
    let updateData = {
      status: 'under_review',
      reviewed_at: new Date().toISOString(),
    };

    if (
      verificationResult.verified &&
      verificationResult.confidence > 80 &&
      verificationResult.recommendation === 'APPROVE'
    ) {
      // Auto-approve if confidence is high
      updateData.status = 'approved';
      updateData.approved_at = new Date().toISOString();

      // Create multi-signature approval record to trigger escrow release
      const multiSig = await base44.entities.MultiSignatureApproval.create({
        milestone_id: milestoneId,
        escrow_id: milestone.escrow_id,
        deal_id: milestone.deal_id,
        athlete_email: milestone.athlete_email,
        brand_email: milestone.brand_email,
        milestone_amount: milestone.milestone_amount,
        proof_of_work_url: proofUrl,
        status: 'pending_signatures',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

      // Notify brand to sign off
      await base44.integrations.Core.SendEmail({
        to: milestone.brand_email,
        subject: `AI Verified: Proof-of-Work Ready for Signature - ${milestone.milestone_title}`,
        body: `Athlete ${milestone.athlete_name} has submitted proof for milestone "${milestone.milestone_title}".

AI VERIFICATION RESULTS:
- Verified: ✓ Yes
- Confidence: ${verificationResult.confidence}%
- Completion: ${verificationResult.completionPercentage}%
- Analysis: ${verificationResult.analysis}

The proof has passed automated AI verification. Please review and digitally sign to approve the €${milestone.milestone_amount} escrow release.

Your signature is required to complete the multi-signature approval process.`,
      });
    } else {
      // Request revision if confidence is low or concerns exist
      updateData.status = 'rejected';
      updateData.rejection_reason = `AI Verification: ${verificationResult.analysis}. Confidence: ${verificationResult.confidence}%. ${verificationResult.concerns ? 'Concerns: ' + verificationResult.concerns : ''}`;

      // Notify athlete to resubmit
      await base44.integrations.Core.SendEmail({
        to: milestone.athlete_email,
        subject: `Proof Verification Issue - Please Resubmit: ${milestone.milestone_title}`,
        body: `Your proof-of-work submission did not pass automated verification.

FEEDBACK:
${verificationResult.analysis}

Confidence: ${verificationResult.confidence}%
${verificationResult.concerns ? 'Concerns: ' + verificationResult.concerns : ''}

Please address the issues and resubmit your proof.`,
      });
    }

    // Update milestone with verification results
    const updatedMilestone = await base44.entities.MilestonePaymentRequest.update(
      milestoneId,
      {
        ...updateData,
        brand_notes: `AI Verification - Confidence: ${verificationResult.confidence}%, Completion: ${verificationResult.completionPercentage}%`,
      }
    );

    return Response.json({
      success: true,
      milestone: updatedMilestone,
      verification: verificationResult,
      autoApproved: updateData.status === 'approved',
    });
  } catch (error) {
    console.error('Milestone proof verification error:', error);
    return Response.json(
      { error: error.message || 'Verification failed' },
      { status: 500 }
    );
  }
});