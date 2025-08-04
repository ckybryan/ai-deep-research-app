import sgMail from '@sendgrid/mail';
import { Agent } from './agents';

// Configure SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const sendEmailTool = {
  type: 'function' as const,
  function: {
    name: 'send_email',
    description: 'Send an email with the given subject and HTML body',
    parameters: {
      type: 'object',
      properties: {
        subject: {
          type: 'string',
          description: 'The email subject line'
        },
        htmlBody: {
          type: 'string',
          description: 'The HTML content of the email'
        }
      },
      required: ['subject', 'htmlBody']
    }
  }
};

export async function sendEmail(subject: string, htmlBody: string): Promise<{ status: string }> {
  try {
    const fromEmail = process.env.FROM_EMAIL || 'noreply@example.com'; // put your verified sender here
    const toEmail = process.env.TO_EMAIL || 'user@example.com'; // put your recipient here
    
    const msg = {
      to: toEmail,
      from: fromEmail,
      subject: subject,
      html: htmlBody,
    };

    await sgMail.send(msg);
    console.log('Email sent successfully');
    return { status: 'success' };
  } catch (error) {
    console.error('Email sending error:', error);
    return { status: 'error' };
  }
}

const INSTRUCTIONS = `You are able to send a nicely formatted HTML email based on a detailed report. ` +
  `You will be provided with a detailed report. You should use your tool to send one email, providing the ` +
  `report converted into clean, well presented HTML with an appropriate subject line.`;

export const emailAgent = new Agent({
  name: 'Email agent',
  instructions: INSTRUCTIONS,
  tools: [sendEmailTool],
  model: 'gpt-4o-mini',
});
