/**
 * Generate Sponsorship Contract PDF
 * Creates legally binding PDF agreement from deal data
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { deal_id } = await req.json();

    if (!deal_id) {
      return Response.json({ error: 'deal_id required' }, { status: 400 });
    }

    // Fetch deal
    const deals = await base44.entities.SponsorshipDeal.filter({ id: deal_id });
    const deal = deals[0];

    if (!deal) {
      return Response.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Verify user is party to the deal
    if (user.email !== deal.brand_email && user.email !== deal.athlete_email) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    let yPos = margin;

    // Helper functions
    const addText = (text, fontSize = 11, fontStyle = 'normal', color = [0, 0, 0]) => {
      pdf.setFontSize(fontSize);
      pdf.setTextColor(...color);
      pdf.setFont(undefined, fontStyle);
      const splitText = pdf.splitTextToSize(text, contentWidth);
      pdf.text(splitText, margin, yPos);
      yPos += splitText.length * (fontSize * 0.35) + 2;
    };

    const addTitle = (text) => {
      pdf.setFontSize(16);
      pdf.setFont(undefined, 'bold');
      pdf.setTextColor(0, 0, 0);
      const splitText = pdf.splitTextToSize(text, contentWidth);
      pdf.text(splitText, margin, yPos);
      yPos += splitText.length * 6 + 6;
    };

    const addSectionHeader = (text) => {
      pdf.setFontSize(12);
      pdf.setFont(undefined, 'bold');
      pdf.setTextColor(0, 0, 0);
      pdf.text(text, margin, yPos);
      yPos += 8;
    };

    const addLineSpace = (count = 1) => {
      yPos += 4 * count;
    };

    const checkPageBreak = (spaceNeeded = 30) => {
      if (yPos + spaceNeeded > pageHeight - margin) {
        pdf.addPage();
        yPos = margin;
      }
    };

    // Title
    addTitle('SPONSORSHIP AGREEMENT');
    addLineSpace(2);

    // Date and parties
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, yPos);
    yPos += 5;

    addLineSpace();
    addSectionHeader('PARTIES');
    addText(`Brand: ${deal.brand_name} (${deal.brand_email})`);
    addText(`Athlete: ${deal.athlete_name} (${deal.athlete_email})`);

    addLineSpace(2);
    addSectionHeader('1. CAMPAIGN DETAILS');
    addText(`Campaign Title: ${deal.campaign_title}`);
    addText(`Description: ${deal.description}`);
    addText(`Duration: ${deal.duration_days} days`);
    addText(`Start Date: ${new Date(deal.start_date).toLocaleDateString()}`);
    addText(`End Date: ${new Date(deal.end_date).toLocaleDateString()}`);

    checkPageBreak(60);
    addLineSpace(2);
    addSectionHeader('2. COMPENSATION');
    addText(`Total Budget: €${deal.budget}`);
    addText(`Currency: ${deal.currency || 'EUR'}`);
    addText(`Payment Terms: ${deal.payment_terms || 'milestone'}`);

    checkPageBreak(80);
    addLineSpace(2);
    addSectionHeader('3. DELIVERABLES');
    if (deal.deliverables && deal.deliverables.length > 0) {
      deal.deliverables.forEach((deliverable, idx) => {
        const delivText = typeof deliverable === 'string' 
          ? deliverable 
          : `${deliverable.description || 'Deliverable'} - ${deliverable.status || 'pending'}`;
        addText(`${idx + 1}. ${delivText}`);
      });
    } else {
      addText('Deliverables to be defined by mutual agreement.');
    }

    checkPageBreak(80);
    addLineSpace(2);
    addSectionHeader('4. PAYMENT MILESTONES');
    if (deal.escrow_id) {
      addText('Payment is held in escrow and released upon completion of milestones.');
    }
    addText(`Payment Method: ${deal.payment_terms || 'As agreed'}`);

    checkPageBreak(60);
    addLineSpace(2);
    addSectionHeader('5. INTELLECTUAL PROPERTY');
    addText('The Athlete retains all rights to their personal image and likeness. The Brand may use content created during this campaign for marketing purposes as defined herein.');

    checkPageBreak(60);
    addLineSpace(2);
    addSectionHeader('6. CONFIDENTIALITY');
    addText('Both parties agree to keep the terms of this agreement confidential unless otherwise agreed in writing.');

    checkPageBreak(60);
    addLineSpace(2);
    addSectionHeader('7. TERMINATION');
    addText('Either party may terminate this agreement with 14 days written notice if the other party fails to fulfill their obligations.');

    checkPageBreak(60);
    addLineSpace(2);
    addSectionHeader('8. GOVERNING LAW');
    addText('This agreement is governed by the laws of the European Union and the country of the Brand\'s registered office.');

    checkPageBreak(60);
    addLineSpace(3);
    addSectionHeader('SIGNATURES');
    addLineSpace(2);

    pdf.setFontSize(10);
    addText('By signing below, both parties agree to the terms and conditions outlined in this sponsorship agreement.');
    addLineSpace(3);

    // Athlete signature line
    pdf.text('_' + '_'.repeat(40), margin, yPos);
    yPos += 5;
    addText('Athlete Signature', 10, 'bold');
    addText(`${deal.athlete_name}`, 10);
    addText(`Date: ________________`, 10);

    addLineSpace(3);

    // Brand signature line
    pdf.text('_' + '_'.repeat(40), margin, yPos);
    yPos += 5;
    addText('Brand Representative Signature', 10, 'bold');
    addText(`${deal.brand_name}`, 10);
    addText(`Date: ________________`, 10);

    checkPageBreak();
    addLineSpace(2);
    addSectionHeader('APPENDIX: FULL TERMS');
    
    if (deal.negotiation_notes) {
      addLineSpace();
      addText('Negotiation Notes:', 10, 'bold');
      addText(deal.negotiation_notes);
    }

    // Generate PDF
    const pdfBytes = pdf.output('arraybuffer');

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="sponsorship-agreement-${deal.campaign_title.replace(/\s+/g, '-')}-${Date.now()}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Contract generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});