import React from "react";

export default function TermsAndConditions() {
  return (
    <div className="max-w-2xl mx-auto p-8 bg-zinc-900 rounded-2xl shadow-lg border border-accent-red animate-fade-in">
      <h1 className="text-3xl font-bold mb-6 text-accent-red">الشروط والأحكام</h1>
      <div className="space-y-4 text-lg text-gray-200 leading-relaxed">
        <p>باستخدامك للعبة عقد الدم، فإنك توافق على الالتزام بالشروط والأحكام التالية:</p>

        <h2 className="text-xl font-semibold text-accent-yellow mt-6 mb-2">1. التسجيل واستخدام الحساب</h2>
        <ul className="list-disc pl-6">
          <li>يجب أن يكون عمر المستخدم 13 سنة أو أكثر.</li>
          <li>يجب تقديم معلومات صحيحة أثناء التسجيل وعدم انتحال هوية أي شخص آخر.</li>
          <li>يُمنع مشاركة بيانات الدخول مع أي طرف آخر.</li>
          <li>يجب الحفاظ على سرية بيانات الحساب وعدم مشاركتها مع أي جهة.</li>
        </ul>

        <h2 className="text-xl font-semibold text-accent-yellow mt-6 mb-2">2. الاستخدام الشخصي وغير التجاري</h2>
        <ul className="list-disc pl-6">
          <li>الخدمة متاحة فقط للاستخدام الشخصي وغير التجاري.</li>
          <li>يُمنع استخدام اللعبة لأي أغراض تجارية أو ترويجية دون إذن مسبق.</li>
        </ul>

        <h2 className="text-xl font-semibold text-accent-yellow mt-6 mb-2">3. السلوك داخل اللعبة</h2>
        <ul className="list-disc pl-6">
          <li>يُمنع استخدام الألفاظ المسيئة أو نشر محتوى غير لائق أو مخالف للأعراف أو القوانين المحلية.</li>
          <li>يُمنع محاولة اختراق أو استغلال ثغرات اللعبة أو استخدام برامج خارجية.</li>
          <li>يُمنع نشر أو تداول أي محتوى غير قانوني أو مخالف للأخلاق العامة.</li>
          <li>يجب احترام جميع اللاعبين وعدم الإساءة أو التحرش أو التهديد عبر الرسائل أو أي وسيلة تواصل داخل اللعبة.</li>
          <li>يمنع إنشاء أو إدارة عصابات أو مجموعات بهدف الإساءة أو التحايل أو مخالفة القوانين.</li>
        </ul>

        <h2 className="text-xl font-semibold text-accent-yellow mt-6 mb-2">4. الملكية الفكرية</h2>
        <ul className="list-disc pl-6">
          <li>جميع عناصر اللعبة (الصور، الكود، التصميم، الأسماء، الشخصيات، القصص، المهام) محمية بحقوق النشر.</li>
          <li>لا يجوز نسخ أو توزيع أو إعادة استخدام أي جزء من اللعبة بدون إذن كتابي مسبق.</li>
        </ul>

        <h2 className="text-xl font-semibold text-accent-yellow mt-6 mb-2">5. الشراء داخل اللعبة</h2>
        <ul className="list-disc pl-6">
          <li>بعض العناصر قابلة للشراء بعملة داخلية أو بطرق دفع حقيقية.</li>
          <li>جميع عمليات الشراء نهائية وغير قابلة للاسترداد.</li>
          <li>لا تتحمل إدارة اللعبة مسؤولية فقدان العناصر بسبب مخالفة القواعد أو الحظر.</li>
        </ul>

        <h2 className="text-xl font-semibold text-accent-yellow mt-6 mb-2">6. الإعلانات والمحتوى الخارجي</h2>
        <ul className="list-disc pl-6">
          <li>اللعبة قد تحتوي على إعلانات أو محتوى ترويجي من جهات خارجية.</li>
          <li>نحن لسنا مسؤولين عن محتوى هذه الإعلانات أو الروابط الخارجية.</li>
        </ul>

        <h2 className="text-xl font-semibold text-accent-yellow mt-6 mb-2">7. البيانات والخصوصية</h2>
        <ul className="list-disc pl-6">
          <li>يتم جمع بعض البيانات الشخصية بهدف إدارة الحسابات وتقديم الدعم.</li>
          <li>لن يتم مشاركة بياناتك مع جهات خارجية إلا في حالات قانونية أو بطلب رسمي.</li>
        </ul>

        <h2 className="text-xl font-semibold text-accent-yellow mt-6 mb-2">8. إنهاء الحساب والمراقبة</h2>
        <ul className="list-disc pl-6">
          <li>يحق لإدارة اللعبة تعليق أو حذف أي حساب يخالف الشروط أو يسيء استخدام الخدمة دون إشعار مسبق.</li>
          <li>تحتفظ إدارة اللعبة بحق مراقبة وتعديل أو حذف أي محتوى أو رسائل مخالفة.</li>
        </ul>

        <h2 className="text-xl font-semibold text-accent-yellow mt-6 mb-2">9. التعديلات والتحديثات</h2>
        <ul className="list-disc pl-6">
          <li>تحتفظ إدارة اللعبة بحق تعديل أو تحديث الشروط والأحكام أو ميزات اللعبة في أي وقت.</li>
          <li>سيتم إعلام المستخدمين بأي تغييرات هامة عبر البريد الإلكتروني أو داخل اللعبة.</li>
          <li>استمرارك في استخدام اللعبة بعد التعديلات يعتبر موافقة ضمنية على الشروط الجديدة.</li>
        </ul>

        <h2 className="text-xl font-semibold text-accent-yellow mt-6 mb-2">10. الدعم والتواصل</h2>
        <ul className="list-disc pl-6">
          <li>لأي استفسارات أو مشاكل أو للإبلاغ عن مخالفات، تواصل معنا عبر البريد الإلكتروني: <span className="text-accent-red">support@bloodcontract.com</span></li>
        </ul>

        <h2 className="text-xl font-semibold text-accent-yellow mt-6 mb-2">11. النزاعات القانونية</h2>
        <ul className="list-disc pl-6">
          <li>في حال حدوث أي نزاع قانوني، تكون المحاكم المحلية في بلد المستخدم هي الجهة المختصة إلا إذا تم الاتفاق على خلاف ذلك.</li>
        </ul>

        <p className="mt-8 text-sm text-gray-400">آخر تحديث: يوليو 2025</p>
      </div>
    </div>
  );
}
