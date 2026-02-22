import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, event_type, event_date, location, budget, message, honeypot } = req.body;

  if (honeypot) {
    return res.status(200).json({ success: true });
  }

  if (!name || !email || !phone || !event_type || !event_date || !location || !budget || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const phoneDigits = phone.replace(/\D/g, '');
  if (phoneDigits.length !== 10) {
    return res.status(400).json({ error: 'Phone must be exactly 10 digits' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const selectedDate = new Date(event_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selectedDate < today) {
    return res.status(400).json({ error: 'Event date must be today or a future date' });
  }

  if (message.trim().length < 32) {
    return res.status(400).json({ error: 'Message must be at least 32 characters' });
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'info@aarambhproductions.com';

  const eventTypes = {
    wedding: 'Wedding',
    'pre-wedding': 'Pre-Wedding / Engagement',
    corporate: 'Corporate Event',
    private: 'Private / Social Event',
    brand: 'Brand / Product Shoot',
    other: 'Other',
  };

  const budgetRanges = {
    '50k-1L': '₹50,000 – ₹1,00,000',
    '1L-2L': '₹1,00,000 – ₹2,00,000',
    '2L-5L': '₹2,00,000 – ₹5,00,000',
    '5L+': '₹5,00,000+',
    discuss: "Let's Discuss",
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Not specified';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: #d4af37; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px; }
        .header p { margin: 8px 0 0; font-size: 14px; opacity: 0.8; }
        .content { background: #fafafa; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e0e0e0; border-top: none; }
        .field { margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #e8e8e8; }
        .field:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
        .label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #888; margin-bottom: 4px; }
        .value { font-size: 16px; color: #1a1a1a; }
        .message-box { background: #fff; padding: 20px; border-radius: 6px; border-left: 4px solid #d4af37; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; }
        .footer p { font-size: 12px; color: #888; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>AARAMBH</h1>
        <p>New Inquiry Received</p>
      </div>
      <div class="content">
        <div class="field">
          <div class="label">Client Name</div>
          <div class="value">${escapeHtml(name)}</div>
        </div>
        <div class="field">
          <div class="label">Email</div>
          <div class="value"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></div>
        </div>
        <div class="field">
          <div class="label">Phone</div>
          <div class="value"><a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a></div>
        </div>
        <div class="field">
          <div class="label">Event Type</div>
          <div class="value">${eventTypes[event_type] || event_type}</div>
        </div>
        <div class="field">
          <div class="label">Event Date</div>
          <div class="value">${formatDate(event_date)}</div>
        </div>
        <div class="field">
          <div class="label">Event Location</div>
          <div class="value">${escapeHtml(location) || 'Not specified'}</div>
        </div>
        <div class="field">
          <div class="label">Budget Range</div>
          <div class="value">${budgetRanges[budget] || budget || 'Not specified'}</div>
        </div>
        ${
          message
            ? `
        <div class="field">
          <div class="label">Message</div>
          <div class="value message-box">${escapeHtml(message).replace(/\n/g, '<br>')}</div>
        </div>
        `
            : ''
        }
      </div>
      <div class="footer">
        <p>Reply directly to this client or contact them at ${escapeHtml(email)}</p>
      </div>
    </body>
    </html>
  `;

  const emailText = `
New Inquiry from Aarambh Productions Website
=============================================

Name: ${name}
Email: ${email}
Phone: ${phone}
Event Type: ${eventTypes[event_type] || event_type}
Event Date: ${formatDate(event_date)}
Location: ${location || 'Not specified'}
Budget: ${budgetRanges[budget] || budget || 'Not specified'}

Message:
${message || 'No message provided'}

---
Reply to this client at: ${email}
  `.trim();

  try {
    const { data, error } = await resend.emails.send({
      from: 'Aarambh Productions <noreply@aarambhproductions.com>',
      to: [adminEmail],
      reply_to: email,
      subject: `New Inquiry: ${name} - ${eventTypes[event_type] || event_type}`,
      html: emailHtml,
      text: emailText,
    });

    if (error) {
      console.error('Resend API error:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (error) {
    console.error('Email send error:', error);
    return res.status(500).json({ error: 'Failed to send inquiry' });
  }
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
