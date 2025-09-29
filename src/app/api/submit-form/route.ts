import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const uploadedFiles: { [key: string]: string } = {};

    // إنشاء مجلد للصور إذا لم يكن موجود
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // رفع كل صورة وحفظها محلياً
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && ['139', '140', '141'].includes(key)) {
        const file = value as File;
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // إنشاء اسم فريد للملف
        const fileExtension = file.name.split('.').pop() || 'jpg';
        const fileName = `${crypto.randomUUID()}.${fileExtension}`;
        const filePath = path.join(uploadsDir, fileName);

        // حفظ الملف
        await writeFile(filePath, buffer);
        
        // حفظ رابط الملف
        const fileUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/uploads/${fileName}`;
        uploadedFiles[key] = fileUrl;
      }
    }

    // إعداد البيانات للإرسال إلى API الخارجي
    const dataToSend = new FormData();
    
    // إضافة البيانات النصية
    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string' && ['136', '137', '138'].includes(key)) {
        dataToSend.append(key, value);
      }
    }

    // إضافة روابط الصور بدلاً من الملفات
    Object.entries(uploadedFiles).forEach(([key, url]) => {
      dataToSend.append(key, url);
    });

    // إرسال البيانات إلى الـ API الخارجي
    const response = await fetch('https://press.fayadev.net/api/contact/new-message/19', {
      method: 'POST',
      body: dataToSend,
    });

    if (response.ok) {
      const result = await response.json().catch(() => ({ success: true }));
      return NextResponse.json({ 
        success: true, 
        data: result,
        uploadedFiles: uploadedFiles
      });
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