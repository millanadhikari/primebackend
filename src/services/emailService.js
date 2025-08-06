import resend from '../utils/resendClient.js';

export const sendWelcomeEmail = async (email, firstName, defaultPassword) => {
    try {
        const { data, error } = await resend.emails.send({
            from: 'noreply@primechoicecare.com.au',
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


export async function getAssignedClientEmailTemplate({ staffEmail, staffName, clientName, clientEmail }) {
    return await resend.emails.send({
        from: "noreply@primechoicecare.com.au", // Or your verified sender
        to: staffEmail,
        subject: `New Client Assigned: ${clientName}`,
        html: `
      <h2>Hello ${staffName},</h2>
      <p>You have been assigned a new client:</p>
      <ul>
        <li><strong>Name:</strong> ${clientName}</li>
        <li><strong>Email:</strong> ${clientEmail}</li>
      </ul>
      <p>Please login to CRM to view the full details.</p>
      <br/>
      <p>Regards,</p>
      <p>Prime Choice Care Team</p>
    `,
    });
}
