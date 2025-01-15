import { corsHeaders } from '../_shared/cors.ts'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

interface EmailData {
  message: ContactMessage;
}

serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      })
    }
    const { message } = await req.json() as EmailData;

    // Get environment variables
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const NOTIFICATION_EMAILS = Deno.env.get("NOTIFICATION_EMAILS");

    if (!RESEND_API_KEY || !NOTIFICATION_EMAILS) {
      throw new Error("Missing required environment variables");
    }

    // Parse notification emails (comma-separated list)
    const notificationEmails = NOTIFICATION_EMAILS.split(",").map((email) =>
      email.trim()
    );

    // Send email to each recipient
    const emailPromises = notificationEmails.map(async (to) => {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "delivered@resend.dev",
          to,
          subject: `New Contact Form Submission: ${message.subject}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>From:</strong> ${message.name} (${message.email})</p>
            <p><strong>Subject:</strong> ${message.subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message.message.replace(/\n/g, "<br>")}</p>
          `,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(`Failed to send email to ${to}: ${data.message}`);
      }

      return data;
    });

    // Wait for all emails to be sent
    await Promise.all(emailPromises);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as any)?.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
