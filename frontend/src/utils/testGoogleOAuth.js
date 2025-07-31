/**
 * Test Google OAuth connectivity
 * This function helps debug OAuth issues
 */

export const testGoogleOAuth = async () => {
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  
  try {
    console.log('🔍 Testing Google OAuth connectivity...');
    console.log('Backend URL:', backendUrl);
    
    // Test if backend is reachable
    const response = await fetch(`${backendUrl}/api/auth/google/status`);
    const data = await response.json();
    
    console.log('Backend response:', data);
    
    if (response.ok) {
      console.log('✅ Backend is reachable');
      return true;
    } else {
      console.log('❌ Backend returned error:', data);
      return false;
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    return false;
  }
};

export const initiateGoogleOAuth = (setToken, setModal) => {
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const oauthUrl = `${backendUrl}/api/auth/google`;
  
  console.log('🔐 Redirecting to Google OAuth:', oauthUrl);
  
  // Test connectivity first
  testGoogleOAuth().then(isReachable => {
    if (isReachable) {
      window.location.href = oauthUrl;
    } else {
      setModal({
        isOpen: true,
        title: "خطأ في الاتصال",
        message: "لا يمكن الاتصال بالخادم. يرجى التحقق من إعدادات الشبكة والمحاولة مرة أخرى.",
        type: "error"
      });
    }
  }).catch(() => {
    setModal({
      isOpen: true,
      title: "خطأ في الاتصال",
      message: "لا يمكن الاتصال بالخادم. يرجى المحاولة لاحقاً.",
      type: "error"
    });
  });
}; 