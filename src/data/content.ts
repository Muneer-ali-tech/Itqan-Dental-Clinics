import {
  ShieldCheck,
  Layers,
  Sparkles,
  Smile,
  Microscope,
  Baby,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { Bi } from "../context";
import { IMAGES, type ImageAsset } from "./images";

// PLACEHOLDER — all numbers, licences, addresses and contact data below are sample data.
export const UNIFIED_PHONE = { display: "+966 92 000 0000", tel: "+966920000000" }; // PLACEHOLDER
export const WHATSAPP = { display: "+966 50 000 0000", wa: "966500000000" }; // PLACEHOLDER
export const EMAIL = "care@itqan-dental.example"; // PLACEHOLDER

export interface Country {
  id: "sa" | "ae" | "bh";
  name: Bi;
  short: Bi;
  code: string;
  currency: string;
  regulator: string;
}

export const COUNTRIES: Country[] = [
  { id: "sa", name: { ar: "المملكة العربية السعودية", en: "Kingdom of Saudi Arabia" }, short: { ar: "السعودية", en: "Saudi Arabia" }, code: "+966", currency: "SAR", regulator: "MOH / SCFHS" },
  { id: "ae", name: { ar: "الإمارات العربية المتحدة", en: "United Arab Emirates" }, short: { ar: "الإمارات", en: "UAE" }, code: "+971", currency: "AED", regulator: "DHA / MOHAP" },
  { id: "bh", name: { ar: "مملكة البحرين", en: "Kingdom of Bahrain" }, short: { ar: "البحرين", en: "Bahrain" }, code: "+973", currency: "BHD", regulator: "NHRA" },
];

export interface Branch {
  id: string;
  country: Country["id"];
  city: Bi;
  name: Bi;
  lockup: Bi;
  address: Bi;
  hours: Bi;
  phone: string;
  parking: Bi;
  valet: boolean;
  lat: number;
  lon: number;
}

// PLACEHOLDER
export const BRANCHES: Branch[] = [
  {
    id: "ruh", country: "sa",
    city: { ar: "الرياض", en: "Riyadh" },
    name: { ar: "فرع العليا", en: "Olaya Branch" },
    lockup: { ar: "إتقان — فرع العليا بالرياض", en: "Itqan — Olaya Branch, Riyadh" },
    address: { ar: "طريق الملك فهد، حي العليا، الرياض 12214", en: "King Fahd Road, Al Olaya, Riyadh 12214" },
    hours: { ar: "السبت – الخميس: 9 ص – 10 م · الجمعة: 4 م – 10 م", en: "Sat – Thu: 9am – 10pm · Fri: 4pm – 10pm" },
    phone: "+966 11 000 0001",
    parking: { ar: "مواقف تحت الأرض لـ 120 سيارة", en: "Underground parking for 120 cars" },
    valet: true, lat: 24.6937, lon: 46.6853,
  },
  {
    id: "jed", country: "sa",
    city: { ar: "جدة", en: "Jeddah" },
    name: { ar: "فرع التحلية", en: "Tahlia Branch" },
    lockup: { ar: "إتقان — فرع التحلية بجدة", en: "Itqan — Tahlia Branch, Jeddah" },
    address: { ar: "شارع التحلية، حي الأندلس، جدة 23326", en: "Tahlia Street, Al Andalus, Jeddah 23326" },
    hours: { ar: "السبت – الخميس: 9 ص – 10 م · الجمعة: 4 م – 10 م", en: "Sat – Thu: 9am – 10pm · Fri: 4pm – 10pm" },
    phone: "+966 12 000 0002",
    parking: { ar: "مواقف مخصصة للمراجعين", en: "Dedicated patient parking" },
    valet: true, lat: 21.5811, lon: 39.1397,
  },
  {
    id: "dxb", country: "ae",
    city: { ar: "دبي", en: "Dubai" },
    name: { ar: "فرع الخليج التجاري", en: "Business Bay Branch" },
    lockup: { ar: "إتقان — فرع الخليج التجاري بدبي", en: "Itqan — Business Bay Branch, Dubai" },
    address: { ar: "شارع الخليج التجاري، دبي", en: "Business Bay Boulevard, Dubai" },
    hours: { ar: "يوميًا: 9 ص – 9 م (الجمعة: 2 م – 9 م)", en: "Daily: 9am – 9pm (Fri: 2pm – 9pm)" },
    phone: "+971 4 000 0003",
    parking: { ar: "مواقف المبنى — ساعتان مجانًا", en: "Building parking — 2 hours complimentary" },
    valet: true, lat: 25.185, lon: 55.265,
  },
  {
    id: "auh", country: "ae",
    city: { ar: "أبوظبي", en: "Abu Dhabi" },
    name: { ar: "فرع المارية", en: "Al Maryah Branch" },
    lockup: { ar: "إتقان — فرع المارية بأبوظبي", en: "Itqan — Al Maryah Branch, Abu Dhabi" },
    address: { ar: "جزيرة المارية، أبوظبي", en: "Al Maryah Island, Abu Dhabi" },
    hours: { ar: "يوميًا: 9 ص – 9 م (الجمعة: 2 م – 9 م)", en: "Daily: 9am – 9pm (Fri: 2pm – 9pm)" },
    phone: "+971 2 000 0004",
    parking: { ar: "مواقف مغطاة مرتبطة بالمبنى", en: "Covered parking connected to the building" },
    valet: false, lat: 24.5015, lon: 54.3907,
  },
  {
    id: "bah", country: "bh",
    city: { ar: "المنامة", en: "Manama" },
    name: { ar: "فرع السيف", en: "Seef Branch" },
    lockup: { ar: "إتقان — فرع السيف بالمنامة", en: "Itqan — Seef Branch, Manama" },
    address: { ar: "ضاحية السيف، المنامة، مملكة البحرين", en: "Seef District, Manama, Kingdom of Bahrain" },
    hours: { ar: "السبت – الخميس: 8 ص – 9 م · الجمعة: 3 م – 9 م", en: "Sat – Thu: 8am – 9pm · Fri: 3pm – 9pm" },
    phone: "+973 1700 0005",
    parking: { ar: "مواقف مجانية أمام المبنى", en: "Complimentary parking at the entrance" },
    valet: true, lat: 26.237, lon: 50.538,
  },
];

export interface Specialty {
  id: string;
  icon: LucideIcon;
  name: Bi;
  en: string;
  desc: Bi;
  tag: Bi;
}

export const SPECIALTIES: Specialty[] = [
  { id: "preventive", icon: ShieldCheck, name: { ar: "طب الأسنان الوقائي الشامل", en: "Preventive & Comprehensive Family Dentistry" }, en: "Preventive & Family",
    desc: { ar: "فحص رقمي شامل وخطة وقائية سنوية لكل أفراد العائلة، بسجل سريري موحد عبر الفروع.", en: "A complete digital examination and an annual preventive plan for every family member, on one shared clinical record." },
    tag: { ar: "متاح في جميع الفروع", en: "All branches" } },
  { id: "implant", icon: Layers, name: { ar: "زراعة الأسنان المتقدمة", en: "Guided Digital Implantology" }, en: "Implantology",
    desc: { ar: "تخطيط جراحي موجّه ثلاثي الأبعاد وترميم دقيق وفق بروتوكول جراحي موحد.", en: "3D-guided surgical planning and precise restoration under one unified surgical protocol." },
    tag: { ar: "جراحة موجّهة", en: "Guided surgery" } },
  { id: "cosmetic", icon: Sparkles, name: { ar: "تجميل وتصميم الابتسامة", en: "Cosmetic Smile Design & Zirconia Veneers" }, en: "Smile Design",
    desc: { ar: "تصميم رقمي للابتسامة وعدسات زركونيا وبورسلين تُصنَّع في مختبراتنا المركزية.", en: "Digital smile design with zirconia and porcelain veneers manufactured in our central labs." },
    tag: { ar: "زركونيا وبورسلين", en: "Zirconia & porcelain" } },
  { id: "ortho", icon: Smile, name: { ar: "تقويم الأسنان والتقويم الشفاف", en: "Smart Clear Aligners & Orthodontics" }, en: "Orthodontics",
    desc: { ar: "محاكاة رقمية لمسار الحركة السنية وتقويم شفاف أو ثابت بمتابعة منتظمة.", en: "Digital simulation of tooth movement with clear or fixed appliances and scheduled follow-up." },
    tag: { ar: "تقويم شفاف", en: "Clear aligners" } },
  { id: "endo", icon: Microscope, name: { ar: "علاج الجذور تحت الميكروسكوب", en: "Microscopic Endodontics" }, en: "Endodontics",
    desc: { ar: "علاج قنوات الجذور بتكبير مجهري وتصوير ثلاثي الأبعاد للحفاظ على السن الطبيعي.", en: "Root canal treatment under microscopic magnification with 3D imaging to preserve the natural tooth." },
    tag: { ar: "تكبير مجهري", en: "Microscopic" } },
  { id: "pediatric", icon: Baby, name: { ar: "طب أسنان الأطفال التخصصي", en: "Specialized Pediatric Dentistry" }, en: "Pediatric",
    desc: { ar: "بيئة هادئة خالية من الرهبة، وبروتوكولات تدرّج تُناسب عمر الطفل واحتياجه.", en: "A calm, fear-free environment with age-appropriate, gradual care protocols." },
    tag: { ar: "بيئة هادئة", en: "Fear-free" } },
  { id: "perio", icon: Zap, name: { ar: "جراحة اللثة والعلاج بالليزر", en: "Periodontal Surgery & Laser Care" }, en: "Periodontics & Laser",
    desc: { ar: "علاج أمراض اللثة وتجميلها جراحيًا وبالليزر بأقل تدخل ممكن.", en: "Surgical and laser-assisted treatment and aesthetics of the gums with minimal intervention." },
    tag: { ar: "ليزر", en: "Laser" } },
];

export interface Doctor {
  id: string;
  image: ImageAsset;
  name: Bi;
  title: Bi;
  specialty: Bi;
  specialtyId: string;
  branchId: string;
  quote: Bi;
  fellowships: Bi[];
  years: number;
  license: string;
}

// PLACEHOLDER — names, credentials and licence numbers are sample data.
export const DOCTORS: Doctor[] = [
  {
    id: "d1", image: IMAGES.founder,
    name: { ar: "د. عبدالعزيز الراشد", en: "Dr. Abdulaziz Al-Rashid" },
    title: { ar: "المؤسس والمشرف الطبي العام", en: "Founder & Chief Medical Officer" },
    specialty: { ar: "التعويضات السنية والطب الوقائي", en: "Prosthodontics & Preventive Care" },
    specialtyId: "preventive", branchId: "ruh",
    quote: { ar: "الإتقان ليس شعارًا نرفعه، بل بروتوكول نكتبه ونُدقّقه ونُطبّقه بالحرف في كل فرع.", en: "Mastery is not a slogan we display. It is a protocol we write, audit and apply, word for word, in every branch." },
    fellowships: [
      { ar: "زمالة الهيئة السعودية للتخصصات الصحية — التعويضات السنية", en: "SCFHS Fellowship — Prosthodontics" },
      { ar: "زمالة تدريبية — جامعة زيورخ، سويسرا", en: "Clinical Fellowship — University of Zurich, Switzerland" },
      { ar: "عضو لجنة الجودة السريرية الخليجية", en: "Member, Gulf Clinical Quality Committee" },
    ],
    years: 28, license: "SCFHS 00-0000",
  },
  {
    id: "d2", image: IMAGES.dr2,
    name: { ar: "د. مريم الكعبي", en: "Dr. Mariam Al-Kaabi" },
    title: { ar: "رئيسة قسم الزراعة — دبي", en: "Head of Implantology — Dubai" },
    specialty: { ar: "زراعة الأسنان الموجّهة رقميًا", en: "Guided Digital Implantology" },
    specialtyId: "implant", branchId: "dxb",
    quote: { ar: "كل زرعة تبدأ بخطة ثلاثية الأبعاد، وتنتهي بنتيجة يمكن تتبعها وقياسها.", en: "Every implant begins with a 3D plan and ends with a result that can be traced and measured." },
    fellowships: [
      { ar: "زمالة الجراحة الفموية والزراعة — لندن", en: "Fellowship in Oral Surgery & Implantology — London" },
      { ar: "ترخيص هيئة الصحة بدبي (DHA)", en: "Dubai Health Authority (DHA) licensed" },
      { ar: "مدرّبة معتمدة في الجراحة الموجّهة", en: "Certified trainer in guided surgery" },
    ],
    years: 17, license: "DHA 00-0000",
  },
  {
    id: "d3", image: IMAGES.dr3,
    name: { ar: "د. خالد المناعي", en: "Dr. Khalid Al-Manaie" },
    title: { ar: "رئيس قسم التجميل — المنامة", en: "Head of Cosmetic Dentistry — Manama" },
    specialty: { ar: "تصميم الابتسامة وعدسات الزركونيا", en: "Smile Design & Zirconia Veneers" },
    specialtyId: "cosmetic", branchId: "bah",
    quote: { ar: "الابتسامة الناجحة هي التي لا يلاحظها أحد على أنها صُنعت؛ بل على أنها تشبهك.", en: "A successful smile is the one nobody notices was designed. They simply see that it looks like you." },
    fellowships: [
      { ar: "ماجستير طب الأسنان التجميلي — جامعة عين شمس", en: "MSc Aesthetic Dentistry — Ain Shams University" },
      { ar: "شهادة تصميم الابتسامة الرقمي — ألمانيا", en: "Digital Smile Design Certificate — Germany" },
      { ar: "مرخّص من NHRA البحرين", en: "NHRA Bahrain licensed" },
    ],
    years: 19, license: "NHRA 00-0000",
  },
  {
    id: "d4", image: IMAGES.dr4,
    name: { ar: "د. ريم الحربي", en: "Dr. Reem Al-Harbi" },
    title: { ar: "رئيسة قسم التقويم — جدة", en: "Head of Orthodontics — Jeddah" },
    specialty: { ar: "التقويم الشفاف والتقويم التوجيهي", en: "Clear Aligners & Orthodontics" },
    specialtyId: "ortho", branchId: "jed",
    quote: { ar: "نحاكي الحركة قبل أن نبدأها، فيعرف المراجع وجهته قبل أن يخطو الخطوة الأولى.", en: "We simulate the movement before we begin it, so the patient knows the destination before the first step." },
    fellowships: [
      { ar: "زمالة الهيئة السعودية للتخصصات الصحية — التقويم", en: "SCFHS Fellowship — Orthodontics" },
      { ar: "مزوّدة معتمدة لأنظمة التقويم الشفاف", en: "Accredited clear-aligner provider" },
      { ar: "عضو الجمعية السعودية لتقويم الأسنان", en: "Member, Saudi Orthodontic Society" },
    ],
    years: 14, license: "SCFHS 00-0001",
  },
  {
    id: "d5", image: IMAGES.dr5,
    name: { ar: "د. سلطان المزروعي", en: "Dr. Sultan Al-Mazrouei" },
    title: { ar: "رئيس قسم علاج الجذور — أبوظبي", en: "Head of Endodontics — Abu Dhabi" },
    specialty: { ar: "علاج الجذور المجهري", en: "Microscopic Endodontics" },
    specialtyId: "endo", branchId: "auh",
    quote: { ar: "حين نرى القناة بوضوح، نحافظ على السن الطبيعي ونتجنب الاستبدال غير الضروري.", en: "When the canal is seen clearly, we preserve the natural tooth and avoid unnecessary replacement." },
    fellowships: [
      { ar: "دبلوم علاج الجذور المتقدم — جامعة بنسلفانيا", en: "Advanced Endodontics Diploma — University of Pennsylvania" },
      { ar: "ترخيص هيئة الصحة — أبوظبي (DoH)", en: "Department of Health Abu Dhabi licensed" },
      { ar: "مؤلف مشارك في أبحاث محكّمة", en: "Co-author of peer-reviewed research" },
    ],
    years: 22, license: "DOH 00-0000",
  },
  {
    id: "d6", image: IMAGES.dr6,
    name: { ar: "د. زهراء الأنصاري", en: "Dr. Zahra Al-Ansari" },
    title: { ar: "رئيسة قسم الأطفال — المنامة", en: "Head of Pediatric Dentistry — Manama" },
    specialty: { ar: "طب أسنان الأطفال", en: "Pediatric Dentistry" },
    specialtyId: "pediatric", branchId: "bah",
    quote: { ar: "الزيارة الأولى للطفل تصنع علاقته بالعناية السنية لعقود؛ نصمّمها لتكون هادئة.", en: "A child's first visit shapes their relationship with dental care for decades. We design it to be calm." },
    fellowships: [
      { ar: "البورد البريطاني في طب أسنان الأطفال", en: "UK Specialty Training in Paediatric Dentistry" },
      { ar: "مرخّصة من NHRA البحرين", en: "NHRA Bahrain licensed" },
      { ar: "تدريب في إدارة سلوك الطفل", en: "Training in child behaviour guidance" },
    ],
    years: 13, license: "NHRA 00-0001",
  },
  {
    id: "d7", image: IMAGES.dr7,
    name: { ar: "د. فيصل العتيبي", en: "Dr. Faisal Al-Otaibi" },
    title: { ar: "رئيس قسم اللثة والليزر — الرياض", en: "Head of Periodontics & Laser — Riyadh" },
    specialty: { ar: "جراحة اللثة التجميلية والليزر", en: "Periodontal Surgery & Laser" },
    specialtyId: "perio", branchId: "ruh",
    quote: { ar: "اللثة السليمة هي الأساس الذي يقوم عليه كل علاج؛ نعتني بها أولًا.", en: "Healthy gums are the foundation on which every treatment stands. We care for them first." },
    fellowships: [
      { ar: "زمالة أمراض اللثة والزراعة — جامعة الملك سعود", en: "Fellowship in Periodontics & Implants — King Saud University" },
      { ar: "شهادة السلامة والتطبيق السريري لليزر", en: "Clinical Laser Safety & Application Certificate" },
      { ar: "مرخّص من الهيئة السعودية للتخصصات الصحية", en: "SCFHS licensed" },
    ],
    years: 18, license: "SCFHS 00-0002",
  },
];

export const NAV: { id: string; label: Bi }[] = [
  { id: "pillars", label: { ar: "التخصصات", en: "Specialties" } },
  { id: "charter", label: { ar: "ميثاق إتقان", en: "Charter" } },
  { id: "results", label: { ar: "النتائج", en: "Results" } },
  { id: "board", label: { ar: "الاستشاريون", en: "Consultants" } },
  { id: "insurance", label: { ar: "التأمين والتقسيط", en: "Insurance" } },
  { id: "locator", label: { ar: "الفروع", en: "Branches" } },
];

export const JOURNEY = [
  { title: { ar: "حجز أونلاين", en: "Book online" }, desc: { ar: "اختر الفرع والتخصص والموعد في أقل من دقيقتين، ويُنشأ لك رقم حجز مركزي موحد.", en: "Choose branch, specialty and time in under two minutes. A single central booking reference is issued." }, meta: { ar: "دقيقتان", en: "2 minutes" } },
  { title: { ar: "استقبال موحد", en: "Unified reception" }, desc: { ar: "الاستقبال نفسه في كل فرع: هوية واحدة، وإجراءات واحدة، وفريق مدرَّب على المعيار ذاته.", en: "The same reception in every branch: one identity, one procedure, one team trained to the same standard." }, meta: { ar: "كل الفروع", en: "Every branch" } },
  { title: { ar: "سجل طبي سحابي مشترك", en: "Shared cloud record" }, desc: { ar: "الأشعة والمسوح الرقمية وخطط العلاج تُحفظ في ملف واحد مشفّر، متاح للفريق المعالج في أي فرع بموافقتك.", en: "X-rays, digital scans and treatment plans live in one encrypted file, available to your treating team in any branch with your consent." }, meta: { ar: "تشفير كامل", en: "End-to-end encrypted" } },
  { title: { ar: "علاج بخطة رقمية", en: "Digitally planned care" }, desc: { ar: "خطة علاج مرئية بالأبعاد الثلاثة، وتسعير واضح قبل البدء، وتصنيع مركزي بمواصفات واحدة.", en: "A visual 3D treatment plan, transparent pricing before you begin, and central manufacturing to a single specification." }, meta: { ar: "تسعير شفاف", en: "Transparent pricing" } },
  { title: { ar: "متابعة في أي فرع", en: "Follow-up anywhere" }, desc: { ar: "تنتقل بين الرياض ودبي والمنامة؟ يكمل الفريق من حيث توقف السجل، دون إعادة فحوصات.", en: "Travelling between Riyadh, Dubai and Manama? The team continues exactly where your record left off, with no repeated examinations." }, meta: { ar: "بلا تكرار", en: "No repetition" } },
];

export const TESTIMONIALS = [
  { name: { ar: "عائلة السبيعي", en: "The Al-Subaie family" }, role: { ar: "عائلة من الرياض", en: "Family, Riyadh" }, from: { ar: "الرياض", en: "Riyadh" }, to: { ar: "دبي", en: "Dubai" },
    text: { ar: "بدأنا الفحص الوقائي لأربعة أفراد في الرياض، وأكملنا المتابعة في دبي أثناء السفر. الملف كان جاهزًا، والفريق يعرف تفاصيل كل طفل دون أن نشرح من جديد.", en: "We began preventive checks for four family members in Riyadh and continued follow-up in Dubai while travelling. The record was ready, and the team knew each child's details without us explaining again." } },
  { name: { ar: "م. طارق الخاجة", en: "Eng. Tariq Al-Khaja" }, role: { ar: "رجل أعمال", en: "Business owner" }, from: { ar: "دبي", en: "Dubai" }, to: { ar: "المنامة", en: "Manama" },
    text: { ar: "تنقّلي بين الإمارات والبحرين كثير. ما أقدّره هو أن خطة الزراعة التي بدأتها في دبي استكملها فريق المنامة بالمواصفات نفسها والمواد نفسها.", en: "I travel often between the UAE and Bahrain. What I value is that the implant plan I began in Dubai was completed by the Manama team with the same specification and the same materials." } },
  { name: { ar: "السيدة نورة القحطاني", en: "Ms. Noura Al-Qahtani" }, role: { ar: "مراجِعة تقويم شفاف", en: "Clear aligner patient" }, from: { ar: "جدة", en: "Jeddah" }, to: { ar: "الرياض", en: "Riyadh" },
    text: { ar: "انتقلتُ للعمل في الرياض في منتصف رحلة التقويم الشفاف. حُوِّل ملفي وحُجز موعدي التالي خلال يوم واحد، وكانت التجربة مألوفة تمامًا.", en: "I relocated to Riyadh mid-way through my clear aligner journey. My file was transferred and my next appointment booked within one day, and the experience felt entirely familiar." } },
  { name: { ar: "عائلة المناعي", en: "The Al-Manaie family" }, role: { ar: "عائلة من المنامة", en: "Family, Manama" }, from: { ar: "المنامة", en: "Manama" }, to: { ar: "أبوظبي", en: "Abu Dhabi" },
    text: { ar: "ابنتنا الصغيرة كانت تخشى الزيارات، لكن بيئة قسم الأطفال غيّرت ذلك. وحين سافرنا إلى أبوظبي وجدنا النهج الهادئ نفسه.", en: "Our youngest used to dread dental visits, but the pediatric department's environment changed that. When we travelled to Abu Dhabi, we found the same calm approach." } },
];

export const INSURERS = [
  { id: "bupa", name: { ar: "بوبا العربية", en: "Bupa Arabia" } },
  { id: "tawuniya", name: { ar: "التعاونية", en: "Tawuniya" } },
  { id: "daman", name: { ar: "ضمان", en: "Daman" } },
  { id: "mednet", name: { ar: "مدنت", en: "MedNet" } },
  { id: "takaful", name: { ar: "تكافل", en: "Takaful" } },
];

export const FAQ: { q: Bi; a: Bi }[] = [
  { q: { ar: "كيف يُنقل ملفي الطبي بين الفروع في دولتين مختلفتين؟", en: "How is my clinical file transferred between branches in different countries?" },
    a: { ar: "ملفك سجل إلكتروني واحد مشفّر. عند حجزك في فرع آخر يُتاح للفريق المعالج هناك بعد موافقتك الصريحة، ويتم ذلك وفق أنظمة حماية البيانات الصحية في كل دولة، وبما يتوافق مع GDPR. لا حاجة لطلب نسخ ورقية أو إعادة التصوير غير الضرورية.", en: "Your file is a single encrypted electronic record. When you book at another branch it becomes available to the treating team there after your explicit consent, in line with each country's health-data regulations and GDPR. No paper copies or unnecessary re-imaging are required." } },
  { q: { ar: "هل الأسعار موحدة في كل الفروع؟", en: "Are prices unified across branches?" },
    a: { ar: "تعتمد المجموعة جدول أسعار مرجعيًا موحدًا لكل دولة بعملتها (ريال، درهم، دينار)، مع شفافية كاملة في خطة العلاج قبل البدء. قد تختلف الضرائب والرسوم النظامية بحسب كل دولة.", en: "The group applies a single reference price schedule per country in local currency (SAR, AED, BHD), with a fully transparent treatment plan before you begin. Statutory taxes and fees may vary by country." } },
  { q: { ar: "ما شركات التأمين المعتمدة؟ وكيف تتم الفوترة؟", en: "Which insurers are accepted, and how does billing work?" },
    a: { ar: "نتعاون مع بوبا والتعاونية وضمان ومدنت وتكافل. تتم الموافقة المسبقة والفوترة المباشرة عبر فريق التأمين المركزي، وتظهر حصتك قبل البدء. تختلف التغطية بحسب وثيقتك.", en: "We work with Bupa, Tawuniya, Daman, MedNet and Takaful. Pre-authorisation and direct billing are handled by the central insurance team, and your share is shown before you begin. Coverage depends on your policy." } },
  { q: { ar: "هل يمكن التقسيط؟", en: "Can I pay in instalments?" },
    a: { ar: "نعم، عبر Tabby وTamara بحسب أهلية العميل وموافقة مزوّد الخدمة. يمكنك تجربة الحاسبة في قسم التأمين والتمويل.", en: "Yes, through Tabby and Tamara, subject to customer eligibility and provider approval. Try the calculator in the insurance and financing section." } },
  { q: { ar: "هل يعمل بروتوكول التعقيم نفسه في كل الفروع؟", en: "Is the same sterilization protocol used in every branch?" },
    a: { ar: "نعم. تعتمد جميع الفروع أجهزة تعقيم Class B ومنظومة تتبّع لكل حزمة أدوات، وتخضع لتدقيق داخلي دوري يتبع معيارًا واحدًا.", en: "Yes. Every branch uses Class B sterilizers and a traceability system for each instrument pack, and is subject to periodic internal audits against a single standard." } },
  { q: { ar: "هل تقدمون نتائج مضمونة؟", en: "Do you guarantee results?" },
    a: { ar: "لا نقدّم وعودًا بنتائج محددة، فالاستجابة تختلف من شخص لآخر. نلتزم بالمعايير السريرية، ونوضّح الخيارات والمخاطر والبدائل بصدق قبل أي إجراء، وفق تعليمات الإعلان الصحي في كل بلد.", en: "We do not promise specific outcomes, as responses vary between individuals. We commit to clinical standards and explain options, risks and alternatives honestly before any procedure, in line with health-advertising rules in each country." } },
  { q: { ar: "كيف تحمون بياناتي الشخصية والصحية؟", en: "How do you protect my personal and health data?" },
    a: { ar: "نلتزم بنظام حماية البيانات الشخصية السعودي، وقوانين حماية البيانات الصحية في الإمارات والبحرين، وGDPR. تُشفَّر البيانات أثناء النقل والتخزين، ويحق لك الاطلاع عليها أو طلب تصحيحها.", en: "We comply with Saudi PDPL, health-data protection laws in the UAE and Bahrain, and GDPR. Data is encrypted in transit and at rest, and you may access or request correction of it at any time." } },
];

export const CHARTER = [
  { n: "I", title: { ar: "بروتوكول تعقيم واحد", en: "One sterilization protocol" }, desc: { ar: "أجهزة Class B وتتبّع كل حزمة أدوات، بتدقيق دوري موحد في كل فرع.", en: "Class B sterilizers and per-pack traceability, audited on one schedule in every branch." } },
  { n: "II", title: { ar: "مواد ألمانية وسويسرية", en: "German & Swiss materials" }, desc: { ar: "مواد ترميم وزراعة من مصنّعين أوروبيين معتمدين، بقوائم توريد موحدة.", en: "Restorative and implant materials from certified European manufacturers, on a unified supply list." } },
  { n: "III", title: { ar: "مسح ثلاثي الأبعاد في كل فرع", en: "3D scanning in every branch" }, desc: { ar: "ماسحات فموية رقمية وتصوير مقطعي مخروطي لتشخيص وتخطيط بالدقة نفسها.", en: "Digital intraoral scanners and cone-beam imaging for diagnosis and planning at the same precision." } },
  { n: "IV", title: { ar: "سجل سريري واحد", en: "One clinical record" }, desc: { ar: "ملف مشفّر ومشترك بين الفروع بموافقتك، يحفظ تاريخك كاملًا أينما كنت.", en: "An encrypted record shared across branches with your consent, preserving your full history wherever you are." } },
];

export const CHARTER_MATRIX_ROWS: Bi[] = [
  { ar: "تعقيم Class B ومنظومة تتبّع", en: "Class B sterilization & traceability" },
  { ar: "مسح فموي ثلاثي الأبعاد", en: "3D intraoral scanning" },
  { ar: "تصوير مقطعي مخروطي (CBCT)", en: "Cone-beam imaging (CBCT)" },
  { ar: "سجل سحابي موحد", en: "Unified cloud record" },
  { ar: "مواد أوروبية معتمدة", en: "Certified European materials" },
];

export const LICENSES = [
  { reg: "MOH / SCFHS", country: { ar: "المملكة العربية السعودية", en: "Saudi Arabia" }, no: "SA-MOH-000000" },
  { reg: "DHA / MOHAP", country: { ar: "الإمارات العربية المتحدة", en: "United Arab Emirates" }, no: "AE-DHA-000000" },
  { reg: "NHRA", country: { ar: "مملكة البحرين", en: "Kingdom of Bahrain" }, no: "BH-NHRA-000000" },
]; // PLACEHOLDER

export const TIME_SLOTS = ["09:00", "10:30", "12:00", "16:00", "17:30", "19:00"];
