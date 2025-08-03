import React from "react";
import { FileText, Scale, Shield, User, DollarSign, Eye, Lock, AlertTriangle, ImageIcon } from "lucide-react";

export default function TermsAndConditions() {
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
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-600/80 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Scale className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white drop-shadow-lg">الشروط والأحكام</h1>
                <p className="text-xs sm:text-sm text-white/80 drop-shadow">Terms & Conditions</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 text-white">
              <div className="hidden sm:flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-white/60" />
                <FileText className="w-4 h-4 text-blue-400 animate-pulse" />
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
            <Scale className="w-6 h-6 md:w-8 md:h-8" />
            الشروط والأحكام
          </h1>
          
          <div className="space-y-6 text-white/90 leading-relaxed">
            <div className="card-3d bg-gradient-to-br from-orange-950/20 to-red-950/10 border-orange-500/20 p-4">
              <p className="text-lg">
                باستخدامك للعبة عقد الدم، فإنك توافق على الالتزام بالشروط والأحكام التالية:
              </p>
            </div>

            {/* Section 1 */}
            <div className="card-3d bg-black/40 border-white/10 p-5">
              <h2 className="text-xl font-semibold text-blue-400 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                1. التس��يل واستخدام الحساب
              </h2>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>يجب أن يكون عمر المستخدم 13 سنة أو أكثر.</li>
                <li>يجب تقديم معلومات صحيحة أثناء التسجيل وعدم انتحال هوية أي شخص آخر.</li>
                <li>يُمنع مشاركة بيانات الدخول مع أي طرف آخر.</li>
                <li>يجب الحفاظ على سرية بيانات الحساب وعدم مشاركتها مع أي جهة.</li>
              </ul>
            </div>

            {/* Section 2 */}
            <div className="card-3d bg-black/40 border-white/10 p-5">
              <h2 className="text-xl font-semibold text-green-400 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                2. الاستخدام الشخصي وغير التجاري
              </h2>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>الخدمة متاحة فقط للاستخدام الشخصي وغير التجاري.</li>
                <li>يُمنع استخدام اللعبة لأي أغراض تجارية أو ترويجية دون إذن مسبق.</li>
              </ul>
            </div>

            {/* Section 3 */}
            <div className="card-3d bg-black/40 border-white/10 p-5">
              <h2 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                3. السلوك داخل اللعبة
              </h2>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>يُمنع استخدام الألفاظ المسيئة أو نشر محتوى غير لائق أو مخالف للأعراف أو القوانين المحلية.</li>
                <li>يُمنع محاولة اختراق أو استغلال ثغرات اللعبة أو استخدام برامج خارجية.</li>
                <li>يُمنع نشر أو تداول أي محتوى غير قانوني أو مخالف للأخلاق العامة.</li>
                <li>يجب احترام جميع اللاعبين وعدم الإساءة أو التحرش أو التهديد عبر الرسائل أو أي وسيلة تواصل داخل اللعبة.</li>
                <li>يمنع إنشاء أو إدارة عصابات أو مجموعات بهدف الإساءة أو التحايل أو مخالفة القوانين.</li>
              </ul>
            </div>

            {/* Section 4 */}
            <div className="card-3d bg-black/40 border-white/10 p-5">
              <h2 className="text-xl font-semibold text-purple-400 mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                4. الملكية الفكرية
              </h2>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>جميع عناصر اللعبة (الصور، الكود، التصميم، الأسماء، الشخصيات، القصص، المهام) محمية بحقوق النشر.</li>
                <li>لا يجوز نسخ أو توزيع أو إعادة استخدام أي جزء من اللعبة بدون إذن كتابي مسبق.</li>
              </ul>
            </div>

            {/* Section 5 */}
            <div className="card-3d bg-black/40 border-white/10 p-5">
              <h2 className="text-xl font-semibold text-yellow-400 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                5. الشراء داخل اللعبة
              </h2>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>بعض العناصر قابلة للشراء بعملة داخلية أو بطرق دفع حقيقية.</li>
                <li>جميع عمليات الشراء نهائية وغير قابلة للاسترداد.</li>
                <li>لا تتحمل إدارة اللعبة مسؤولية فقدان العناصر بسبب مخالفة القواعد أو الحظر.</li>
              </ul>
            </div>

            {/* Section 6 */}
            <div className="card-3d bg-black/40 border-white/10 p-5">
              <h2 className="text-xl font-semibold text-orange-400 mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5" />
                6. الإعلانات والمحتوى الخارجي
              </h2>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>اللعبة قد تحتوي على إعلانات أو محتوى ترويجي من جهات خارجية.</li>
                <li>نحن لسنا مسؤولين عن محتوى هذه الإعلانات أو الروابط الخارجية.</li>
              </ul>
            </div>

            {/* Section 7 */}
            <div className="card-3d bg-black/40 border-white/10 p-5">
              <h2 className="text-xl font-semibold text-green-400 mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5" />
                7. البيانات والخصوصية
              </h2>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>يتم جمع بعض البيانات الشخصية بهدف إدارة الحسابات وتقديم الدعم.</li>
                <li>لن يتم مشاركة بياناتك مع جهات خارجية إلا في حالات قانونية أو بطلب رسمي.</li>
              </ul>
            </div>

            {/* Section 8 */}
            <div className="card-3d bg-black/40 border-white/10 p-5">
              <h2 className="text-xl font-semibold text-red-400 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                8. إنهاء الحساب والمراقبة
              </h2>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>يحق لإدارة اللعبة تعليق أو حذف أي حساب يخالف الشروط أو يسيء استخدام الخدمة دون إشعار مسبق.</li>
                <li>تحتفظ إدارة اللعبة بحق مراقبة وتعديل أو حذف أي محتوى أو رسائل مخالفة.</li>
              </ul>
            </div>

            {/* Section 9 */}
            <div className="card-3d bg-black/40 border-white/10 p-5">
              <h2 className="text-xl font-semibold text-cyan-400 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                9. التعديلات والتحديثات
              </h2>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>تحتفظ إدارة اللعبة بحق تعديل أو تحديث الشروط والأحكام أو ميزات اللعبة في أي وقت.</li>
                <li>سيتم إعلام المستخدمين بأي تغييرات هامة عبر البريد الإلكتروني أو داخل اللعبة.</li>
                <li>استمرارك في استخدام اللعبة بعد التعديلات يعتبر موافقة ضمنية على الشروط الجديدة.</li>
              </ul>
            </div>

            {/* Section 10 */}
            <div className="card-3d bg-black/40 border-white/10 p-5">
              <h2 className="text-xl font-semibold text-blue-400 mb-4 flex items-center gap-2">
                <User className="w-5 h-5" />
                10. الدعم والتواصل
              </h2>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>لأي استفسارات أو مشاكل أو للإبلاغ عن مخالفات، تواصل معنا عبر البريد الإلكتروني: <span className="text-blood-400 font-bold">support@bloodcontract.com</span></li>
              </ul>
            </div>

            {/* Section 11 */}
            <div className="card-3d bg-black/40 border-white/10 p-5">
              <h2 className="text-xl font-semibold text-purple-400 mb-4 flex items-center gap-2">
                <Scale className="w-5 h-5" />
                11. النزاعات القانونية
              </h2>
              <ul className="list-disc list-inside space-y-2 text-white/80">
                <li>في حال حدوث أي نزاع قانوني، تكون المحاكم المحلية في بلد المستخدم هي الجهة المختصة إلا إذا تم الاتفاق على خلاف ذلك.</li>
              </ul>
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
