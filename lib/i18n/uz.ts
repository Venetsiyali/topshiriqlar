export const uz = {
  app: {
    name: "PyRace",
    tagline: "Jonli dars poygasi — Python topshiriqlarini birga yeching",
  },
  home: {
    joinTitle: "Talaba",
    joinDesc: "O'qituvchi bergan PIN kodni kiriting",
    joinCta: "Sessiyaga kirish",
    hostTitle: "O'qituvchi",
    hostDesc: "Guruh, topshiriqlar va jonli sessiyalarni boshqaring",
    hostCta: "Kirish",
  },
  auth: {
    loginTitle: "O'qituvchi kirishi",
    registerTitle: "Ro'yxatdan o'tish",
    email: "Email",
    password: "Parol",
    fullName: "To'liq ism",
    login: "Kirish",
    register: "Ro'yxatdan o'tish",
    logout: "Chiqish",
    noAccount: "Akkauntingiz yo'qmi?",
    haveAccount: "Akkauntingiz bormi?",
    checkEmail: "Emailingizga tasdiqlash havolasi yuborildi. Tasdiqlab, keyin kiring.",
    invalidCredentials: "Email yoki parol noto'g'ri",
    passwordTooShort: "Parol kamida 6 belgidan iborat bo'lsin",
    genericError: "Xatolik yuz berdi. Qaytadan urinib ko'ring.",
    notConfigured: "Supabase sozlanmagan: muhit o'zgaruvchilarini kiriting.",
  },
  dashboard: {
    title: "Bosh sahifa",
    greeting: (name: string) => `Xush kelibsiz, ${name}!`,
    groups: "Guruhlar",
    quizzes: "Topshiriq to'plamlari",
    sessions: "Sessiyalar",
    newSession: "Yangi sessiya",
    comingSoon: "Keyingi bosqichda qo'shiladi",
  },
  join: {
    title: "Sessiyaga kirish",
    pinLabel: "6 raqamli PIN",
    submit: "Davom etish",
    invalidPin: "PIN 6 ta raqamdan iborat bo'lishi kerak",
  },
  play: {
    lobbyTitle: "Kutib turing, o'qituvchi boshlaydi",
    session: "Sessiya",
  },
} as const;

export type Dict = typeof uz;
