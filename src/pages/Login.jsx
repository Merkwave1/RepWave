// src/pages/Login.js
// This is the main Login Page component, now directly under src/pages/.
// It handles user input for email, password, and company name (used for URL construction only).
// It should be saved as Login.jsx in your local project.
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TextField from '../components/common/TextField/TextField.jsx';
import Button from '../components/common/Button/Button.jsx';
import { loginUser } from '../apis/auth.js';
import { useNotifications } from '../hooks/useNotifications.js';
import { getErrorMessage } from '../utils/errorTranslations.js';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState(''); // State for company name (used for URL)
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const navigate = useNavigate();
  const notificationsCtx = useNotifications();

  // Get the base API URL from environment variables
  const API_LOGIN_BASE_URL = import.meta.env.VITE_API_LOGIN_BASE_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!API_LOGIN_BASE_URL || !companyName) {
      console.error("Error: VITE_API_LOGIN_BASE_URL or Company Name is missing.");
      setMessage("خطأ: يرجى إدخال اسم الشركة وعنوان URL الأساسي لتسجيل الدخول.");
      setLoading(false);
      return;
    }

    // Construct the full login URL dynamically
    // Expected: https://rep.merkwave.com/api/clients/{company name}/auth/login.php
    const fullLoginUrl = `${API_LOGIN_BASE_URL}${companyName}/auth/login.php`;

    let result;

    if (import.meta.env.DEV) {
      result = {
        status: "success",
        message: "Dev login success"
      };
    } else {
      result = await loginUser(fullLoginUrl, email, password, companyName);
    }
  };

  return (
    <div className="text-center" dir="rtl">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">تسجيل الدخول</h2>
      <p className="text-gray-600 mb-8">أدخل بيانات الاعتماد الخاصة بك للوصول إلى لوحة التحكم.</p>

      {message && (
        <div className={`mb-4 p-3 rounded-lg ${message.includes('نجاح') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <TextField label="اسم الشركة" type="text" id="companyName" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="أدخل اسم شركتك" required />
        <TextField label="البريد الإلكتروني" type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="أدخل بريدك الإلكتروني" required />
        <TextField label="كلمة المرور" type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="أدخل كلمة المرور" required />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
        </Button>
      </form>
    </div>
  );
}

export default LoginPage;
