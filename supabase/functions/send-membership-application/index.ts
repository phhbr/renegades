import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { verifyRecaptcha } from "../_shared/recaptcha.ts";
import { PDFDocument } from "https://cdn.skypack.dev/pdf-lib"; // Deno compatible!

// If you need to support Unicode (non-latin, e.g., German umlauts), see notes further below for font embedding

const PDF_FORM_URL =
  "https://ftgcbmthbwwcumvqnuof.supabase.co/storage/v1/object/public/static//membership_form.pdf"; // publicly accessible PDF

export interface MembershipApplication {
  name: string;
  lastname: string;
  birthdate: string;
  birthplace: string;
  address: string;
  email: string;
  statuteAcceptance: boolean;
  recaptchaToken: string;
}

interface EmailData {
  application: MembershipApplication;
}

serve(async (req) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const { application } = await req.json() as EmailData;

    if (!application.recaptchaToken) {
      return new Response(
        JSON.stringify({ error: "Missing reCAPTCHA token" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const isValid = await verifyRecaptcha(application.recaptchaToken);
    if (!isValid) {
      return new Response(
        JSON.stringify({ error: "Invalid reCAPTCHA token" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const NOTIFICATION_EMAILS = Deno.env.get("NOTIFICATION_EMAILS");
    if (!RESEND_API_KEY || !NOTIFICATION_EMAILS) {
      throw new Error("Missing required environment variables");
    }
    const notificationEmails = NOTIFICATION_EMAILS.split(",").map((email) =>
      email.trim()
    );

    // === Download the blank PDF form ===
    const formPdfRes = await fetch(PDF_FORM_URL);
    if (!formPdfRes.ok) throw new Error("Failed to fetch PDF form template");
    const formPdfBytes = new Uint8Array(await formPdfRes.arrayBuffer());

    // === Fill PDF form fields using pdf-lib ===
    const filledPdfBytes = await fillMembershipPdfForm(
      formPdfBytes,
      application,
    ).catch((err) => {
      console.error("Error filling PDF form:", err);
      throw err; // re-throw to catch above
    });

    const base64Pdf = btoa(String.fromCharCode(...filledPdfBytes));

    // === Send the email with the filled PDF as attachment ===
    const emailPromises = notificationEmails.map(async (to) => {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "info@nuernberg-renegades.de",
          to,
          subject:
            `New Membership Application - ${application.name} ${application.lastname}`,
          html: `
            <h2>New Membership Application</h2>
            <p><strong>Name:</strong> ${application.name} ${application.lastname}</p>
            <p><strong>Email:</strong> ${application.email}</p>
            <p><strong>Birth Date:</strong> ${application.birthdate}</p>
            <p><strong>Birth Place:</strong> ${application.birthplace}</p>
            <p><strong>Address:</strong> ${
            application.address.replace(/\n/g, "<br>")
          }</p>
            <p><strong>Statute Acceptance:</strong> ${
            application.statuteAcceptance ? "Yes" : "No"
          }</p>
            <hr>
            <p>PDF is attached.</p>
          `,
          attachments: [
            {
              filename:
                `membership-application-${application.lastname}-${application.name}.pdf`,
              content: base64Pdf,
              content_type: "application/pdf",
            },
          ],
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(`Failed to send email to ${to}: ${data.message}`);
      }
      return data;
    });

    await Promise.all(emailPromises);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error in membership function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});

/**
 * Fills the pre-generated PDF form fields using pdf-lib
 */
async function fillMembershipPdfForm(
  formPdfBytes: Uint8Array,
  application: MembershipApplication,
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(formPdfBytes);

  // Access the PDF form
  const form = pdfDoc.getForm();

  // Fill fields by their exact name as defined in the PDF editor!
  form.getTextField("name").setText(application.name);
  form.getTextField("lastname").setText(application.lastname);
  form.getTextField("birthdate").setText(application.birthdate);
  form.getTextField("birthplace").setText(application.birthplace);
  form.getTextField("address").setText(application.address);
  form.getTextField("email").setText(application.email);
  form.getCheckBox("statuteAcceptance")
    [application.statuteAcceptance ? "check" : "uncheck"]();

  // Optionally, flatten to make fields un-editable:
  form.flatten();

  return await pdfDoc.save();
}
