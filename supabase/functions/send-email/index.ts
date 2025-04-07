
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.13.0/mod.ts";

// Define CORS headers to allow cross-origin requests
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
  messageId?: string;
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

// Helper function to send email via SMTP
async function sendEmailViaSMTP(options: EmailRequest): Promise<{ success: boolean; message: string }> {
  const { to, subject, text, html, from, smtp } = options;
  const senderEmail = from || smtp.auth.user;

  console.log(`Attempting to send email to ${to} using SMTP server ${smtp.host}:${smtp.port}`);
  
  try {
    // Create SMTP client with latest compatible library
    const client = new SmtpClient();

    // Configure connection with timeout
    const connectConfig = {
      hostname: smtp.host,
      port: smtp.port,
      username: smtp.auth.user,
      password: smtp.auth.pass,
      tls: smtp.secure,
    };

    console.log(`Connecting to SMTP server with config:`, {
      hostname: connectConfig.hostname,
      port: connectConfig.port,
      username: connectConfig.username,
      tls: connectConfig.tls
    });

    // Set connection timeout
    const connectPromise = client.connectTLS(connectConfig);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("SMTP connection timed out after 8 seconds")), 8000);
    });

    // Connect with timeout
    await Promise.race([connectPromise, timeoutPromise]);
    
    // Prepare email content
    const mailOptions = {
      from: senderEmail,
      to: to,
      subject: subject,
      content: html || text || "Email sent from PropAI",
      html: !!html,
    };

    console.log("Sending email with options:", {
      from: mailOptions.from,
      to: mailOptions.to,
      subject: mailOptions.subject,
      html: mailOptions.html
    });

    // Send with timeout
    const sendPromise = client.send(mailOptions);
    const sendTimeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("SMTP sending timed out after 10 seconds")), 10000);
    });

    await Promise.race([sendPromise, sendTimeoutPromise]);
    
    // Close connection
    await client.close();
    
    console.log(`Email sent successfully to ${to}`);
    return {
      success: true,
      message: `Email sent successfully to ${to}`
    };
  } catch (error) {
    console.error("Error in SMTP sending:", error);
    
    // Provide detailed error information
    let errorMessage = error instanceof Error ? error.message : String(error);
    let errorDetails = "";
    
    if (errorMessage.includes("connect")) {
      errorDetails = "Could not connect to SMTP server. Check your host and port settings.";
    } else if (errorMessage.includes("auth") || errorMessage.includes("535")) {
      errorDetails = "Authentication failed. Check your username and password.";
    } else if (errorMessage.includes("timeout")) {
      errorDetails = "Connection timed out. The server may be unreachable.";
    } else if (errorMessage.includes("certificate") || errorMessage.includes("TLS")) {
      errorDetails = "TLS/SSL error. Try changing the 'secure' setting.";
    }
    
    return {
      success: false,
      message: `Failed to send email: ${errorMessage}${errorDetails ? ` (${errorDetails})` : ''}`
    };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("Email request received");
    
    // Parse the request body with improved error handling
    const reqBody = await req.text();
    console.log("Request body:", reqBody);
    
    // Parse JSON with detailed error handling
    let emailData: EmailRequest;
    try {
      emailData = JSON.parse(reqBody);
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Invalid JSON: " + (parseError instanceof Error ? parseError.message : String(parseError)),
          requestBody: reqBody
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
    
    // Validate required fields with specific error messages
    if (!emailData.to) {
      throw new Error("Missing required field: 'to' recipient email address");
    }
    if (!emailData.subject) {
      throw new Error("Missing required field: 'subject'");
    }
    if (!emailData.smtp) {
      throw new Error("Missing required field: 'smtp' configuration");
    }
    if (!emailData.smtp.host) {
      throw new Error("Missing required field: 'smtp.host'");
    }
    if (!emailData.smtp.port) {
      throw new Error("Missing required field: 'smtp.port'");
    }
    if (!emailData.smtp.auth || !emailData.smtp.auth.user || !emailData.smtp.auth.pass) {
      throw new Error("Missing required SMTP authentication credentials");
    }

    console.log(`Processing email to ${emailData.to} via ${emailData.smtp.host}:${emailData.smtp.port}`);
    
    // Send the email
    const result = await sendEmailViaSMTP(emailData);
    
    if (!result.success) {
      console.error("Failed to send email:", result.message);
      return new Response(
        JSON.stringify({ success: false, message: result.message }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }
    
    console.log("Email sending result:", result);
    
    // Return success response
    return new Response(
      JSON.stringify({ success: true, message: result.message }),
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
        message: error instanceof Error ? error.message : "Unknown error occurred",
        error: error instanceof Error ? error.stack : null,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
