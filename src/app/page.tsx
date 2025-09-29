'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface FormData {
  136: string; // الاسم
  137: string; // التسلسل
  138: string; // المحافظة
  139: File | null; // الصورة 1
  140: File | null; // الصورة 2
  141: File | null; // الصورة 3
}

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    136: '',
    137: '',
    138: '',
    139: null,
    140: null,
    141: null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // لحل مشكلة hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // عدم عرض النموذج حتى يتم التحميل
  if (!mounted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">جاري التحميل...</h2>
          <p className="text-gray-600">يتم إعداد النموذج</p>
          <div className="mt-4 flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce-delay-1"></div>
            <div className="w-2 h-2 bg-white/80 rounded-full animate-bounce-delay-2"></div>
          </div>
        </div>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const key = parseInt(name) as keyof FormData;
    setFormData(prev => ({ ...prev, [key]: value }));
    
    // إزالة الخطأ عند التعديل
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    const key = parseInt(name) as keyof FormData;
    if (files && files[0]) {
      setFormData(prev => ({ ...prev, [key]: files[0] }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData[136].trim()) {
      newErrors[136] = 'الاسم مطلوب';
    }
    if (!formData[137].trim()) {
      newErrors[137] = 'التسلسل مطلوب';
    }
    if (!formData[138].trim()) {
      newErrors[138] = 'المحافظة مطلوبة';
    }
    if (!formData[139]) {
      newErrors[139] = 'الصورة 1 مطلوبة';
    }
    if (!formData[140]) {
      newErrors[140] = 'الصورة 2 مطلوبة';
    }
    if (!formData[141]) {
      newErrors[141] = 'الصورة 3 مطلوبة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const formDataToSend = new FormData();

    // إضافة البيانات النصية
    Object.entries(formData).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        formDataToSend.append(key, value);
      }
    });

    // إضافة الملفات مع تحويل الاسم إلى GUID
    [139, 140, 141].forEach(id => {
      const file = formData[id as keyof FormData] as File | null;
      if (file) {
        const ext = file.name.split('.').pop() || '';
        const newName = crypto.randomUUID() + (ext ? '.' + ext : '');
        const newFile = new File([file], newName, { type: file.type });
        formDataToSend.append(id.toString(), newFile);
      }
    });

    try {
      console.log('إرسال البيانات عبر API route محلي...');
      
      const response = await fetch('/api/submit-form', {
        method: 'POST',
        body: formDataToSend,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // إظهار صفحة النجاح
        setIsSubmitted(true);
        console.log('الرد من الخادم:', result);
        
        // إعادة تعيين النموذج
        setFormData({
          136: '',
          137: '',
          138: '',
          139: null,
          140: null,
          141: null,
        });
        
        setErrors({});
      } else {
        const errorMessage = result.message || 'فشل في الإرسال';
        alert(`خطأ: ${errorMessage}`);
        console.error('خطأ في الإرسال:', result);
      }
    } catch (error) {
      console.error('خطأ في الإرسال:', error);
      alert('حدث خطأ أثناء إرسال الاستمارة. يرجى المحاولة مرة أخرى.');
    }
  };

  // صفحة النجاح
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="bg-white rounded-3xl p-8 shadow-xl">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">تم الأرسال بنجاح!</h2>
            <p className="text-gray-600 mb-8">شكراً لك على ملء الاستمارة.</p>
            <button
              onClick={() => {
                setIsSubmitted(false);
                window.location.reload();
              }}
              className="btn-primary w-full text-white py-3 px-6 rounded-2xl text-lg font-bold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-300 focus:ring-offset-2"
            >
              تم
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen py-12 bg-white" dir="rtl">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header المحسن */}
        <div className="text-center mb-12 fade-in">
          <div className="section-header p-8 rounded-2xl relative text-white">
            <div className="relative z-10">
              <div className="flex items-center justify-center mb-4">
                <h1 className="text-4xl font-bold">استمارة جمع معلومات المرشح لإنشاء الفيديو التعريفي</h1>
              </div>
              <p className="text-white/90 text-lg font-medium">يرجى تعبئة هذه الاستمارة بدقة حتى نتمكّن من إعداد فيديو تعريفي يعكس صورتكم ورسالتكم الانتخابية بشكل مهني. جميع المعلومات سرّية وتُستخدم فقط في إطار الحملة الانتخابية</p>
              <div className="mt-4 w-24 h-1 bg-white/30 mx-auto rounded-full"></div>
            </div>
          </div>
        </div>

        {/* شعار الإعمار والتنمية */}
        <div className="text-center mb-8 fade-in">
          <div className="w-40 h-40 bg-white rounded-full shadow-lg flex items-center justify-center mx-auto p-5">
            <Image 
              src="/logo.png" 
              alt="شعار الإعمار والتنمية" 
              width={160}
              height={160}
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Form المحسن */}
  <form onSubmit={handleSubmit} className="form-section bg-white overflow-hidden fade-in">
          
          {/* القسم الأول: البيانات الأساسية */}
          <div className="section-header text-white p-6 relative">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold">البيانات الأساسية</h2>
            </div>
          </div>
          <div className="p-8 space-y-6 bg-white">
            <div className="field-group">
              <label className="field-label">
                الاسم <span className="field-required">*</span>
              </label>
              <input
                type="text"
                name="136"
                value={formData[136]}
                onChange={handleInputChange}
                className={`ui-input w-full ${errors[136] ? 'error' : ''}`}
                placeholder="أدخل الاسم"
              />
              {errors[136] && <p className="error-message text-sm mt-2">{errors[136]}</p>}
            </div>

            <div className="field-group">
              <label className="field-label">
                التسلسل <span className="field-required">*</span>
              </label>
              <input
                type="text"
                name="137"
                value={formData[137]}
                onChange={handleInputChange}
                className={`ui-input w-full ${errors[137] ? 'error' : ''}`}
                placeholder="أدخل التسلسل"
              />
              {errors[137] && <p className="error-message text-sm mt-2">{errors[137]}</p>}
            </div>

            <div className="field-group">
              <label className="field-label">
                المحافظة <span className="field-required">*</span>
              </label>
              <input
                type="text"
                name="138"
                value={formData[138]}
                onChange={handleInputChange}
                className={`ui-input w-full ${errors[138] ? 'error' : ''}`}
                placeholder="أدخل المحافظة"
              />
              {errors[138] && <p className="error-message text-sm mt-2">{errors[138]}</p>}
            </div>
          </div>

          {/* القسم الثاني: الصور */}
          <div className="section-header text-white p-6 relative">
            <div className="flex items-center">
              <h2 className="text-2xl font-bold">الصور</h2>
            </div>
          </div>
          <div className="p-8 space-y-6 bg-white">
            <div className="field-group">
              <label className="field-label">
                الصورة 1 <span className="field-required">*</span>
              </label>
              <input
                type="file"
                name="139"
                accept="image/*"
                onChange={handleFileChange}
                className={`ui-input w-full ${errors[139] ? 'error' : ''}`}
              />
              {errors[139] && <p className="error-message text-sm mt-2">{errors[139]}</p>}
              {formData[139] && (
                <p className="text-sm text-accent mt-2">تم اختيار الملف: {formData[139]?.name}</p>
              )}
            </div>

            <div className="field-group">
              <label className="field-label">
                الصورة 2 <span className="field-required">*</span>
              </label>
              <input
                type="file"
                name="140"
                accept="image/*"
                onChange={handleFileChange}
                className={`ui-input w-full ${errors[140] ? 'error' : ''}`}
              />
              {errors[140] && <p className="error-message text-sm mt-2">{errors[140]}</p>}
              {formData[140] && (
                <p className="text-sm text-accent mt-2">تم اختيار الملف: {formData[140]?.name}</p>
              )}
            </div>

            <div className="field-group">
              <label className="field-label">
                الصورة 3 <span className="field-required">*</span>
              </label>
              <input
                type="file"
                name="141"
                accept="image/*"
                onChange={handleFileChange}
                className={`ui-input w-full ${errors[141] ? 'error' : ''}`}
              />
              {errors[141] && <p className="error-message text-sm mt-2">{errors[141]}</p>}
              {formData[141] && (
                <p className="text-sm text-accent mt-2">تم اختيار الملف: {formData[141]?.name}</p>
              )}
            </div>
          </div>

          {/* Submit Button المحسن */}
          <div className="p-8 bg-white border-t border-[color:var(--border-light)]">
            <div className="max-w-md mx-auto">
              <button
                type="submit"
                className="btn-primary w-full text-white py-4 px-8 rounded-2xl text-xl font-bold transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-300 focus:ring-offset-2 flex items-center justify-center group"
              >
                <svg className="w-6 h-6 ml-3 transform group-hover:translate-x-1 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
                </svg>
                إرسال الاستمارة
                <div className="w-6 h-6 mr-3 rounded-full bg-white/30 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
              </button>
              
              <div className="text-center mt-4">
                <p className="text-gray-600 text-sm">
                  جميع البيانات محمية ومشفرة بأعلى معايير الأمان
                </p>
              </div>
            </div>
          </div>
        </form>
        
        {/* Footer */}
        <div className="text-center mt-8 fade-in">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-center mb-3">
              <Image 
                src="/logo2.png" 
                alt="شعار ويدو" 
                width={64}
                height={64}
                className="w-16 h-16 object-contain"
              />
            </div>
            <p className="text-gray-600 text-sm">
              WEDO 2025 © 
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}