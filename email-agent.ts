import { Agent, functionTool } from 'openai-agents';
import sgMail from '@sendgrid/mail';

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

const sendEmailTool = functionTool({
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
        description: 'The HTML body content of the email'
      }
    },
    required: ['subject', 'htmlBody']
  }
}, async ({ subject, htmlBody }: { subject: string; htmlBody: string }) => {
  const msg = {
    to: 'ed.donner@gmail.com', // put your recipient here
    from: 'ed@edwarddonner.com', // put your verified sender here
    subject: subject,
    html: htmlBody,
  };

  try {
    const response = await sgMail.send(msg);
    console.log('Email response', response[0].statusCode);
    return { status: "success" };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
});

const INSTRUCTIONS = `You are able to send a nicely formatted HTML email based on a detailed report. You will be provided with a detailed report. You should use your tool to send one email, providing the report converted into clean, well presented HTML with an appropriate subject line.`;

export const emailAgent = new Agent({
  name: "Email agent",
  instructions: INSTRUCTIONS,
  tools: [sendEmailTool],
  model: "gpt-4o-mini",
});
