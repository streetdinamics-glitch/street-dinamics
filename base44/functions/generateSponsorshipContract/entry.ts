/**
 * Generate Sponsorship Contract PDF
 * Creates a PDF agreement from deal data
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.0'; // FIX #7: consistent version
import { jsPDF } from 'npm:jspdf@4.0.0';

// ── Types ─────────────────────────────────────────────────────────────────────
interface Deliverable {
  description?: string;
  status?:      string;
}

interface SponsorshipDeal {
  id:                 string;
  brand_name:         string;
  brand_email:        string;
  athlete_name:       string;
  athlete_email:      string;
  campaign_title:     string;
  description?:       string;
  duration_days?:     number;
  start_date?:        string;
  end_date?:          string;
  budget?:            number;
  currency?:          string;
  payment_terms?:     string;
  deliverables?:      (string | Deliverable)[];
  escrow_id?:         string;
  negotiation_notes?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// FIX #3 & #4: safe filename sanitization
function sanitizeFilename(str: string): string {
  return (str ?? 'untitled')
    .replace(/[^a-zA-Z0-9-_. ]/g, '')  // strip unsafe chars
    .replace(/\s+/g, '-')
    .slice(0, 80);                       // cap length
}

// FIX #5: safe date formatting
function formatDate(value: string | undefined): string {
  if (!value) return 'TBD';
  const d = new Date(value);
  return isNaN(d.getTime())
    ? 'TBD'
    : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// FIX #6: safe currency formatting
function formatCurrency(amount: number | undefined, currency = 'EUR'): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) return 'To be agreed';
  return new Intl.NumberFormat('en-EU', { style: 'currency', currency }).format(Number(amount));
}

// FIX #9: safe text — strip chars that break PDF rendering
function safeText(value: unknown, fallback = 'N/A'): string {
  if (value === null || value === undefined) return fallback;
  return String(value).replace(/[\x00-\x09\x0B-\x1F\x7F]/g, '').trim() || fallback;
}

// ── PDF Builder ───────────────────────────────────────────────────────────────
function buildContractPDF(deal: SponsorshipDeal): Uint8Array {
  const pdf         = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth   = pdf.internal.pageSize.getWidth();
  const pageHeight  = pdf.internal.pageSize.getHeight();
  const margin      = 15;
  const contentWidth = pageWidth - margin * 2;
  let yPos          = margin;

  // FIX #13: explicit font name instead of undefined
  const setFont = (style: 'normal' | 'bold' | 'italic' = 'normal', size = 11) => {
    pdf.setFont('helvetica', style);
    pdf.setFontSize(size);
  };

  const checkPageBreak = (spaceNeeded = 30) => {
    if (yPos + spaceNeeded > pageHeight - margin) {
      pdf.addPage();
      yPos = margin;
    }
  };

  const addLineSpace = (count = 1) => { yPos += 4 * count; };

  // FIX #15: use getLineHeight for accurate spacing
  const addText = (
    text:      string,
    fontSize   = 11,
    fontStyle: 'normal' | 'bold' | 'italic' = 'normal',
    color:     [number, number, number] = [0, 0, 0], // FIX #8: typed color tuple
  ) => {
    setFont(fontStyle, fontSize);
    pdf.setTextColor(color[0], color[1], color[2]);
    const splitText = pdf.splitTextToSize(safeText(text), contentWidth);
    checkPageBreak(splitText.length * 6 + 4); // FIX #10: check before every text block
    pdf.text(splitText, margin, yPos);
    yPos += splitText.length * pdf.getLineHeight() * 0.35 + 2;
  };

  const addTitle = (text: string) => {
    setFont('bold', 18);
    pdf.setTextColor(0, 0, 0);
    const splitText = pdf.splitTextToSize(safeText(text), contentWidth);
    pdf.text(splitText, pageWidth / 2, yPos, { align: 'center' });
    yPos += splitText.length * 8 + 4;
  };

  const addSectionHeader = (text: string) => {
    checkPageBreak(20);
    setFont('bold', 12);
    pdf.setTextColor(30, 30, 30);
    pdf.text(safeText(text), margin, yPos);
    // Underline
    pdf.setDrawColor(30, 30, 30);
    pdf.setLineWidth(0.3);
    pdf.line(margin, yPos + 1, margin + contentWidth, yPos + 1);
    yPos += 8;
  };

  // FIX #14: real signature lines using pdf.line() instead of underscore strings
  const addSignatureLine = (label: string, name: string) => {
    checkPageBreak(30);
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.4);
    pdf.line(margin, yPos, margin + 80, yPos);
    yPos += 5;
    addText(label, 9, 'bold');
    addText(safeText(name), 9);
    addText('Date: _______________', 9);
    addLineSpace(2);
  };

  // ── Content ─────────────────────────────────────────────────────────────────

  addTitle('SPONSORSHIP AGREEMENT');
  addLineSpace();

  setFont('normal', 10);
  pdf.setTextColor(100, 100, 100);
  pdf.text(`Generated: ${formatDate(new Date().toISOString())}`, margin, yPos);
  yPos += 6;

  addLineSpace();
  addSectionHeader('PARTIES');
  addText(`Brand:   ${safeText(deal.brand_name)} (${safeText(deal.brand_email)})`);
  addText(`Athlete: ${safeText(deal.athlete_name)} (${safeText(deal.athlete_email)})`);

  addLineSpace(2);
  addSectionHeader('1. CAMPAIGN DETAILS');
  addText(`Campaign Title: ${safeText(deal.campaign_title)}`);
  addText(`Description:    ${safeText(deal.description, 'Not provided')}`);
  addText(`Duration:       ${deal.duration_days != null && !isNaN(deal.duration_days) ? `${deal.duration_days} days` : 'TBD'}`); // FIX #16
  addText(`Start Date:     ${formatDate(deal.start_date)}`);  // FIX #5
  addText(`End Date:       ${formatDate(deal.end_date)}`);    // FIX #5

  addLineSpace(2);
  addSectionHeader('2. COMPENSATION');
  addText(`Total Budget:   ${formatCurrency(deal.budget, deal.currency || 'EUR')}`); // FIX #6
  addText(`Currency:       ${safeText(deal.currency, 'EUR')}`);
  addText(`Payment Terms:  ${safeText(deal.payment_terms, 'Milestone-based')}`);

  addLineSpace(2);
  addSectionHeader('3. DELIVERABLES');
  if (deal.deliverables && deal.deliverables.length > 0) {
    deal.deliverables.forEach((deliverable, idx) => {
      const delivText = typeof deliverable === 'string'
        ? deliverable
        : `${safeText(deliverable.description, 'Deliverable')} — ${safeText(deliverable.status, 'pending')}`;
      addText(`${idx + 1}. ${delivText}`); // FIX #10: checkPageBreak is inside addText now
    });
  } else {
    addText('Deliverables to be defined by mutual agreement.');
  }

  addLineSpace(2);
  addSectionHeader('4. PAYMENT MILESTONES');
  if (deal.escrow_id) {
    addText('Payment is held in escrow and released upon verified completion of each milestone.');
  }
  addText(`Payment Method: ${safeText(deal.payment_terms, 'As agreed')}`);

  addLineSpace(2);
  addSectionHeader('5. INTELLECTUAL PROPERTY');
  addText(
    'The Athlete retains all rights to their personal image and likeness. ' +
    'The Brand may use content created during this campaign solely for marketing ' +
    'purposes as explicitly defined herein, for the duration of this agreement only.'
  );

  addLineSpace(2);
  addSectionHeader('6. CONFIDENTIALITY');
  addText(
    'Both parties agree to keep the financial terms of this agreement strictly ' +
    'confidential. Disclosure requires prior written consent from both parties.'
  );

  addLineSpace(2);
  addSectionHeader('7. TERMINATION');
  addText(
    'Either party may terminate this agreement with 14 days written notice if the ' +
    'other party materially fails to fulfill their obligations and does not remedy ' +
    'the breach within 7 days of written notice.'
  );

  addLineSpace(2);
  addSectionHeader('8. GOVERNING LAW');
  addText(
    "This agreement is governed by the laws of the European Union and the country " +
    "of the Brand's registered office. Any disputes shall be resolved by binding arbitration."
  );

  addLineSpace(2);
  addSectionHeader('9. ENTIRE AGREEMENT');
  addText(
    'This document constitutes the entire agreement between the parties and supersedes ' +
    'all prior negotiations, representations, or agreements, whether oral or written.'
  );

  checkPageBreak(60);
  addLineSpace(3);
  addSectionHeader('SIGNATURES');
  addLineSpace();
  addText('By signing below, both parties agree to all terms and conditions in this agreement.');
  addLineSpace(2);

  addSignatureLine('Athlete Signature', deal.athlete_name); // FIX #14
  addSignatureLine('Brand Representative Signature', deal.brand_name);

  if (deal.negotiation_notes) {
    checkPageBreak(40);
    addLineSpace(2);
    addSectionHeader('APPENDIX: NEGOTIATION NOTES');
    addLineSpace();
    addText(safeText(deal.negotiation_notes)); // FIX #9: sanitized
  }

  // FIX #11: use uint8array — more reliable than arraybuffer in Deno
  return pdf.output('uint8array') as Uint8Array;
}

// ── Main Handler ──────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  // FIX #1: method guard
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user   = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // FIX #12: safe body parse
    let body: { deal_id?: string };
    try {
      body = await req.json();
    } catch {
      return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { deal_id } = body;
    if (!deal_id) {
      return Response.json({ error: 'deal_id required' }, { status: 400 });
    }

    // FIX #2: use asServiceRole for consistent permissions
    const deals: SponsorshipDeal[] = await base44.asServiceRole.entities.SponsorshipDeal.filter({
      id: deal_id,
    });
    const deal = deals?.[0];

    if (!deal) {
      return Response.json({ error: 'Deal not found' }, { status: 404 });
    }

    // Authorization: only parties to the deal can generate it
    if (user.email !== deal.brand_email && user.email !== deal.athlete_email) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const pdfBytes = buildContractPDF(deal);

    // FIX #4 & #3: safe filename, guard against null campaign_title
    const filename = `sponsorship-${sanitizeFilename(deal.campaign_title)}-${Date.now()}.pdf`;

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Length':      pdfBytes.byteLength.toString(), // FIX #17
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control':       'no-store',
      },
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const name    = error instanceof Error ? error.name    : 'Error';
    console.error(`[generateSponsorshipContract] ${name}:`, error);
    return Response.json({ error: message, type: name }, { status: 500 });
  }
});
