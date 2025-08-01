import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { verifyRecaptcha } from "../_shared/recaptcha.ts";
import { PDFDocument } from "https://cdn.skypack.dev/pdf-lib"; // Deno compatible!

// If you need to support Unicode (non-latin, e.g., German umlauts), see notes further below for font embedding

const PDF_FORM_URL =
  "https://ftgcbmthbwwcumvqnuof.supabase.co/storage/v1/object/public/static//Mitgliedsantrag_25-08.pdf"; // publicly accessible PDF

export interface MembershipApplication {
  membership_active: boolean;
  membership_support: boolean;
  name: string;
  firstname: string;
  birthday: string;
  birthplace: string;
  profession: string;
  nationality: string;
  street: string;
  plz_town: string;
  tel: string;
  fax: string;
  mobile: string;
  email: string;
  joindate_month: string;
  joindate_year: string;
  sepa_account_holder_name: string;
  sepa_account_holder_firstname: string;
  sepa_iban: string;
  sepa_bic: string;
  sepa_bank: string;
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

    // Convert Uint8Array to base64 in chunks to avoid call stack size exceeded
    const chunks = [];
    const chunkSize = 0x8000; // 32K chunks
    for (let i = 0; i < filledPdfBytes.length; i += chunkSize) {
      const chunk = filledPdfBytes.subarray(i, i + chunkSize);
      chunks.push(String.fromCharCode(...Array.from(chunk)));
    }
    const base64Pdf = btoa(chunks.join(''));

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
            `New Membership Application - ${application.name} ${application.firstname}`,
          html: `
            <h2>New Membership Application</h2>
            <p><strong>Membership Type:</strong> ${application.membership_active ? 'Active' : ''} ${application.membership_support ? 'Supporting' : ''}</p>
            <p><strong>Name:</strong> ${application.name} ${application.firstname}</p>
            <p><strong>Birth Date:</strong> ${application.birthday}</p>
            <p><strong>Birth Place:</strong> ${application.birthplace}</p>
            <p><strong>Profession:</strong> ${application.profession}</p>
            <p><strong>Nationality:</strong> ${application.nationality}</p>
            <p><strong>Address:</strong> ${application.street}, ${application.plz_town}</p>
            <p><strong>Contact:</strong><br>
               Tel: ${application.tel}<br>
               Fax: ${application.fax}<br>
               Mobile: ${application.mobile}<br>
               Email: ${application.email}</p>
            <p><strong>Join Date:</strong> ${application.joindate_month}/${application.joindate_year}</p>
            <p><strong>SEPA Information:</strong><br>
               Account Holder: ${application.sepa_account_holder_name} ${application.sepa_account_holder_firstname}<br>
               IBAN: ${application.sepa_iban}<br>
               BIC: ${application.sepa_bic}<br>
               Bank: ${application.sepa_bank}</p>
            <hr>
            <p>PDF is attached.</p>
          `,
          attachments: [
            {
              filename:
                `membership-application-${application.name}-${application.firstname}.pdf`,
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
  if (application.membership_active) {
    form.getTextField("membership_active").setText('X');
  } 
  if (application.membership_support) {
    form.getTextField("membership_support").setText();
  } 
  form.getTextField("name").setText(application.name);
  form.getTextField("firstname").setText(application.firstname);
  // Convert birthday from ISO (YYYY-MM-DD) to German format (DD.MM.YYYY)
  const [year, month, day] = application.birthday.split('-');
  form.getTextField("birthday").setText(`${day}.${month}.${year}`);
  form.getTextField("birthplace").setText(application.birthplace);
  form.getTextField("profession").setText(application.profession);
  form.getTextField("nationality").setText(application.nationality);
  form.getTextField("street").setText(application.street);
  form.getTextField("plz_town").setText(application.plz_town);
  form.getTextField("tel").setText(application.tel);
  form.getTextField("fax").setText(application.fax);
  form.getTextField("mobile").setText(application.mobile);
  form.getTextField("email").setText(application.email);
  // Convert month number to German month name
  const germanMonths: { [key: string]: string } = {
    "01": "Januar",
    "02": "Februar",
    "03": "März",
    "04": "April",
    "05": "Mai",
    "06": "Juni",
    "07": "Juli",
    "08": "August",
    "09": "September",
    "10": "Oktober",
    "11": "November",
    "12": "Dezember"
  };
  form.getTextField("joindate_month").setText(germanMonths[application.joindate_month] || "");
  
  // Take only last 2 digits of the year
  const yearLastTwo = application.joindate_year.toString().slice(-2);
  form.getTextField("joindate_year").setText(yearLastTwo);
  
  form.getTextField("sepa_account_holder_name").setText(application.sepa_account_holder_name);
  form.getTextField("sepa_account_holder_firstname").setText(application.sepa_account_holder_firstname);
  form.getTextField("sepa_iban").setText(application.sepa_iban);
  form.getTextField("sepa_bic").setText(application.sepa_bic);
  form.getTextField("sepa_bank").setText(application.sepa_bank);

  // Optionally, flatten to make fields un-editable:
  form.flatten();

  return await pdfDoc.save();
}
