import { corsHeaders } from '../_shared/cors.ts'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { verifyRecaptcha } from "../_shared/recaptcha.ts";

export interface TryoutRequest {
  name: string;
  email: string;
  phone: string;
  age: string;
  experience: string;
  message: string;
  recaptchaToken: string;
}

interface EmailData {
  request: TryoutRequest;
}

serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      })
    }
    const { request } = await req.json() as EmailData;

    if (!request.recaptchaToken) {
      return new Response(
        JSON.stringify({ error: "Missing reCAPTCHA token" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Verify reCAPTCHA token
    const isValid = await verifyRecaptcha(request.recaptchaToken);
    if (!isValid) {
      return new Response(
        JSON.stringify({ error: "Invalid reCAPTCHA token" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

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
          subject: `New Tryout Request`,
          html: `
            <h2>New Tryout Request</h2>
            <p><strong>From:</strong> ${request.name} (${request.email})</p>
            <p><strong>Phone:</strong> ${request.phone}</p>
            <p><strong>Age:</strong> ${request.age}</p>
            <p><strong>Experience:</strong> ${request.experience}</p>
            <p><strong>Message:</strong></p>
            <p>${request.message.replace(/\n/g, "<br>")}</p>
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