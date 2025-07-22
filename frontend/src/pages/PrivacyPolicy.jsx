import React from "react";

export default function PrivacyPolicy() {
  return (
    <div className="max-w-2xl mx-auto p-8 bg-zinc-900 rounded-2xl shadow-lg border border-accent-red animate-fade-in">
      <h1 className="text-3xl font-bold mb-6 text-accent-red">سياسة الخصوصية – لعبة "عقد الدم"</h1>
      <div className="space-y-4 text-lg text-gray-200 leading-relaxed">
        <p>نحن نحترم خصوصيتك ونلتزم بحماية أي معلومات تقوم بمشاركتها معنا أثناء استخدامك للعبة "عقد الدم" على المتصفح.</p>

        <h2 className="text-xl font-semibold text-accent-yellow mt-6 mb-2">1. المعلومات التي نقوم بجمعها</h2>
        <ul className="list-disc pl-6">
          <li>معلومات تسجيل الدخول (مثل البريد الإلكتروني أو اسم المستخدم).</li>
          <li>بيانات اللعبة (مثل التقدم في المستويات، الإحصائيات، الأسلحة المملوكة، الإنجازات، الرسائل، الأصدقاء، المشتريات).</li>
          <li>عنوان الـ IP ونوع الجهاز والمتصفح لأغراض الحماية وتحسين الأداء.</li>
        </ul>

        <h2 className="text-xl font-semibold text-accent-yellow mt-6 mb-2">2. كيف نستخدم المعلومات</h2>
        <ul className="list-disc pl-6">
          <li>تحسين تجربة اللعب وحفظ تقدمك داخل اللعبة.</li>
          <li>حمايتك من الغش أو الدخول غير المصرح به.</li>
          <li>إرسال إشعارات داخل اللعبة متعلقة بالمهام أو الجوائز.</li>
          <li>تحسين ميزات اللعبة وتطويرها.</li>
          <li>التواصل معك بشأن التحديثات أو المشكلات المتعلقة بالحساب.</li>
        </ul>

        <h2 className="text-xl font-semibold text-accent-yellow mt-6 mb-2">3. مشاركة المعلومات مع جهات خارجية</h2>
        <ul className="list-disc pl-6">
          <li>لا نقوم ببيع أو مشاركة بياناتك مع أي طرف ثالث لأغراض تسويقية.</li>
          <li>قد يتم مشاركة بعض البيانات فقط في الحالات القانونية أو بطلب رسمي من الجهات المختصة.</li>
          <li>قد نستخدم خدمات إعلانية (مثل Google AdSense) والتي تستخدم بيانات التصفح لتحسين الإعلانات.</li>
        </ul>

        <h2 className="text-xl font-semibold text-accent-yellow mt-6 mb-2">4. الأمان وحماية المعلومات</h2>
        <ul className="list-disc pl-6">
          <li>نحمي بياناتك باستخدام أحدث تقنيات التشفير والمصادقة.</li>
          <li>يتم حفظ المعلومات في بيئة آمنة ولا يتم تداولها إلا للضرورة القصوى.</li>
          <li>أنت مسؤول عن الحفاظ على سرية حسابك.</li>
        </ul>

        <h2 className="text-xl font-semibold text-accent-yellow mt-6 mb-2">5. حقوق المستخدم</h2>
        <ul className="list-disc pl-6">
          <li>يحق لك طلب حذف أو تعديل بياناتك الشخصية في أي وقت.</li>
          <li>يمكنك حذف حسابك في أي وقت، وسنقوم بحذف كافة بياناتك المرتبطة.</li>
          <li>يمكنك التواصل معنا لأي استفسار أو طلب متعلق بالخصوصية عبر البريد الإلكتروني: <span className="text-accent-red">support@bloodcontract.com</span></li>
        </ul>

        <h2 className="text-xl font-semibold text-accent-yellow mt-6 mb-2">6. تحديثات السياسة</h2>
        <p>قد نقوم بتحديث سياسة الخصوصية من وقت لآخر. سيتم إعلامك بأي تغييرات هامة عبر البريد الإلكتروني أو داخل اللعبة.</p>

        <p className="mt-8 text-sm text-gray-400">آخر تحديث: يوليو 2025</p>
      </div>
    </div>
  );
}
