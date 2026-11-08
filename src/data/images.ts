import type { SyntheticEvent } from "react";
import heroImg from "../assets/hero.jpg";
import labImg from "../assets/lab.jpg";
import receptionImg from "../assets/reception.jpg";
import founderImg from "../assets/dr-founder.jpg";
import dr2Img from "../assets/dr-2.jpg";
import dr3Img from "../assets/dr-3.jpg";
import dr4Img from "../assets/dr-4.jpg";
import dr5Img from "../assets/dr-5.jpg";
import dr6Img from "../assets/dr-6.jpg";
import dr7Img from "../assets/dr-7.jpg";
import implantBeforeImg from "../assets/ba-implant-before.jpg";
import implantAfterImg from "../assets/ba-implant-after.jpg";
import veneersBeforeImg from "../assets/ba-veneers-before.jpg";
import veneersAfterImg from "../assets/ba-veneers-after.jpg";
import alignersBeforeImg from "../assets/ba-aligners-before.jpg";
import alignersAfterImg from "../assets/ba-aligners-after.jpg";
import whiteningBeforeImg from "../assets/ba-whitening-before.jpg";
import whiteningAfterImg from "../assets/ba-whitening-after.jpg";

/** Zirconia-silver tile with the eight-point star — used if any image fails to load. */
const FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'><rect width='800' height='600' fill='#E9EBEF'/><g transform='translate(400 300)' fill='none' stroke='#4F8A8B' stroke-width='2'><circle r='70'/><rect x='-40' y='-40' width='80' height='80'/><rect x='-40' y='-40' width='80' height='80' transform='rotate(45)'/></g></svg>`,
  );

const onError = (e: SyntheticEvent<HTMLImageElement>) => {
  const img = e.currentTarget;
  img.onerror = null;
  img.src = FALLBACK;
};

export interface ImageAsset {
  src: string;
  alt: { ar: string; en: string };
  width: number;
  height: number;
  onError: (e: SyntheticEvent<HTMLImageElement>) => void;
  /** Generation prompt used for the AI-produced asset (absent for supplied photos) */
  prompt?: string;
}

const portraitSuffix =
  "waist-up 4:5 portrait, uniform camera angle at eye level, soft neutral daylight, cool zirconia-white clinic background, deep indigo (#2A2F5C) medical coat with a small Persian-turquoise (#4F8A8B) embroidered eight-point star branch badge, photorealistic, no text, no logos";

export const IMAGES: Record<string, ImageAsset> = {
  hero: {
    src: heroImg,
    alt: {
      ar: "استشاري يعرض مسحًا رقميًا ثلاثي الأبعاد للابتسامة على عائلة خليجية داخل جناح طبي واسع يطل على أفق الرياض",
      en: "A consultant presents a 3D digital smile scan to a Gulf family in a spacious medical suite overlooking the Riyadh skyline",
    },
    width: 1536,
    height: 1024,
    onError,
    prompt:
      "Photorealistic wide editorial photograph of an advanced digital dental consultation in a spacious Gulf medical suite: a Saudi male dental consultant in a deep indigo (#2A2F5C) coat shows a 3D smile scan on a tablet to a Gulf Arab family, floor-to-ceiling windows overlooking the Riyadh skyline in soft daylight, zirconia-white and silver interior, calm institutional mood, no text, no logos.",
  },
  lab: {
    src: labImg,
    alt: {
      ar: "فني مختبر رقمي مركزي بجوار جهاز طحن CAD/CAM لتاج زركونيا",
      en: "Technician beside a CAD/CAM mill carving a zirconia crown in the central digital lab",
    },
    width: 1024,
    height: 1024,
    onError,
    prompt:
      "Photorealistic photograph of a centralized digital dental laboratory: CAD/CAM milling machine carving a white zirconia crown, technician in deep indigo lab coat with dual monitors showing 3D tooth models, cool white and silver surfaces, neutral daylight, sterile precision, no text.",
  },
  reception: {
    src: receptionImg,
    alt: {
      ar: "ردهة استقبال موحدة بتصميم فضي هادئ ونقش نجمة ثمانية فيروزي",
      en: "Unified reception lounge in calm silver tones with a turquoise eight-point star motif",
    },
    width: 1024,
    height: 1024,
    onError,
    prompt:
      "Photorealistic architectural photograph of a serene institutional dental clinic reception lounge in Dubai: silver-grey and zirconia-white interior, subtle eight-pointed Islamic star pattern on the wall in muted turquoise, indigo accent armchairs, floor-to-ceiling windows, soft neutral daylight, empty and elegant, no text.",
  },
  founder: {
    src: founderImg,
    alt: {
      ar: "د. عبدالعزيز الراشد، المؤسس والمشرف الطبي العام",
      en: "Dr. Abdulaziz Al-Rashid, Founder and Chief Medical Officer",
    },
    width: 1248,
    height: 832,
    onError,
    prompt: `Distinguished Saudi male dentist founder aged about 58, short grey beard, composed institutional gaze, ${portraitSuffix}.`,
  },
  dr2: {
    src: dr2Img,
    alt: { ar: "د. مريم الكعبي، استشارية زراعة الأسنان — دبي", en: "Dr. Mariam Al-Kaabi, Implantology Consultant — Dubai" },
    width: 1248,
    height: 832,
    onError,
    prompt: `Emirati female implantologist aged about 42 in a dark elegant hijab, confident warm expression, ${portraitSuffix}.`,
  },
  dr3: {
    src: dr3Img,
    alt: { ar: "د. خالد المناعي، استشاري تجميل الأسنان — المنامة", en: "Dr. Khalid Al-Manaie, Cosmetic Dentistry Consultant — Manama" },
    width: 1248,
    height: 832,
    onError,
    prompt: `Bahraini male cosmetic dentist aged about 45, clean-shaven, short dark hair, rectangular glasses, ${portraitSuffix}.`,
  },
  dr4: {
    src: dr4Img,
    alt: { ar: "د. ريم الحربي، استشارية تقويم الأسنان — جدة", en: "Dr. Reem Al-Harbi, Orthodontics Consultant — Jeddah" },
    width: 1248,
    height: 832,
    onError,
    prompt: `Saudi female orthodontist aged about 38 with a soft light headscarf, warm assured smile, ${portraitSuffix}.`,
  },
  dr5: {
    src: dr5Img,
    alt: { ar: "د. سلطان المزروعي، استشاري علاج الجذور — أبوظبي", en: "Dr. Sultan Al-Mazrouei, Endodontics Consultant — Abu Dhabi" },
    width: 1248,
    height: 832,
    onError,
    prompt: `Emirati male endodontist aged about 50, trimmed salt-and-pepper beard, precise thoughtful expression, microscope softly blurred behind, ${portraitSuffix}.`,
  },
  dr6: {
    src: dr6Img,
    alt: { ar: "د. زهراء الأنصاري، استشارية طب أسنان الأطفال — المنامة", en: "Dr. Zahra Al-Ansari, Pediatric Dentistry Consultant — Manama" },
    width: 1248,
    height: 832,
    onError,
    prompt: `Bahraini female pediatric dentist aged about 36, dark hair tied back, kind reassuring smile, ${portraitSuffix}.`,
  },
  dr7: {
    src: dr7Img,
    alt: { ar: "د. فيصل العتيبي، استشاري جراحة اللثة والليزر — الرياض", en: "Dr. Faisal Al-Otaibi, Periodontics & Laser Consultant — Riyadh" },
    width: 1248,
    height: 832,
    onError,
    prompt: `Saudi male periodontist and laser surgeon aged about 47, black short hair and neat mustache, calm authoritative expression, ${portraitSuffix}.`,
  },
};

/* Before/after case photos (1920×1280) shown in the Results comparison slider. */
export interface BaPair {
  before: ImageAsset;
  after: ImageAsset;
}

export const BA_IMAGES: Record<"implant" | "veneers" | "aligners" | "whitening", BaPair> = {
  implant: {
    before: {
      src: implantBeforeImg,
      alt: { ar: "ابتسامة قبل زراعة السن — سن مفقود", en: "Smile before the implant — missing tooth" },
      width: 1920, height: 1280, onError,
    },
    after: {
      src: implantAfterImg,
      alt: { ar: "الابتسامة بعد الزراعة بتاج الزركونيا", en: "Smile after the implant with the zirconia crown" },
      width: 1920, height: 1280, onError,
    },
  },
  veneers: {
    before: {
      src: veneersBeforeImg,
      alt: { ar: "الابتسامة قبل تركيب عدسات الزركونيا", en: "Smile before the zirconia veneers" },
      width: 1920, height: 1280, onError,
    },
    after: {
      src: veneersAfterImg,
      alt: { ar: "الابتسامة بعد تركيب عدسات الزركونيا", en: "Smile after the zirconia veneers" },
      width: 1920, height: 1280, onError,
    },
  },
  aligners: {
    before: {
      src: alignersBeforeImg,
      alt: { ar: "الابتسامة قبل التقويم الشفاف", en: "Smile before the clear aligners" },
      width: 1920, height: 1280, onError,
    },
    after: {
      src: alignersAfterImg,
      alt: { ar: "الابتسامة بعد إكمال التقويم الشفاف", en: "Smile after completing the clear aligners" },
      width: 1920, height: 1280, onError,
    },
  },
  whitening: {
    before: {
      src: whiteningBeforeImg,
      alt: { ar: "الأسنان قبل جلسة التبييض", en: "Teeth before the whitening session" },
      width: 1920, height: 1280, onError,
    },
    after: {
      src: whiteningAfterImg,
      alt: { ar: "الأسنان بعد جلسة التبييض", en: "Teeth after the whitening session" },
      width: 1920, height: 1280, onError,
    },
  },
};
