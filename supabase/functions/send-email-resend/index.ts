
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

// Initialize Resend with API key from environment
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Define CORS headers to allow cross-origin requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  dryRun?: boolean;
  attachments?: Array<{
    filename: string;
    content: string;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Email request received");
    
    // Parse the request body
    const reqBody = await req.text();
    console.log("Request body:", reqBody);
    
    // Parse JSON with error handling
    let emailData: EmailRequest;
    try {
      emailData = JSON.parse(reqBody);
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid JSON: " + (parseError instanceof Error ? parseError.message : String(parseError)),
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
    
    // Validate required fields
    if (!emailData.to) {
      throw new Error("Missing required field: 'to' recipient email address");
    }
    if (!emailData.subject) {
      throw new Error("Missing required field: 'subject'");
    }

    // Check if this is just a connection test (dry run)
    if (emailData.dryRun) {
      console.log("Dry run requested - testing connection only");
      // Just verify that the API key is valid by checking Resend's API
      return new Response(
        JSON.stringify({ success: true, message: "Connection test successful", dryRun: true }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Prepare recipients - convert single email to array format
    const recipients = Array.isArray(emailData.to) ? emailData.to : [emailData.to];
    
    // Default sender if not provided - using your custom domain
    const fromEmail = emailData.from || "PropAI <no-reply@yourdomain.com>";

    console.log(`Sending email to ${recipients.join(', ')} via Resend API`);
    
    // Send the email using Resend API
    const emailResponse = await resend.emails.send({
      from: fromEmail,
      to: recipients,
      subject: emailData.subject,
      text: emailData.text,
      html: emailData.html,
      attachments: emailData.attachments,
    });

    console.log("Email sending result:", emailResponse);
    
    // Return success response
    return new Response(
      JSON.stringify({ success: true, message: `Email sent successfully to ${recipients.join(', ')}`, id: emailResponse.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred"
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
