
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  smtp: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    }
  }
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
    
    const { to, subject, text, html, from, smtp } = emailData;

    if (!to || !subject || !smtp) {
      throw new Error("Missing required fields: to, subject, or smtp configuration");
    }

    console.log(`Attempting to send email to ${to} using SMTP server ${smtp.host}:${smtp.port}`);

    try {
      const client = new SmtpClient();

      await client.connect({
        hostname: smtp.host,
        port: smtp.port,
        username: smtp.auth.user,
        password: smtp.auth.pass,
        tls: smtp.secure,
      });

      const senderEmail = from || smtp.auth.user;
      await client.send({
        from: senderEmail,
        to: to,
        subject: subject,
        content: html || text || "Email sent from PropAI",
      });

      await client.close();

      console.log(`Email sent successfully to ${to}`);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Email sent successfully to ${to}` 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } catch (smtpError) {
      console.error("SMTP error:", smtpError);
      throw new Error(`SMTP error: ${smtpError instanceof Error ? smtpError.message : String(smtpError)}`);
    }
  } catch (error) {
    console.error("Error sending email:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
