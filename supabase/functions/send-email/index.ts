
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

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
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    // Parse the request body
    let reqBody;
    try {
      reqBody = await req.json();
    } catch (parseError) {
      console.error("Error parsing request body:", parseError);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid request body format"
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }

    const { to, subject, text, html, from, smtp } = reqBody as EmailRequest;
    
    if (!to || !subject || !smtp) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Missing required parameters: to, subject, or smtp configuration",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }
    
    console.log(`Attempting to send email to ${to} via ${smtp.host}:${smtp.port}`);
    
    try {
      const client = new SMTPClient({
        connection: {
          hostname: smtp.host,
          port: smtp.port,
          tls: smtp.secure,
          auth: {
            username: smtp.auth.user,
            password: smtp.auth.pass,
          },
        },
      });

      const fromEmail = from || smtp.auth.user;
      
      await client.send({
        from: fromEmail,
        to: to,
        subject: subject,
        content: html || text || "This is a test email",
        html: html || undefined,
      });

      await client.close();
      
      console.log("Email sent successfully");

      return new Response(
        JSON.stringify({ success: true, message: "Email sent successfully" }),
        {
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    } catch (smtpError) {
      console.error("SMTP Error:", smtpError);
      return new Response(
        JSON.stringify({
          success: false,
          message: `SMTP Error: ${smtpError.message || "Failed to send email"}`,
          error: smtpError.stack || String(smtpError),
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        }
      );
    }
  } catch (error) {
    console.error("General error sending email:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "Failed to send email",
        error: error.stack || String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});
