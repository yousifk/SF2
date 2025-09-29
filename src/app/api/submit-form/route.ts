import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // إرسال البيانات إلى الـ API الخارجي
    const response = await fetch('https://press.fayadev.net/api/contact/new-message/19', {
      method: 'POST',
      body: formData,
      headers: {
        // إضافة أي headers مطلوبة
      },
    });

    if (response.ok) {
      const result = await response.json().catch(() => ({ success: true }));
      return NextResponse.json({ success: true, data: result });
    } else {
      const errorText = await response.text().catch(() => 'Unknown error');
      return NextResponse.json(
        { success: false, error: errorText },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}