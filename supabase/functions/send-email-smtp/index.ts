
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.29.0";

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
  accountId?: string;
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
    console.log("SMTP Email request received");
    
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
    if (!emailData.accountId) {
      throw new Error("Missing required field: 'accountId' to identify which email account to use");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get the email account details from the database
    const { data: account, error: accountError } = await supabase
      .from("email_accounts")
      .select("*")
      .eq("id", emailData.accountId)
      .single();
    
    if (accountError || !account) {
      console.error("Error fetching email account:", accountError);
      throw new Error(`Email account with ID ${emailData.accountId} not found or inaccessible`);
    }
    
    console.log(`Using email account: ${account.email} (${account.smtp_host}:${account.smtp_port})`);

    // Check if this is just a connection test (dry run)
    if (emailData.dryRun) {
      console.log("Dry run requested - testing SMTP connection only");
      
      try {
        // Create SMTP client for testing connection
        const client = new SMTPClient({
          connection: {
            hostname: account.smtp_host,
            port: account.smtp_port,
            tls: account.smtp_secure,
            auth: {
              username: account.smtp_username,
              password: account.smtp_password,
            },
          },
        });

        // Test connection by connecting and closing
        await client.connect();
        await client.close();
        
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: `SMTP connection test successful to ${account.smtp_host}:${account.smtp_port}`, 
            dryRun: true 
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 200,
          }
        );
      } catch (connError) {
        console.error("SMTP connection test failed:", connError);
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `SMTP connection test failed: ${connError instanceof Error ? connError.message : String(connError)}`,
            dryRun: true 
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
      }
    }

    // Prepare recipients - convert single email to array format
    const recipients = Array.isArray(emailData.to) ? emailData.to : [emailData.to];
    
    // Setup the SMTP client using account credentials
    const client = new SMTPClient({
      connection: {
        hostname: account.smtp_host,
        port: account.smtp_port,
        tls: account.smtp_secure,
        auth: {
          username: account.smtp_username,
          password: account.smtp_password,
        },
      },
    });

    // Set the from name and email
    const fromEmail = emailData.from || 
                     (account.display_name 
                       ? `${account.display_name} <${account.email}>` 
                       : account.email);

    console.log(`Sending email to ${recipients.join(', ')} via SMTP`);
    
    // Connect to the SMTP server
    await client.connect();
    
    // Send the email
    const sendResult = await client.send({
      from: fromEmail,
      to: recipients.join(", "),
      subject: emailData.subject,
      content: emailData.html || emailData.text || "",
      html: emailData.html ? true : false,
    });
    
    // Close the connection
    await client.close();

    console.log("Email sent successfully:", sendResult);
    
    // Log the email in the database
    const { error: logError } = await supabase
      .from("email_logs")
      .insert({
        email_account_id: account.id,
        recipient: recipients.join(", "),
        subject: emailData.subject,
        status: "sent",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    
    if (logError) {
      console.warn("Failed to log email send:", logError);
    }
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Email sent successfully to ${recipients.join(', ')}`, 
        id: sendResult?.id || new Date().getTime().toString()
      }),
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
