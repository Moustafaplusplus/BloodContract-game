import React from "react";
import { Shield, Eye, Lock, FileText, Users, ImageIcon } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen blood-gradient text-white safe-area-top safe-area-bottom" dir="rtl">
      <div className="container mx-auto max-w-4xl p-4 space-y-6">
        
        {/* Enhanced Header with Background Image */}
        <div className="relative h-24 sm:h-32 rounded-xl overflow-hidden bg-black/90">
          {/* Background Image Placeholder */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
            <div className={"absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23dc2626\" fill-opacity=\"0.1\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"4\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"}></div>
          </div>

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/50"></div>

          {/* Content */}
          <div className="relative z-10 h-full flex items-center justify-between p-4 sm:p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-600/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">سياسة الخصوصية</h1>
                <p className="text-xs sm:text-sm text-white/80 drop-shadow">Privacy Policy</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-white">
              <div className="hidden sm:flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-white/60" />
                <Lock className="w-4 h-4 text-green-400 animate-pulse" />
              </div>
              <div className="text-right">
                <div className="text-lg sm:text-xl font-bold drop-shadow-lg">عقد الدم</div>
                <div className="text-xs text-white/80 drop-shadow">Blood Contract</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="card-3d p-6 animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold mb-6 text-blood-400 flex items-center gap-3">
            <Shield className="w-6 h-6 md:w-8 md:h-8" />
            سياسة الخصوصية – لعبة "عقد الدم"
          </h1>
          
          <div className="space-y-6 text-white/90 leading-relaxed">
            <div className="card-3d bg-gradient-to-br from-green-950/20 to-blue-950/10 border-green-500/20 p-4">
              <p className="text-lg">
                نحن نحترم خصوصيتك ونلتزم بحماية أي معلومات تقوم بمشاركتها معنا أثناء استخدامك للعبة "عقد الدم" على المتصفح.
              </p>
            </div>

            {/* Section 1 */}
            <div className="card-3d bg-black/40 border-white/10 p-5">
              <h2 className="text-xl font-semibold text-yellow-400 mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                1. المعلومات التي نقوم بجمعها
              </h2>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>معلومات تسجيل الدخول (مثل البريد الإلكتروني أو اسم المستخدم).</li>
                <li>بيانات اللعبة (مثل التقدم في المستويات، الإحصائيات، الأسلحة المملوكة، الإنجازات، الرسائل، الأصدقاء، المشتريات).</li>
                <li>عنوان الـ IP ونوع الجهاز والمتصفح لأغراض الحماية وتحسين الأداء.</li>
              </ul>
            </div>

            {/* Section 2 */}
            <div className="card-3d bg-black/40 border-white/10 p-5">
              <h2 className="text-xl font-semibold text-blue-400 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                2. كيف نستخدم المعلومات
              </h2>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>تحسين تجربة اللعب وحفظ تقدمك داخل اللعبة.</li>
                <li>حمايتك من الغش أو الدخول غير المصرح به.</li>
                <li>إرسال إشعارات داخل اللعبة متعلقة بالمهام أو الجوائز.</li>
                <li>تحسين ميزات اللعبة وتطويرها.</li>
                <li>التواصل معك بشأن التحديثات أو المشكلات المتعلقة بالحساب.</li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="card-3d bg-black/40 border-white/10 p-5">
              <h2 className="text-xl font-semibold text-orange-400 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                3. مشاركة المعلومات مع جهات خارجية
              </h2>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>لا نقوم ببيع أو مشاركة بياناتك مع أي طرف ثالث لأغراض تسويقية.</li>
                <li>قد يتم مشاركة بعض البيانات فقط في الحالات القانونية أو بطلب رسمي من الجهات المختصة.</li>
                <li>قد نستخدم خدمات إعلانية (مثل Google AdSense) والتي تستخدم بيانات التصفح لتحسين الإعلانات.</li>
              </ul>
            </div>

            {/* Section 4 */}
            <div className="card-3d bg-black/40 border-white/10 p-5">
              <h2 className="text-xl font-semibold text-green-400 mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                4. الأمان وحماية المعلومات
              </h2>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>نحمي بياناتك باستخدام أحدث تقنيات التشفير والمصادقة.</li>
                <li>يتم حفظ المعلومات في بيئة آمنة ولا يتم تداولها إلا للضرورة القصوى.</li>
                <li>أنت مسؤول عن الحفاظ على سرية حسابك.</li>
              </ul>
            </div>

            {/* Section 5 */}
            <div className="card-3d bg-black/40 border-white/10 p-5">
              <h2 className="text-xl font-semibold text-purple-400 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                5. حقوق المستخدم
              </h2>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>يحق لك طلب حذف أو تعديل بياناتك الشخصية في أي وقت.</li>
                <li>يمكنك حذف حسابك في أي وقت، وسنقو�� بحذف كافة بياناتك المرتبطة.</li>
                <li>يمكنك التواصل معنا لأي استفسار أو طلب متعلق بالخصوصية عبر البريد الإلكتروني: <span className="text-blood-400 font-bold">support@bloodcontract.com</span></li>
              </ul>
            </div>

            {/* Section 6 */}
            <div className="card-3d bg-black/40 border-white/10 p-5">
              <h2 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                6. تحديثات السياسة
              </h2>
              <p className="text-white/80">
                قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سيتم إعلامك بأي تغييرات هامة عبر البريد الإلكتروني أو داخل اللعبة.
              </p>
            </div>

            {/* Footer */}
            <div className="card-3d bg-gradient-to-r from-blood-950/20 to-black/40 border-blood-500/20 p-4 text-center">
              <p className="text-sm text-white/60">آخر تحديث: يوليو 2025</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
