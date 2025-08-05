import {resend} from '../utils/resendClient.js';

export const sendWelcomeEmail = async (email, firstName, defaultPassword) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Prime Choice Care <onboarding@resend.dev>',
      to: email,
      subject: 'Welcome to Prime Choice Care',
      html: `
        <h2>Hello ${firstName},</h2>
        <p>Welcome! Here are your login details:</p>
        <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Password:</strong> ${defaultPassword}</li>
        </ul>
        <p>Please log in and change your password as soon as possible.</p>
      `,
    });

    if (error) {
      console.error('Error sending email:', error);
    }

    return data;
  } catch (err) {
    console.error('Email sending failed:', err);
  }
};
