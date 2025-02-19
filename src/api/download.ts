import { supabase } from '../lib/supabase';

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return new Response('Invalid token', { status: 400 });
  }

  try {
    // Get the download record and check if it's unused
    const { data: download, error: fetchError } = await supabase
      .from('downloads')
      .select('*')
      .eq('token', token)
      .eq('used', false)
      .single();

    if (fetchError || !download) {
      return new Response('Invalid or expired download link', { status: 400 });
    }

    // Mark the download as used
    const { error: updateError } = await supabase
      .from('downloads')
      .update({ used: true })
      .eq('token', token);

    if (updateError) {
      throw updateError;
    }

    // Serve the PDF file
    const response = await fetch('/assets/Finziai-Habbits-to-save-money-effortlessly.pdf');
    const pdfBlob = await response.blob();

    return new Response(pdfBlob, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Finziai-Habbits-to-save-money-effortlessly.pdf"'
      }
    });
  } catch (error) {
    console.error('Download error:', error);
    return new Response('An error occurred during download', { status: 500 });
  }
}