# وثيقة مشروع تطبيق تأهيل الأطفال (Speech Therapy App)

## 1. نظرة عامة على المشروع (Project Overview)
تطبيق متكامل لتأهيل الأطفال متأخري النطق وذوي الهمم، يعتمد على اختبارات تقييمية (سمعية/بصرية) وجلسات متابعة مع مختصين.
* **Mobile App**: Flutter (للأهل والطفل).
* **Backend**: Node.js (API & Logic).
* **Specialist Dashboard**: React.js (للمختصين والأدمن).

## 2. مخطط قاعدة البيانات المفصل (Detailed ERD)

### أ- إدارة المستخدمين (Users & Children)
* **Users**: id, name, email, password, role (parent/specialist/admin), specialty_type.
* **Children**: id, parent_id (FK), name, age, gender, case_history.

### ب- نظام الاشتراكات (Subscription System)
* **Plans**: id, title, duration (1, 3, 6, 12 months), price, features_list.
* **Subscriptions**: id, child_id (FK), plan_id (FK), start_date, end_date, is_active.

### ج- نظام الاختبارات (Assessment Engine)
* **Tests**: id, category (Auditory/Visual), description.
* **Questions (Fixed)**: id, test_id (FK), audio_asset_path, image_asset_path, scoring_guide.
* **Assessment_Results**: id, child_id (FK), question_id (FK), score_given (by supervisor), session_id, timestamp.

### د- الجلسات والمواعيد (Sessions)
* **Appointments**: id, child_id (FK), specialist_id (FK), status (scheduled/completed), video_link.

## 3. منطق العمل (Business Logic)

### أ- آلية الاختبار (The Assessment Flow):
* يتم تحميل ملفات الصوت (المسجلة بصوتك) من الـ Assets محلياً في Flutter.
* يظهر السؤال للطفل -> يستمع للصوت -> يتفاعل.
* **مدير الجلسة (الأهل)**: يظهر لهم واجهة تحكم بسيطة لتقييم استجابة الطفل (مثلاً: 0، 5، 10 نقاط).
* يتم إرسال النتائج لحظياً إلى سيرفر Node.js لتحديث سجل الطفل.

### ب- خوارزمية الترشيح (Recommendation Algorithm):
* بعد انتهاء الاختبار، يقوم الـ Backend بتحليل النتائج:
  * إذا كان Score السمعي < حد معين -> يتم اقتراح مختصين "تخاطب".
  * إذا كان Score البصري < حد معين -> يتم اقتراح مختصين "تنمية مهارات".

## 4. المسارات التقنية (Technical Stack)
| الجزء | التقنية المستخدمة | الدور الأساسي |
|---|---|---|
| Mobile | Flutter | واجهة الطفل (Gamified UI) + تشغيل الأصوات + إدخال التقييم. |
| Backend | Node.js (Express) | إدارة المستخدمين، معالجة الدفع، وحساب نتائج التقييمات. |
| Database | MongoDB / PostgreSQL | تخزين بيانات الأطفال ونتائج الجلسات التاريخية. |
| Frontend | React JSX | لوحة تحكم للمختصين لمتابعة تطور حالة الطفل قبل جلسة الفيديو. |
| Video | WebRTC / Agora | إدارة جلسات الفيديو المباشرة بين المختص والطفل. |

## 5. خطة التنفيذ القادمة (Next Steps)
* **Backend**: بناء الـ Models بناءً على الـ ERD الموضح أعلاه.
* **Flutter**: عمل AssessmentProvider لإدارة حالة الاختبار والتنقل بين الأسئلة.
* **Integration**: ربط زرار التقييم بـ API الـ submit-result.
