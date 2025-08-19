// src/app/auth/confirm/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    console.log('=== Email Confirmation Processing ===');
    
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    console.log('Received confirmation request:', { token: token?.slice(0, 8) + '...', email });

    if (!token) {
      console.error('❌ Missing Token parameter');
      return redirectToError('Missing verification token');
    }

    // Find Token record
    console.log('🔍 Searching for Token record...');
    const { data: tokenRecord, error: tokenError } = await supabaseAdmin
      .from('email_confirmations')
      .select('*')
      .eq('token', token)
      .eq('token_type', 'email_verification')
      .single();

    if (tokenError) {
      console.error('❌ Token query failed:', tokenError);
      return redirectToError(`Token query failed: ${tokenError.message}`);
    }

    if (!tokenRecord) {
      console.error('❌ Token does not exist');
      return redirectToError('Invalid verification token');
    }

    console.log('✅ Found Token record');

    // Check if Token has already been used
    if (tokenRecord.used_at) {
      console.log('⚠️ Token has already been used, checking user verification status...');
      
      // Check user's email verification status
      const { data: userProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('email_verified')
        .eq('id', tokenRecord.user_id)
        .single();

      if (userProfile?.email_verified) {
        console.log('✅ User email is verified, redirecting to success page');
        return redirectToSuccess('Your email has already been confirmed!');
      } else {
        console.log('❌ Token used but user not verified');
        return redirectToError('Verification token has been used, but verification status is abnormal');
      }
    }

    // Check if Token has expired
    const now = new Date();
    const expiresAt = new Date(tokenRecord.expires_at);
    
    if (now > expiresAt) {
      console.error('❌ Token has expired');
      
      // Delete expired Token
      await supabaseAdmin
        .from('email_confirmations')
        .delete()
        .eq('id', tokenRecord.id);
      
      return redirectToError('Verification token has expired, please register again');
    }

    console.log('✅ Token is valid and not expired');

    // Start updating user email verification status
    console.log('📧 Starting to update user email verification status...');
    
    try {
      // 1. Update email confirmation status in auth.users table
      const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
        tokenRecord.user_id,
        { email_confirm: true }
      );

      if (authUpdateError) {
        console.error('❌ Failed to update auth user status:', authUpdateError);
        return redirectToError('Error occurred during confirmation process');
      }

      // 2. Update email verification status in user_profiles table
      const { error: profileUpdateError } = await supabaseAdmin
        .from('user_profiles')
        .update({ 
          email_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', tokenRecord.user_id);

      if (profileUpdateError) {
        console.error('❌ Failed to update user profile:', profileUpdateError);
        return redirectToError('Error occurred during confirmation process');
      }

      // 3. Mark Token as used
      const { error: tokenUpdateError } = await supabaseAdmin
        .from('email_confirmations')
        .update({ 
          used_at: new Date().toISOString()
        })
        .eq('id', tokenRecord.id);

      if (tokenUpdateError) {
        console.error('⚠️ Failed to update Token status:', tokenUpdateError);
        // This error doesn't prevent confirmation process, just log it
      }

      console.log('✅ Email confirmation successful!');

      // Verify final status
      const { data: finalCheck } = await supabaseAdmin
        .from('user_profiles')
        .select('email_verified')
        .eq('id', tokenRecord.user_id)
        .single();

      if (!finalCheck?.email_verified) {
        console.error('❌ Final verification failed, email verification status is still false');
        return redirectToError('Confirmation process may not be complete, please contact support team');
      }

      console.log('✅ Final verification successful, email confirmed');

      // Optional: Send welcome email
      try {
        const { emailService } = await import('@/lib/emailService');
        const username = tokenRecord.email.split('@')[0];
        
        // Get user information
        const { data: userProfile } = await supabaseAdmin
          .from('user_profiles')
          .select('user_type')
          .eq('id', tokenRecord.user_id)
          .single();

        await emailService.sendWelcomeEmail(
          tokenRecord.email, 
          username, 
          userProfile?.user_type || 'free'
        );
        console.log('✅ Welcome email sent');
      } catch (emailError) {
        console.error('⚠️ Failed to send welcome email:', emailError);
        // Don't prevent confirmation process
      }

      // Redirect to success page
      return redirectToSuccess('Email confirmation successful! Welcome to LifeX!');

    } catch (updateError) {
      console.error('💥 Exception during update process:', updateError);
      return redirectToError('System error occurred during confirmation process');
    }

  } catch (error) {
    console.error('💥 Exception during email confirmation process:', error);
    return redirectToError('Error occurred during confirmation process');
  }
}

function redirectToError(message: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const errorUrl = `${baseUrl}/auth/confirm-result?status=error&message=${encodeURIComponent(message)}&timestamp=${Date.now()}`;
  
  console.log('🔄 Redirecting to error page:', errorUrl);
  return NextResponse.redirect(errorUrl);
}

function redirectToSuccess(message: string = 'Email confirmation successful! Welcome to LifeX!') {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const successUrl = `${baseUrl}/auth/confirm-result?status=success&message=${encodeURIComponent(message)}&timestamp=${Date.now()}`;
  
  console.log('🔄 Redirecting to success page:', successUrl);
  return NextResponse.redirect(successUrl);
}