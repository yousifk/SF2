import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const filesToSend: { [key: string]: File } = {};

    console.log('Starting form submission...');

    // جمع الملفات للإرسال المباشر
    for (const [key, value] of formData.entries()) {
      if (['139', '140', '141'].includes(key) && value && typeof value === 'object' && 'arrayBuffer' in value) {
        const file = value as File;
        console.log(`Processing file for key ${key}: ${file.name}`);
        
        // إنشاء اسم فريد للملف
        const fileExtension = file.name.split('.').pop() || 'jpg';
        const fileName = `${randomUUID()}.${fileExtension}`;
        
        // إنشاء ملف جديد بالاسم الجديد
        const bytes = await file.arrayBuffer();
        const newFile = new File([bytes], fileName, { type: file.type });
        filesToSend[key] = newFile;
      }
    }

    // إعداد البيانات للإرسال إلى API الخارجي
    const dataToSend = new FormData();
    
    // إضافة البيانات النصية
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string' && ['136', '137', '138'].includes(key)) {
        console.log(`Adding text field ${key}: ${value}`);
        dataToSend.append(key, value);
      }
    }

    // إضافة الملفات مباشرة
    Object.entries(filesToSend).forEach(([key, file]) => {
      console.log(`Adding file for key ${key}: ${file.name}`);
      dataToSend.append(key, file);
    });

    console.log('Sending data to external API...');

    // إرسال البيانات إلى الـ API الخارجي
    const response = await fetch('https://press.fayadev.net/api/contact/new-message/19', {
      method: 'POST',
      body: dataToSend,
    });

    console.log(`API response status: ${response.status}`);

    if (response.ok) {
      const result = await response.json().catch(() => ({ success: true }));
      console.log('Form submitted successfully:', result);
      return NextResponse.json({ 
        success: true, 
        data: result,
        message: 'Form submitted successfully'
      });
    } else {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('API error:', errorText);
      return NextResponse.json(
        { success: false, error: errorText, message: 'External API error' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Error submitting form:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}