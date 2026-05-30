import {
  Activity,
  ArrowRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  Dumbbell,
  Filter,
  Flag,
  Gauge,
  Globe2,
  Languages,
  Menu,
  Palette,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  adminApi,
  authApi,
  badgeApi,
  fighterApi,
  gymApi,
  leaderboardApi,
  micCheckApi,
  notificationApi,
  seekApi,
  setAccessToken,
  tournamentApi,
  trainingApi,
  verificationApi,
} from "./lib/api";
import { createFightIdSocket } from "./lib/socket";

const navGroups = [
  { label: "Home", page: "Home" },
  {
    label: "Database",
    items: ["Fighters", "Rankings", "National Champions", "Gyms"],
  },
  {
    label: "Match",
    items: ["Compare", "Fight Board", "Tournaments"],
  },
];
const pagePaths = {
  Home: "/",
  Fighters: "/fighters",
  Rankings: "/rankings",
  Compare: "/compare",
  "Fight Board": "/fight-board",
  Tournaments: "/tournaments",
  Gyms: "/gyms",
  "National Champions": "/national-champions",
  "My Profile": "/profile",
  "Fighter Profile": "/fighters",
};
const pathToPage = (pathname) => {
  if (pathname === "/") return "Home";
  if (pathname.startsWith("/fighters/")) return "Fighter Profile";
  if (pathname.startsWith("/fighters")) return "Fighters";
  if (pathname.startsWith("/rankings")) return "Rankings";
  if (pathname.startsWith("/compare")) return "Compare";
  if (pathname.startsWith("/fight-board")) return "Fight Board";
  if (pathname.startsWith("/tournaments")) return "Tournaments";
  if (pathname.startsWith("/gyms")) return "Gyms";
  if (pathname.startsWith("/national-champions")) return "National Champions";
  if (pathname.startsWith("/profile")) return "My Profile";
  return "";
};
const fightIdLogo = "/assets/fightid-logo.svg";
const fallbackPortrait = fightIdLogo;
const fallbackCover = "/assets/hero-arena.png";
const fallbackFeaturedFighters = [
  { id: "fallback-resad", name: "Rəşad Məmmədov", nickname: "Qartal", country: "Azerbaijan", countryCode: "AZ", weightClass: "Lightweight", record: "8-1-0", points: 1420, rank: 1, status: "Pro", gym: "Bakı Combat Club", image: fallbackPortrait },
  { id: "fallback-tural", name: "Tural Həsənov", nickname: "Wolf", country: "Azerbaijan", countryCode: "AZ", weightClass: "Welterweight", record: "7-2-0", points: 1280, rank: 2, status: "Pro", gym: "Xəzər MMA", image: fallbackPortrait },
  { id: "fallback-kamran", name: "Kamran Əliyev", nickname: "Iron", country: "Azerbaijan", countryCode: "AZ", weightClass: "Middleweight", record: "6-1-1", points: 1185, rank: 3, status: "Amateur", gym: "Neftçi Fight Team", image: fallbackPortrait },
];
const refreshTokenStorageKey = "fightidRefreshToken";
const accessTokenStorageKey = "fightidAccessToken";
const userStorageKey = "fightidUser";
const settingsStorageKey = "fightidSettings";
const defaultSettings = {
  language: "az",
  theme: "dark",
  accent: "#dc1f26",
  compactMode: false,
  reduceMotion: false,
  showLiveErrors: true,
  notificationSound: false,
};
const languageOptions = [
  { value: "az", label: "AZ", name: "Azərbaycanca" },
  { value: "en", label: "EN", name: "English" },
  { value: "tr", label: "TR", name: "Türkçe" },
  { value: "ru", label: "RU", name: "Русский" },
];
const themeOptions = [
  { value: "dark", label: "Dark", description: "Classic FightID charcoal" },
  { value: "midnight", label: "Midnight", description: "Deeper black arena look" },
  { value: "contrast", label: "High Contrast", description: "Sharper text and panels" },
];
const accentOptions = [
  { value: "#dc1f26", label: "Blood Red" },
  { value: "#d6a21d", label: "Gold" },
  { value: "#18a999", label: "Teal" },
  { value: "#7c3aed", label: "Violet" },
];
const themePalettes = {
  dark: { canvas: "#07080a", panel: "#101114", elevated: "#111113", text: "#f4f0e8", border: "rgba(255,255,255,0.10)" },
  midnight: { canvas: "#02030a", panel: "#090b16", elevated: "#0d1020", text: "#f7f8ff", border: "rgba(117,139,255,0.22)" },
  contrast: { canvas: "#000000", panel: "#181818", elevated: "#202020", text: "#ffffff", border: "rgba(255,255,255,0.28)" },
};
const translations = {
  az: {
    settings: "Ayarlar",
    fightIdControls: "FightID idarə paneli",
    settingsDescription: "Bu brauzer üçün tema, dil, bildiriş və rahatlıq ayarları.",
    language: "Dil",
    theme: "Tema",
    accentColor: "Vurğu rəngi",
    otherSettings: "Digər ayarlar",
    resetSettings: "Ayarları sıfırla",
    search: "Axtarış",
    login: "Giriş",
    logout: "Çıxış",
    joinFightId: "FightID-ə qoşul",
    notifications: "Bildirişlər",
    markAllRead: "Hamısını oxunmuş et",
    noNotifications: "Hələ bildiriş yoxdur.",
    cards: "Kartlar",
    myFighters: "Mənim döyüşçülərim",
    compactMode: "Yığcam görünüş",
    compactModeDesc: "Sıx döyüşçü məlumatları üçün daha dar aralıqlar.",
    reduceMotion: "Animasiya azalt",
    reduceMotionDesc: "Animasiya və hover hərəkətlərini minimuma endir.",
    showLiveErrors: "Canlı API xətalarını göstər",
    showLiveErrorsDesc: "Backend bağlantı mesajlarını görünən saxla.",
    notificationSound: "Bildiriş səsi",
    notificationSoundDesc: "Gələcək bildiriş səsləri üçün hazırlıq.",
  },
  en: {
    settings: "Settings",
    fightIdControls: "FightID controls",
    settingsDescription: "Theme, language, notification, and comfort settings for this browser.",
    language: "Language",
    theme: "Theme",
    accentColor: "Accent color",
    otherSettings: "Other settings",
    resetSettings: "Reset settings",
    search: "Search",
    login: "Login",
    logout: "Logout",
    joinFightId: "Join FightID",
    notifications: "Notifications",
    markAllRead: "Mark all read",
    noNotifications: "No notifications yet.",
    cards: "Cards",
    myFighters: "My Fighters",
    compactMode: "Compact mode",
    compactModeDesc: "Tighter spacing for dense fighter data.",
    reduceMotion: "Reduce motion",
    reduceMotionDesc: "Minimize animation and hover movement.",
    showLiveErrors: "Show live API errors",
    showLiveErrorsDesc: "Keep backend connection messages visible.",
    notificationSound: "Notification sound",
    notificationSoundDesc: "Prepare sound alerts for future notifications.",
  },
  tr: {
    settings: "Ayarlar",
    fightIdControls: "FightID kontrolleri",
    settingsDescription: "Bu tarayıcı için tema, dil, bildirim ve kullanım ayarları.",
    language: "Dil",
    theme: "Tema",
    accentColor: "Vurgu rengi",
    otherSettings: "Diğer ayarlar",
    resetSettings: "Ayarları sıfırla",
    search: "Arama",
    login: "Giriş",
    logout: "Çıkış",
    joinFightId: "FightID'e katıl",
    notifications: "Bildirimler",
    markAllRead: "Tümünü okundu yap",
    noNotifications: "Henüz bildirim yok.",
    cards: "Kartlar",
    myFighters: "Dövüşçülerim",
    compactMode: "Kompakt mod",
    compactModeDesc: "Yoğun dövüşçü verileri için daha sıkı aralıklar.",
    reduceMotion: "Hareketi azalt",
    reduceMotionDesc: "Animasyon ve hover hareketlerini azalt.",
    showLiveErrors: "Canlı API hatalarını göster",
    showLiveErrorsDesc: "Backend bağlantı mesajlarını görünür tut.",
    notificationSound: "Bildirim sesi",
    notificationSoundDesc: "Gelecek bildirim sesleri için hazırlık.",
  },
  ru: {
    settings: "Настройки",
    fightIdControls: "Панель FightID",
    settingsDescription: "Тема, язык, уведомления и параметры удобства для этого браузера.",
    language: "Язык",
    theme: "Тема",
    accentColor: "Акцентный цвет",
    otherSettings: "Другие настройки",
    resetSettings: "Сбросить настройки",
    search: "Поиск",
    login: "Войти",
    logout: "Выйти",
    joinFightId: "Присоединиться",
    notifications: "Уведомления",
    markAllRead: "Отметить все",
    noNotifications: "Уведомлений пока нет.",
    cards: "Карты",
    myFighters: "Мои бойцы",
    compactMode: "Компактный режим",
    compactModeDesc: "Меньше отступов для плотных данных.",
    reduceMotion: "Меньше анимации",
    reduceMotionDesc: "Минимизировать анимации и движения.",
    showLiveErrors: "Показывать API ошибки",
    showLiveErrorsDesc: "Оставлять сообщения backend видимыми.",
    notificationSound: "Звук уведомлений",
    notificationSoundDesc: "Подготовка звуков для будущих уведомлений.",
  },
};

const phraseTranslations = {
  Home: { az: "Ana səhifə", tr: "Ana sayfa", ru: "Главная" },
  Database: { az: "Baza", tr: "Veritabanı", ru: "База" },
  Match: { az: "Uyğunlaşdırma", tr: "Eşleşme", ru: "Матчмейкинг" },
  "MMA records database": { az: "MMA rekord bazası", tr: "MMA kayıt veritabanı", ru: "База рекордов MMA" },
  "MMA fighter database": { az: "MMA döyüşçü bazası", tr: "MMA dövüşçü veritabanı", ru: "База бойцов MMA" },
  "Fight Records Database": { az: "Döyüş Rekord Bazası", tr: "Dövüş Kayıt Veritabanı", ru: "База боевых рекордов" },
  "Records. Rankings. Real matchups.": { az: "Rekordlar. Reytinqlər. Real uyğunlaşmalar.", tr: "Kayıtlar. Sıralamalar. Gerçek eşleşmeler.", ru: "Рекорды. Рейтинги. Реальные пары." },
  "Search Database": { az: "Bazadan axtar", tr: "Veritabanında ara", ru: "Искать в базе" },
  "Database snapshot": { az: "Baza icmalı", tr: "Veritabanı özeti", ru: "Сводка базы" },
  "Top ranked fighters": { az: "Ən yüksək reytinqli döyüşçülər", tr: "En yüksek sıralı dövüşçüler", ru: "Топ бойцов рейтинга" },
  "Full table": { az: "Tam cədvəl", tr: "Tam tablo", ru: "Полная таблица" },
  Discover: { az: "Kəşf et", tr: "Keşfet", ru: "Обзор" },
  "Fight Tools": { az: "Döyüş alətləri", tr: "Dövüş araçları", ru: "Инструменты" },
  Community: { az: "İcma", tr: "Topluluk", ru: "Сообщество" },
  Manage: { az: "İdarə", tr: "Yönetim", ru: "Управление" },
  Fighters: { az: "Döyüşçülər", tr: "Dövüşçüler", ru: "Бойцы" },
  Rankings: { az: "Reytinqlər", tr: "Sıralamalar", ru: "Рейтинги" },
  "National Champions": { az: "Milli çempionlar", tr: "Ulusal şampiyonlar", ru: "Национальные чемпионы" },
  Gyms: { az: "Zallar", tr: "Salonlar", ru: "Залы" },
  Compare: { az: "Müqayisə", tr: "Karşılaştır", ru: "Сравнить" },
  "Fight Board": { az: "Döyüş lövhəsi", tr: "Dövüş panosu", ru: "Доска боев" },
  Sparring: { az: "Sparrinq", tr: "Sparring", ru: "Спарринг" },
  Tournaments: { az: "Turnirlər", tr: "Turnuvalar", ru: "Турниры" },
  Challenges: { az: "Çağırışlar", tr: "Meydan okumalar", ru: "Вызовы" },
  Federation: { az: "Federasiya", tr: "Federasyon", ru: "Федерация" },
  "Mic Check 🎤": { az: "Mikrofon 🎤", tr: "Mikrofon 🎤", ru: "Микрофон 🎤" },
  "Fighter List": { az: "Döyüşçü siyahısı", tr: "Dövüşçü listesi", ru: "Список бойцов" },
  "Live fighter database": { az: "Canlı döyüşçü bazası", tr: "Canlı dövüşçü veritabanı", ru: "Живая база бойцов" },
  "All roles": { az: "Bütün rollar", tr: "Tüm roller", ru: "Все роли" },
  Pro: { az: "Pro", tr: "Pro", ru: "Про" },
  Amateur: { az: "Həvəskar", tr: "Amatör", ru: "Любитель" },
  "Compare Fighters": { az: "Döyüşçüləri müqayisə et", tr: "Dövüşçüleri karşılaştır", ru: "Сравнить бойцов" },
  "Head to Head": { az: "Üzbəüz", tr: "Kafa kafaya", ru: "Лицом к лицу" },
  "Tap a slot, search, then choose a fighter.": { az: "Slot seç, axtar, sonra döyüşçünü seç.", tr: "Bir slot seç, ara, sonra dövüşçüyü seç.", ru: "Выбери слот, найди и выбери бойца." },
  "Fighter 1": { az: "Döyüşçü 1", tr: "Dövüşçü 1", ru: "Боец 1" },
  "Fighter 2": { az: "Döyüşçü 2", tr: "Dövüşçü 2", ru: "Боец 2" },
  "Select Fighter 1": { az: "Döyüşçü 1 seç", tr: "Dövüşçü 1 seç", ru: "Выбери бойца 1" },
  "Select Fighter 2": { az: "Döyüşçü 2 seç", tr: "Dövüşçü 2 seç", ru: "Выбери бойца 2" },
  "Choose Fighter 1": { az: "Döyüşçü 1 üçün seç", tr: "Dövüşçü 1 için seç", ru: "Выбор бойца 1" },
  "Choose Fighter 2": { az: "Döyüşçü 2 üçün seç", tr: "Dövüşçü 2 için seç", ru: "Выбор бойца 2" },
  Clear: { az: "Sil", tr: "Temizle", ru: "Очистить" },
  Switch: { az: "Dəyiş", tr: "Değiştir", ru: "Сменить" },
  "Search fighters": { az: "Döyüşçü axtar", tr: "Dövüşçü ara", ru: "Поиск бойцов" },
  "Search by name, nickname, or gym": { az: "Ad, ləqəb və ya zal ilə axtar", tr: "İsim, lakap veya salon ile ara", ru: "Поиск по имени, прозвищу или залу" },
  "Verified MMA Fighter Platform": { az: "Təsdiqli MMA döyüşçü platforması", tr: "Doğrulanmış MMA dövüşçü platformu", ru: "Платформа проверенных MMA бойцов" },
  "View Fighters": { az: "Döyüşçülərə bax", tr: "Dövüşçüleri gör", ru: "Смотреть бойцов" },
  "Live Rankings": { az: "Canlı reytinqlər", tr: "Canlı sıralamalar", ru: "Живые рейтинги" },
  "Live rankings": { az: "Canlı reytinqlər", tr: "Canlı sıralamalar", ru: "Живые рейтинги" },
  Countries: { az: "Ölkələr", tr: "Ülkeler", ru: "Страны" },
  Active: { az: "Aktiv", tr: "Aktif", ru: "Активно" },
  "FightID is built like a serious combat sports database: verified fighter profiles, searchable amateur records, weight-class rankings, gym links, and clean discovery tools for real matchmaking.": {
    az: "FightID ciddi döyüş idmanı bazası kimi qurulub: təsdiqli döyüşçü profilləri, axtarıla bilən həvəskar rekordları, çəki reytinqləri, zal bağlantıları və real uyğunlaşma üçün təmiz kəşf alətləri.",
    tr: "FightID ciddi bir dövüş sporları veritabanı gibi kuruldu: doğrulanmış dövüşçü profilleri, aranabilir amatör kayıtları, kilo sıralamaları, salon bağlantıları ve gerçek eşleşme için temiz keşif araçları.",
    ru: "FightID построен как серьезная база единоборств: проверенные профили бойцов, поиск любительских рекордов, рейтинги по весам, связи с залами и чистые инструменты поиска для реального матчмейкинга.",
  },
  "Build a verified fighter identity, track real fight history, climb weight-class rankings, and challenge matched opponents through a confirmation-first fight system.": {
    az: "Təsdiqli döyüşçü kimliyi yarat, real döyüş tarixçəsini izlə, çəki reytinqlərində yüksəl və uyğun rəqiblərə çağırış göndər.",
    tr: "Doğrulanmış dövüşçü kimliği oluştur, gerçek dövüş geçmişini takip et, kilo sıralamalarında yüksel ve uygun rakiplere meydan oku.",
    ru: "Создай проверенный профиль бойца, отслеживай реальные бои, поднимайся в рейтинге и вызывай подходящих соперников.",
  },
  "Verified records": { az: "Təsdiqli rekordlar", tr: "Doğrulanmış kayıtlar", ru: "Проверенные рекорды" },
  "Amateur fighter index": { az: "Həvəskar döyüşçü indeksi", tr: "Amatör dövüşçü indeksi", ru: "Индекс любителей" },
  "Gym and country profiles": { az: "Zal və ölkə profilləri", tr: "Salon ve ülke profilleri", ru: "Профили залов и стран" },
  "Amateur-first profiles": { az: "Həvəskar öncəli profillər", tr: "Amatör odaklı profiller", ru: "Профили для любителей" },
  "Local discovery": { az: "Lokal kəşf", tr: "Yerel keşif", ru: "Локальный поиск" },
  "Keep fighter identities, gyms, countries, and fight histories organized in one public database.": {
    az: "Döyüşçü kimliklərini, zalları, ölkələri və döyüş tarixçələrini bir açıq bazada səliqəli saxla.",
    tr: "Dövüşçü kimliklerini, salonları, ülkeleri ve dövüş geçmişlerini tek açık veritabanında düzenli tut.",
    ru: "Храни профили бойцов, залы, страны и историю боев в одной открытой базе.",
  },
  "Give young and amateur fighters a clean profile page before they reach major promotions.": {
    az: "Gənc və həvəskar döyüşçülərə böyük promouterlərə çatmadan təmiz profil səhifəsi ver.",
    tr: "Genç ve amatör dövüşçülere büyük organizasyonlara çıkmadan temiz bir profil sayfası ver.",
    ru: "Дай молодым и любительским бойцам аккуратную страницу до крупных промоушенов.",
  },
  "Search fighters by country, gym, weight class, rank, and activity without noisy extras.": {
    az: "Döyüşçüləri ölkə, zal, çəki, reytinq və aktivliyə görə artıq səs-küy olmadan tap.",
    tr: "Dövüşçüleri ülke, salon, kilo, sıra ve aktivliğe göre gereksiz kalabalık olmadan bul.",
    ru: "Ищи бойцов по стране, залу, весу, рейтингу и активности без лишнего шума.",
  },
  "Challenge-ready profiles": { az: "Çağırışa hazır profillər", tr: "Meydan okumaya hazır profiller", ru: "Профили для вызова" },
  "Federation review": { az: "Federasiya yoxlaması", tr: "Federasyon incelemesi", ru: "Проверка федерации" },
  "Federation verified": { az: "Federasiya təsdiqli", tr: "Federasyon onaylı", ru: "Проверено федерацией" },
  "Pro badges are granted through admin and federation review, never self-declared.": {
    az: "Pro nişanları yalnız admin və federasiya yoxlaması ilə verilir, özü elan edilmir.",
    tr: "Pro rozetleri yalnızca admin ve federasyon incelemesiyle verilir, kullanıcı kendisi seçemez.",
    ru: "Pro-статус выдается только после проверки админом и федерацией.",
  },
  "Challenge workflow": { az: "Çağırış prosesi", tr: "Meydan okuma akışı", ru: "Процесс вызова" },
  "Send, counter, accept, confirm, and escalate disputed results in one flow.": {
    az: "Göndər, qarşı təklif et, qəbul et, təsdiqlə və mübahisəli nəticələri eyni axında yönləndir.",
    tr: "Gönder, karşı teklif ver, kabul et, onayla ve tartışmalı sonuçları tek akışta yönet.",
    ru: "Отправляй, предлагай ответ, принимай, подтверждай и передавай спорные результаты.",
  },
  "Weighted rankings": { az: "Çəkili reytinqlər", tr: "Ağırlıklı sıralamalar", ru: "Взвешенные рейтинги" },
  "Opponent rank, activity, and status influence weekly leaderboard movement.": {
    az: "Rəqib reytinqi, aktivlik və status həftəlik liderlik dəyişiminə təsir edir.",
    tr: "Rakip sırası, aktivlik ve statü haftalık lider tablosunu etkiler.",
    ru: "Рейтинг соперника, активность и статус влияют на недельную таблицу.",
  },
  "Fight notifications": { az: "Döyüş bildirişləri", tr: "Dövüş bildirimleri", ru: "Уведомления о боях" },
  "Challenge and ranking changes trigger in-app and email-ready events.": {
    az: "Çağırış və reytinq dəyişiklikləri tətbiqdaxili və email-ready bildirişlər yaradır.",
    tr: "Meydan okuma ve sıralama değişiklikleri uygulama içi ve e-posta hazır bildirimler üretir.",
    ru: "Изменения вызовов и рейтингов создают уведомления в приложении и для email.",
  },
  "Live top fighters": { az: "Canlı top döyüşçülər", tr: "Canlı top dövüşçüler", ru: "Лучшие бойцы" },
  "Ranked identities, real records.": { az: "Reytinqli profillər, real rekordlar.", tr: "Sıralı kimlikler, gerçek kayıtlar.", ru: "Рейтинговые профили, реальные рекорды." },
  "Full leaderboard": { az: "Tam liderlik cədvəli", tr: "Tam lider tablosu", ru: "Вся таблица" },
  Record: { az: "Rekord", tr: "Kayıt", ru: "Рекорд" },
  Points: { az: "Xallar", tr: "Puan", ru: "Очки" },
  Gym: { az: "Zal", tr: "Salon", ru: "Зал" },
  Country: { az: "Ölkə", tr: "Ülke", ru: "Страна" },
  Weight: { az: "Çəki", tr: "Kilo", ru: "Вес" },
  Status: { az: "Status", tr: "Durum", ru: "Статус" },
  Actions: { az: "Əməliyyatlar", tr: "İşlemler", ru: "Действия" },
  Opponent: { az: "Rəqib", tr: "Rakip", ru: "Соперник" },
  "Rule Set": { az: "Qaydalar", tr: "Kural seti", ru: "Правила" },
  Location: { az: "Məkan", tr: "Konum", ru: "Локация" },
  "Date Range": { az: "Tarix aralığı", tr: "Tarih aralığı", ru: "Диапазон дат" },
  Refresh: { az: "Yenilə", tr: "Yenile", ru: "Обновить" },
  Accept: { az: "Qəbul et", tr: "Kabul et", ru: "Принять" },
  Decline: { az: "Rədd et", tr: "Reddet", ru: "Отклонить" },
  Cancel: { az: "Ləğv et", tr: "İptal", ru: "Отмена" },
  "No actions": { az: "Əməliyyat yoxdur", tr: "İşlem yok", ru: "Нет действий" },
  "No challenges yet.": { az: "Hələ çağırış yoxdur.", tr: "Henüz meydan okuma yok.", ru: "Вызовов пока нет." },
  "Please login to continue": { az: "Davam etmək üçün giriş et", tr: "Devam etmek için giriş yap", ru: "Войдите, чтобы продолжить" },
  "Please login to view your challenges": { az: "Çağırışlarını görmək üçün giriş et", tr: "Meydan okumaları görmek için giriş yap", ru: "Войдите, чтобы увидеть вызовы" },
  "Challenge Center": { az: "Çağırış mərkəzi", tr: "Meydan okuma merkezi", ru: "Центр вызовов" },
  "Fight Wanted": { az: "Döyüş axtarılır", tr: "Dövüş aranıyor", ru: "Ищу бой" },
  "Sparring Finder": { az: "Sparrinq axtarışı", tr: "Sparring bulucu", ru: "Поиск спарринга" },
  "Seeking sparring partner": { az: "Sparrinq partnyoru axtarır", tr: "Sparring partneri arıyor", ru: "Ищет спарринг" },
  "Bracket Hub": { az: "Turnir mərkəzi", tr: "Turnuva merkezi", ru: "Турнирный центр" },
  "Gym Network": { az: "Zal şəbəkəsi", tr: "Salon ağı", ru: "Сеть залов" },
  "Gym Leaderboard": { az: "Zal liderliyi", tr: "Salon sıralaması", ru: "Рейтинг залов" },
  "Fight Talk": { az: "Döyüş söhbəti", tr: "Dövüş konuşması", ru: "Бойцовский разговор" },
  "Country #1 Fighters": { az: "Ölkə üzrə #1 döyüşçülər", tr: "Ülke #1 dövüşçüleri", ru: "Бойцы #1 по странам" },
  "Challenge this Fighter": { az: "Bu döyüşçüyə çağırış göndər", tr: "Bu dövüşçüye meydan oku", ru: "Вызвать бойца" },
  "Share Profile": { az: "Profili paylaş", tr: "Profili paylaş", ru: "Поделиться" },
  "Link copied!": { az: "Link kopyalandı!", tr: "Link kopyalandı!", ru: "Ссылка скопирована!" },
  "No recorded fights yet.": { az: "Hələ döyüş qeydi yoxdur.", tr: "Henüz dövüş kaydı yok.", ru: "Боёв пока нет." },
  "Training Activity": { az: "Məşq aktivliyi", tr: "Antrenman aktivitesi", ru: "Тренировочная активность" },
  "No training logs yet.": { az: "Hələ məşq qeydi yoxdur.", tr: "Henüz antrenman kaydı yok.", ru: "Тренировок пока нет." },
  "Collectible Fighter Card": { az: "Kolleksiya döyüşçü kartı", tr: "Koleksiyon dövüşçü kartı", ru: "Коллекционная карта" },
  Collect: { az: "Topla", tr: "Koleksiyona ekle", ru: "Собрать" },
  "Your Card": { az: "Sənin kartın", tr: "Senin kartın", ru: "Твоя карта" },
  "Federation Panel": { az: "Federasiya paneli", tr: "Federasyon paneli", ru: "Панель федерации" },
  "Federation Command": { az: "Federasiya idarəsi", tr: "Federasyon yönetimi", ru: "Управление федерации" },
  "Login required": { az: "Giriş tələb olunur", tr: "Giriş gerekli", ru: "Требуется вход" },
  "Access restricted": { az: "Giriş məhduddur", tr: "Erişim kısıtlı", ru: "Доступ ограничен" },
  "Pending Pro Verification": { az: "Gözləyən Pro təsdiqləri", tr: "Bekleyen Pro doğrulamaları", ru: "Ожидающие Pro проверки" },
  "Recent Fighters": { az: "Son döyüşçülər", tr: "Son dövüşçüler", ru: "Недавние бойцы" },
  Approve: { az: "Təsdiqlə", tr: "Onayla", ru: "Одобрить" },
  Reject: { az: "Rədd et", tr: "Reddet", ru: "Отклонить" },
  "Make Pro": { az: "Pro et", tr: "Pro yap", ru: "Сделать Pro" },
  "Admin only": { az: "Yalnız admin", tr: "Sadece admin", ru: "Только админ" },
  "Loading live FightID data": { az: "Canlı FightID məlumatları yüklənir", tr: "Canlı FightID verileri yükleniyor", ru: "Загрузка данных FightID" },
  "Live data unavailable": { az: "Canlı məlumat əlçatan deyil", tr: "Canlı veri kullanılamıyor", ru: "Данные недоступны" },
  "Failed to fetch": { az: "Bağlantı alınmadı", tr: "Veri alınamadı", ru: "Не удалось загрузить" },
  "Live sync is reconnecting. Showing a polished preview while the fight database comes back online.": {
    az: "Canlı bağlantı yenidən qurulur. Döyüş bazası qayıdana qədər səliqəli preview göstərilir.",
    tr: "Canlı bağlantı yeniden kuruluyor. Dövüş veritabanı dönene kadar düzenli bir önizleme gösteriliyor.",
    ru: "Живое подключение восстанавливается. Пока база возвращается, показан аккуратный preview.",
  },
  "Verified combat network for fighters, federations, and fight fans.": {
    az: "Döyüşçülər, federasiyalar və fanatlar üçün təsdiqli döyüş şəbəkəsi.",
    tr: "Dövüşçüler, federasyonlar ve fanlar için doğrulanmış dövüş ağı.",
    ru: "Проверенная бойцовская сеть для бойцов, федераций и фанатов.",
  },
};
const weightClassOptions = ["STRAWWEIGHT", "FLYWEIGHT", "BANTAMWEIGHT", "FEATHERWEIGHT", "LIGHTWEIGHT", "WELTERWEIGHT", "MIDDLEWEIGHT", "LIGHT_HEAVYWEIGHT", "HEAVYWEIGHT"];
const trainingTypeOptions = ["STRIKING", "GRAPPLING", "CONDITIONING", "SPARRING", "DRILLING", "RECOVERY", "OTHER"];
const BADGE_META = {
  FIRST_WIN: { label: "First Blood", emoji: "🩸", desc: "Won their first fight" },
  FIRST_KO: { label: "Lights Out", emoji: "💡", desc: "First KO/TKO victory" },
  FIRST_SUBMISSION: { label: "Tap Out", emoji: "🤙", desc: "First submission win" },
  WIN_STREAK_3: { label: "On Fire", emoji: "🔥", desc: "3 wins in a row" },
  WIN_STREAK_5: { label: "Unstoppable", emoji: "⚡", desc: "5 wins in a row" },
  WIN_STREAK_10: { label: "Wrecking Machine", emoji: "🤖", desc: "10 wins in a row" },
  UNDEFEATED: { label: "Perfect Record", emoji: "💎", desc: "Undefeated with 3+ fights" },
  VETERAN_10_FIGHTS: { label: "Veteran", emoji: "🎖️", desc: "10 fights on record" },
  VETERAN_25_FIGHTS: { label: "War Machine", emoji: "⚔️", desc: "25 fights on record" },
  KO_SPECIALIST: { label: "KO Artist", emoji: "💥", desc: "5+ KO/TKO wins" },
  SUBMISSION_SPECIALIST: { label: "Submission Wizard", emoji: "🧙", desc: "5+ submission wins" },
  DECISION_MASTER: { label: "Chess Player", emoji: "♟️", desc: "5+ decision wins" },
  POINTS_500: { label: "Silver Fighter", emoji: "🥈", desc: "Reached 500 points" },
  POINTS_1000: { label: "Gold Fighter", emoji: "🥇", desc: "Reached 1000 points" },
  POINTS_2000: { label: "Champion Class", emoji: "🏆", desc: "Reached 2000 points" },
  PLATFORM_PIONEER: { label: "Pioneer", emoji: "🚀", desc: "Among the first 100 fighters" },
};

function getFighterImage(url) {
  if (!url || url.includes("thispersondoesnotexist.com") || url.includes("fighter-portrait.png")) return fightIdLogo;
  return url;
}

function applyPageTranslations(language) {
  const targetLanguage = ["az", "en", "tr", "ru"].includes(language) ? language : "az";
  const reverse = new Map();

  Object.entries(phraseTranslations).forEach(([english, values]) => {
    reverse.set(english, english);
    Object.values(values).forEach((value) => reverse.set(value, english));
  });

  const translateValue = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return value;
    const english = reverse.get(trimmed);
    if (!english) return value;
    const translated = targetLanguage === "en" ? english : phraseTranslations[english]?.[targetLanguage] || english;
    return value.replace(trimmed, translated);
  };

  const root = document.getElementById("root");
  if (!root) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || ["SCRIPT", "STYLE", "TEXTAREA"].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const textNodes = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode);
  textNodes.forEach((node) => {
    const nextValue = translateValue(node.nodeValue);
    if (nextValue !== node.nodeValue) node.nodeValue = nextValue;
  });

  root.querySelectorAll("[placeholder]").forEach((element) => {
    const current = element.getAttribute("placeholder");
    const nextValue = translateValue(current || "");
    if (nextValue !== current) element.setAttribute("placeholder", nextValue);
  });
}

const countryNames = {
  AZ: "Azerbaijan",
  BR: "Brazil",
  US: "United States",
  BG: "Bulgaria",
  PL: "Poland",
  TR: "Turkey",
  GE: "Georgia",
  MA: "Morocco",
};

function formatWeightClass(value = "") {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatResult(value = "") {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("/");
}

function formatDate(value) {
  if (!value) return "TBD";
  return new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", year: "numeric" }).format(new Date(value));
}

function getStatus(fighter) {
  return fighter.isVerifiedPro || fighter.user?.role === "PRO" ? "Pro" : "Amateur";
}

function recordFromStats(stats) {
  const record = stats?.record || {};
  return `${record.wins || 0}-${record.losses || 0}-${record.draws || 0}`;
}

function methodsFromStats(stats) {
  const methods = stats?.methods || {};
  return [
    { label: "KO/TKO", value: methods.KO_TKO || 0, color: "bg-blood" },
    { label: "Submission", value: methods.SUBMISSION || 0, color: "bg-white" },
    { label: "Decision", value: methods.DECISION || 0, color: "bg-zinc-500" },
  ];
}

function normalizeCardFighter(fighter, index = 0) {
  return {
    id: fighter.id,
    name: fighter.fullName,
    nickname: fighter.nickname || "No nickname",
    country: countryNames[fighter.country] || fighter.country,
    countryCode: fighter.country,
    weightClass: formatWeightClass(fighter.weightClass),
    record: fighter.stats ? recordFromStats(fighter.stats) : fighter.record || "0-0-0",
    points: fighter.points || 0,
    rank: fighter.rank || index + 1,
    status: getStatus(fighter),
    federation: fighter.verifiedByFederation?.name || null,
    gym: fighter.gym || "Independent",
    image: getFighterImage(fighter.profilePhotoUrl),
  };
}

function Badge({ children, tone = "dark" }) {
  const tones = {
    dark: "border-white/10 bg-white/5 text-zinc-200",
    red: "border-blood/40 bg-blood/15 text-red-100",
    light: "border-white/15 bg-white/10 text-white",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${tones[tone]}`}>
      {children}
    </span>
  );
}

function Stat({ value, label }) {
  return (
    <div className="min-w-0 border-l border-white/10 pl-3 sm:pl-4">
      <div className="font-display text-2xl font-black text-white sm:text-4xl">{value}</div>
      <div className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">{label}</div>
    </div>
  );
}

function LoadingPanel({ label = "Loading live FightID data" }) {
  return (
    <div className="rounded border border-white/10 bg-panel p-6 text-sm font-semibold text-zinc-300">
      {label}...
    </div>
  );
}

function ErrorPanel({ message, action }) {
  return (
    <div className="rounded border border-blood/30 bg-blood/10 p-6">
      <h3 className="font-display text-xl font-black text-white">Live data unavailable</h3>
      <p className="mt-2 text-sm leading-6 text-red-100">{message}</p>
      {action && (
        <button onClick={action.onClick} className="mt-4 rounded border border-white/15 px-4 py-2 text-sm font-bold text-white hover:bg-white/10">
          {action.label}
        </button>
      )}
    </div>
  );
}

function getUserDisplayName(user) {
  return user?.fighterProfile?.fullName || user?.email || "Fighter";
}

function loadStoredSettings() {
  try {
    const stored = localStorage.getItem(settingsStorageKey);
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
  } catch {
    localStorage.removeItem(settingsStorageKey);
    return defaultSettings;
  }
}

function AuthModal({ initialTab = "login", onClose, onSuccess }) {
  const [tab, setTab] = useState(initialTab);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingVerification, setPendingVerification] = useState(null);
  const [emailCode, setEmailCode] = useState("");

  useEffect(() => {
    setTab(initialTab);
    setError("");
    setPendingVerification(null);
    setEmailCode("");
  }, [initialTab]);

  const handleAuthSuccess = (result) => {
    setAccessToken(result.accessToken);
    localStorage.setItem(refreshTokenStorageKey, result.refreshToken);
    localStorage.setItem(userStorageKey, JSON.stringify(result.user));
    onSuccess(result.user);
    onClose();
  };

  const submitLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await authApi.login(loginForm);
      if (result.requiresEmailCode) {
        setPendingVerification(result);
        setEmailCode(result.devCode || "");
      } else {
        handleAuthSuccess(result);
      }
    } catch (caught) {
      setError(caught.message);
    } finally {
      setLoading(false);
    }
  };

  const submitRegister = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    const payload = {
      fullName: registerForm.fullName,
      email: registerForm.email,
      password: registerForm.password,
    };

    try {
      const result = await authApi.register(payload);
      if (result.requiresEmailCode) {
        setPendingVerification(result);
        setEmailCode(result.devCode || "");
      } else {
        handleAuthSuccess(result);
      }
    } catch (caught) {
      setError(caught.message);
    } finally {
      setLoading(false);
    }
  };

  const submitEmailCode = async (event) => {
    event.preventDefault();
    if (!pendingVerification) return;
    setLoading(true);
    setError("");

    try {
      const result = await authApi.verifyEmailCode({
        email: pendingVerification.email,
        purpose: pendingVerification.purpose,
        code: emailCode,
      });
      handleAuthSuccess(result);
    } catch (caught) {
      setError(caught.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full rounded border border-white/10 bg-[#111113] px-4 py-3 text-sm font-semibold text-white outline-none placeholder:text-zinc-500 focus:border-blood";

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/75 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded border border-white/10 bg-[#111113] shadow-red">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <h2 className="font-display text-2xl font-black text-white">FightID Access</h2>
            <p className="mt-1 text-sm text-zinc-400">Log in or register your fighter account.</p>
          </div>
          <button onClick={onClose} className="rounded border border-white/15 p-2 text-white hover:bg-white/10" aria-label="Close auth modal">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 border-b border-white/10">
          {["login", "register"].map((item) => (
            <button
              key={item}
              onClick={() => {
                setTab(item);
                setError("");
                setPendingVerification(null);
                setEmailCode("");
              }}
              className={`px-4 py-4 text-sm font-black uppercase tracking-[0.16em] transition ${
                tab === item ? "bg-blood text-white" : "bg-white/[0.03] text-zinc-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-5 sm:p-6">
          {error && (
            <div className="mb-5 rounded border border-blood/40 bg-blood/15 px-4 py-3 text-sm font-semibold text-red-100">
              {error}
            </div>
          )}

          {pendingVerification ? (
            <form onSubmit={submitEmailCode} className="grid gap-4">
              <div className="rounded border border-white/10 bg-white/[0.03] p-4">
                <h3 className="font-display text-xl font-black text-white">Email verification</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  We sent a 6-digit FightID code to <span className="font-bold text-white">{pendingVerification.email}</span>. Enter it here to finish login.
                </p>
                {!pendingVerification.emailSent && pendingVerification.devCode && (
                  <p className="mt-3 rounded border border-yellow-400/30 bg-yellow-400/10 px-3 py-2 text-sm font-bold text-yellow-100">
                    Dev mode code: {pendingVerification.devCode}
                  </p>
                )}
              </div>
              <label className="grid gap-2 text-sm font-bold text-zinc-200">
                Verification code
                <input
                  required
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  value={emailCode}
                  onChange={(event) => setEmailCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  className={`${inputClass} text-center text-2xl tracking-[0.4em]`}
                  placeholder="000000"
                />
              </label>
              <button disabled={loading || emailCode.length !== 6} className="mt-2 rounded bg-blood px-5 py-4 text-sm font-black uppercase tracking-[0.14em] text-white shadow-red hover:bg-ember disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? "Verifying..." : "Verify and continue"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPendingVerification(null);
                  setEmailCode("");
                  setError("");
                }}
                className="rounded border border-white/15 px-5 py-3 text-sm font-black text-white hover:bg-white/10"
              >
                Back
              </button>
            </form>
          ) : tab === "login" ? (
            <form onSubmit={submitLogin} className="grid gap-4">
              <label className="grid gap-2 text-sm font-bold text-zinc-200">
                Email
                <input
                  required
                  type="email"
                  value={loginForm.email}
                  onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })}
                  className={inputClass}
                  placeholder="fighter@fightid.app"
                />
              </label>
              <label className="grid gap-2 text-sm font-bold text-zinc-200">
                Password
                <input
                  required
                  type="password"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })}
                  className={inputClass}
                  placeholder="Your password"
                />
              </label>
              <button disabled={loading} className="mt-2 rounded bg-blood px-5 py-4 text-sm font-black uppercase tracking-[0.14em] text-white shadow-red hover:bg-ember disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          ) : (
            <form onSubmit={submitRegister} className="grid gap-4">
              <div className="grid gap-4">
                <label className="grid gap-2 text-sm font-bold text-zinc-200">
                  Full name
                  <input
                    required
                    value={registerForm.fullName}
                    onChange={(event) => setRegisterForm({ ...registerForm, fullName: event.target.value })}
                    className={inputClass}
                    placeholder="Rəşad Məmmədov"
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold text-zinc-200">
                  Email
                  <input
                    required
                    type="email"
                    value={registerForm.email}
                    onChange={(event) => setRegisterForm({ ...registerForm, email: event.target.value })}
                    className={inputClass}
                    placeholder="fighter@fightid.app"
                  />
                </label>
                <label className="grid gap-2 text-sm font-bold text-zinc-200">
                  Password
                  <input
                    required
                    type="password"
                    value={registerForm.password}
                    onChange={(event) => setRegisterForm({ ...registerForm, password: event.target.value })}
                    className={inputClass}
                    placeholder="At least 8 characters"
                  />
                </label>
              </div>
              <p className="text-sm leading-6 text-zinc-400">
                Nickname, birth date, country, weight class, and gym can be completed later from your fighter profile.
              </p>
              <button disabled={loading} className="mt-2 rounded bg-blood px-5 py-4 text-sm font-black uppercase tracking-[0.14em] text-white shadow-red hover:bg-ember disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? "Creating account..." : "Register"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function SettingsPanel({ open, settings, onChange, onClose, t }) {
  if (!open) return null;

  const toggleRows = [
    { key: "compactMode", label: t.compactMode, description: t.compactModeDesc },
    { key: "reduceMotion", label: t.reduceMotion, description: t.reduceMotionDesc },
    { key: "showLiveErrors", label: t.showLiveErrors, description: t.showLiveErrorsDesc },
    { key: "notificationSound", label: t.notificationSound, description: t.notificationSoundDesc },
  ];

  return (
    <div className="fixed inset-0 z-[110] bg-black/70 backdrop-blur" role="dialog" aria-modal="true" aria-label="FightID settings">
      <button className="absolute inset-0 cursor-default" onClick={onClose} aria-label="Close settings" />
      <aside className="relative ml-auto flex h-full w-full max-w-md flex-col border-l border-white/10 bg-[#111113] shadow-red">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blood/40 bg-blood/15 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-red-100">
              <Settings size={14} />
              {t.settings}
            </div>
            <h2 className="mt-4 font-display text-3xl font-black text-white">{t.fightIdControls}</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">{t.settingsDescription}</p>
          </div>
          <button onClick={onClose} className="rounded border border-white/15 p-2 text-white hover:bg-white/10" aria-label="Close settings">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto p-5">
          <section>
            <div className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-white">
              <Languages size={17} />
              {t.language}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {languageOptions.map((language) => (
                <button
                  key={language.value}
                  onClick={() => onChange({ language: language.value })}
                  className={`rounded border px-4 py-3 text-left transition ${
                    settings.language === language.value ? "border-blood bg-blood/20 text-white" : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
                  }`}
                >
                  <span className="block text-sm font-black">{language.label}</span>
                  <span className="mt-1 block text-xs text-zinc-400">{language.name}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-white">
              <Palette size={17} />
              {t.theme}
            </div>
            <div className="grid gap-2">
              {themeOptions.map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => onChange({ theme: theme.value })}
                  className={`rounded border px-4 py-3 text-left transition ${
                    settings.theme === theme.value ? "border-blood bg-blood/20 text-white" : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
                  }`}
                >
                  <span className="block text-sm font-black">{theme.label}</span>
                  <span className="mt-1 block text-xs text-zinc-400">{theme.description}</span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-white">
              <SlidersHorizontal size={17} />
              {t.accentColor}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {accentOptions.map((accent) => (
                <button
                  key={accent.value}
                  onClick={() => onChange({ accent: accent.value })}
                  className={`flex items-center gap-3 rounded border px-4 py-3 text-left transition ${
                    settings.accent === accent.value ? "border-white bg-white/10 text-white" : "border-white/10 bg-white/5 text-zinc-300 hover:bg-white/10"
                  }`}
                >
                  <span className="h-5 w-5 rounded-full border border-white/30" style={{ backgroundColor: accent.value }} />
                  <span className="text-sm font-black">{accent.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <div className="mb-3 text-sm font-black uppercase tracking-[0.14em] text-white">{t.otherSettings}</div>
            {toggleRows.map((row) => (
              <label key={row.key} className="flex cursor-pointer items-center justify-between gap-4 rounded border border-white/10 bg-white/5 p-4 hover:bg-white/10">
                <span>
                  <span className="block text-sm font-black text-white">{row.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-zinc-400">{row.description}</span>
                </span>
                <input
                  type="checkbox"
                  checked={Boolean(settings[row.key])}
                  onChange={(event) => onChange({ [row.key]: event.target.checked })}
                  className="h-5 w-5 accent-[#dc1f26]"
                />
              </label>
            ))}
          </section>
        </div>

        <div className="border-t border-white/10 p-5">
          <button onClick={() => onChange(defaultSettings)} className="w-full rounded border border-white/15 px-5 py-3 text-sm font-black text-white hover:bg-white/10">
            {t.resetSettings}
          </button>
        </div>
      </aside>
    </div>
  );
}

function AppHeader({ page, setPage, user, settings, t, onSettingsClick, onLoginClick, onRegisterClick, onLogout }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationError, setNotificationError] = useState("");
  const notificationsRef = useRef(null);

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setNotificationsOpen(false);
      return;
    }

    notificationApi.list().then(setNotifications).catch(() => setNotifications([]));
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const toggleNotifications = async () => {
    const nextOpen = !notificationsOpen;
    setNotificationsOpen(nextOpen);
    setNotificationError("");

    if (nextOpen) {
      try {
        setNotifications(await notificationApi.list());
      } catch (caught) {
        setNotificationError(caught.message);
      }
    }
  };

  const markNotificationRead = async (notification) => {
    try {
      const updated = await notificationApi.markRead(notification.id);
      setNotifications((items) => items.map((item) => (item.id === updated.id ? updated : item)));
    } catch (caught) {
      setNotificationError(caught.message);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications((items) => items.map((item) => ({ ...item, isRead: true })));
    } catch (caught) {
      setNotificationError(caught.message);
    }
  };

  const NotificationBell = () => (
    <div className="relative" ref={notificationsRef}>
      <button onClick={toggleNotifications} className="relative rounded border border-white/15 p-2 text-white hover:bg-white/10" aria-label="Open notifications">
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-[#dc1f26] px-1 text-[10px] font-black text-white">
            {unreadCount}
          </span>
        )}
      </button>
      {notificationsOpen && (
        <div className="absolute right-0 top-12 z-[80] w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded border border-white/10 bg-[#111113] shadow-red">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 p-3">
            <span className="text-sm font-black uppercase tracking-[0.14em] text-white">{t.notifications}</span>
            <button onClick={markAllNotificationsRead} className="rounded bg-[#dc1f26] px-3 py-2 text-xs font-black text-white">
              {t.markAllRead}
            </button>
          </div>
          {notificationError && <div className="border-b border-blood/30 bg-blood/15 p-3 text-sm font-semibold text-red-100">{notificationError}</div>}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-sm text-zinc-400">{t.noNotifications}</div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => markNotificationRead(notification)}
                  className={`block w-full border-b border-white/10 p-4 text-left hover:bg-white/10 ${notification.isRead ? "bg-white/[0.02]" : "bg-blood/10"}`}
                >
                  <div className={`text-sm font-semibold ${notification.isRead ? "text-zinc-300" : "text-white"}`}>{notification.message}</div>
                  <div className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-zinc-500">{formatDate(notification.createdAt)}</div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-zinc-800 bg-[#09090b]/95 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-5">
        <button onClick={() => setPage("Home")} className="flex shrink-0 items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-sm bg-blood text-lg font-black text-white shadow-red">F</span>
          <span>
            <span className="block font-display text-lg font-black uppercase text-white">FightID</span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.24em] text-zinc-500 max-[420px]:hidden">MMA records database</span>
          </span>
        </button>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex">
          {navGroups.map((group) => {
            const isActive = group.page === page || group.items?.includes(page);

            if (group.page) {
              return (
                <button
                  key={group.label}
                  onClick={() => setPage(group.page)}
                  className={`rounded-sm border px-3 py-2 text-xs font-black uppercase tracking-[0.08em] transition xl:px-4 xl:text-sm ${
                    isActive ? "border-white bg-white text-black" : "border-transparent text-zinc-300 hover:border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {group.label}
                </button>
              );
            }

            return (
              <div key={group.label} className="group relative">
                <button
                  className={`inline-flex items-center gap-2 rounded-sm border px-3 py-2 text-xs font-black uppercase tracking-[0.08em] transition xl:px-4 xl:text-sm ${
                    isActive ? "border-white bg-white text-black" : "border-transparent text-zinc-300 hover:border-white/10 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {group.label}
                  <ChevronRight className="rotate-90" size={14} />
                </button>
                <div className="invisible absolute left-0 top-full z-[70] min-w-60 translate-y-2 rounded-sm border border-zinc-800 bg-[#111113] p-2 opacity-0 shadow-red transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  {group.items.map((item) => (
                    <button
                      key={item}
                      onClick={() => setPage(item)}
                      className={`block w-full rounded px-3 py-3 text-left text-sm font-bold transition ${
                        page === item ? "bg-white text-black" : "text-zinc-300 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <button onClick={() => setPage("Fighters")} className="inline-flex items-center gap-2 rounded-sm border border-white/15 px-3 py-2 text-sm font-bold text-white hover:bg-white/10">
            <Search size={16} />
            {t.search}
          </button>
          <button onClick={onSettingsClick} className="inline-flex items-center gap-2 rounded-sm border border-white/15 px-3 py-2 text-sm font-bold text-white hover:bg-white/10">
            <Settings size={16} />
            <span>{settings?.language?.toUpperCase() || "AZ"}</span>
          </button>
          {user ? (
            <div className="flex items-center gap-3">
              <NotificationBell />
              <span className="max-w-[180px] truncate text-sm font-bold text-white">{getUserDisplayName(user)}</span>
              <button onClick={() => setPage("My Profile")} className="rounded border border-white/15 px-3 py-2 text-xs font-black text-white hover:bg-white/10">My Profile</button>
              <button onClick={onLogout} className="rounded border border-white/15 px-4 py-2 text-sm font-black text-white hover:bg-white/10">
                {t.logout}
              </button>
            </div>
          ) : (
            <>
              <button onClick={onLoginClick} className="inline-flex items-center gap-2 rounded-sm border border-white/15 px-3 py-2 text-sm font-black text-white hover:bg-white/10">
                {t.login}
              </button>
              <button onClick={onRegisterClick} className="inline-flex items-center gap-2 rounded-sm bg-blood px-3 py-2 text-sm font-black text-white shadow-red hover:bg-ember">
                {t.joinFightId}
                <ArrowRight size={16} />
              </button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          {user ? (
            <button
              onClick={() => setOpen(!open)}
              className="max-w-[112px] truncate rounded border border-white/15 px-3 py-2 text-xs font-black text-white hover:bg-white/10 md:hidden"
            >
              {getUserDisplayName(user)}
            </button>
          ) : (
            <button
              onClick={onLoginClick}
              className="rounded bg-blood px-4 py-2 text-xs font-black text-white shadow-red hover:bg-ember md:hidden"
            >
              {t.login}
            </button>
          )}
          <button
            onClick={onSettingsClick}
            className="rounded border border-white/15 p-2 text-white hover:bg-white/10"
            aria-label="Open settings"
          >
            <Settings size={18} />
          </button>
          <button className="rounded border border-white/15 p-2 text-white lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-x-0 top-[73px] max-h-[calc(100vh-73px)] overflow-y-auto overscroll-contain border-t border-white/10 bg-canvas/95 px-4 py-3 shadow-red backdrop-blur-xl lg:hidden">
          {navGroups.map((group) => (
            <div key={group.label} className="py-1">
              {group.page ? (
                <button
                  onClick={() => {
                    setPage(group.page);
                    setOpen(false);
                  }}
                  className={`block w-full rounded px-3 py-3 text-left text-sm font-semibold ${
                    page === group.page ? "bg-white text-black" : "text-zinc-200 hover:bg-white/10"
                  }`}
                >
                  {group.label}
                </button>
              ) : (
                <>
                  <div className="px-3 pt-3 text-[11px] font-black uppercase tracking-[0.18em] text-zinc-500">{group.label}</div>
                  <div className="mt-1 grid gap-1">
                    {group.items.map((item) => (
                      <button
                        key={item}
                        onClick={() => {
                          setPage(item);
                          setOpen(false);
                        }}
                        className={`block w-full rounded px-3 py-2 text-left text-sm font-semibold ${
                          page === item ? "bg-white text-black" : "text-zinc-200 hover:bg-white/10"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
          <div className="mt-3 grid gap-2 border-t border-white/10 pt-3">
            <button
              onClick={() => {
                onSettingsClick();
                setOpen(false);
              }}
              className="block w-full rounded border border-white/15 px-3 py-3 text-left text-sm font-black text-white hover:bg-white/10"
            >
              {t.settings} / {settings?.language?.toUpperCase() || "AZ"}
            </button>
            {user ? (
              <>
                <div className="flex items-center justify-between rounded bg-white/5 px-3 py-3">
                  <span className="text-sm font-bold text-white">{getUserDisplayName(user)}</span>
                  <NotificationBell />
                </div>
                <button
                  onClick={() => {
                    setPage("My Profile");
                    setOpen(false);
                  }}
                  className="block w-full rounded border border-white/15 px-3 py-3 text-left text-sm font-black text-white hover:bg-white/10"
                >
                  My Profile
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setOpen(false);
                  }}
                  className="block w-full rounded border border-white/15 px-3 py-3 text-left text-sm font-black text-white hover:bg-white/10"
                >
                  {t.logout}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    onLoginClick();
                    setOpen(false);
                  }}
                  className="block w-full rounded border border-white/15 px-3 py-3 text-left text-sm font-black text-white hover:bg-white/10"
                >
                  {t.login}
                </button>
                <button
                  onClick={() => {
                    onRegisterClick();
                    setOpen(false);
                  }}
                  className="block w-full rounded bg-blood px-3 py-3 text-left text-sm font-black text-white shadow-red hover:bg-ember"
                >
                  {t.joinFightId}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function FighterCard({ fighter, onOpen }) {
  return (
    <article className="group overflow-hidden rounded-sm border border-zinc-800 bg-[#101113] shadow-[0_18px_45px_rgba(0,0,0,0.22)] transition hover:border-blood/50">
      <button onClick={() => onOpen?.(fighter.id)} className="block w-full text-left">
        <div className="flex gap-4 border-b border-zinc-800 p-4">
          <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-sm border border-zinc-700 bg-black sm:h-32 sm:w-28">
            <img src={fighter.image} alt={fighter.name} className="h-full w-full object-cover opacity-90 transition duration-500 group-hover:scale-105" />
            <div className="absolute inset-x-0 bottom-0 bg-blood/90 py-1 text-center text-[10px] font-black uppercase tracking-[0.16em] text-white">
              #{fighter.rank}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={fighter.status === "Pro" ? "red" : "dark"}>{fighter.status}</Badge>
              <span className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">{fighter.countryCode} / {fighter.weightClass}</span>
            </div>
            <h3 className="mt-3 truncate font-display text-2xl font-black text-white">{fighter.name}</h3>
            <p className="mt-1 truncate text-sm font-semibold text-zinc-400">"{fighter.nickname}"</p>
            <div className="mt-4 grid grid-cols-3 divide-x divide-zinc-800 rounded-sm border border-zinc-800 bg-black/25">
              <div className="px-3 py-2">
                <div className="text-lg font-black text-white">{fighter.record}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500">Record</div>
              </div>
              <div className="px-3 py-2">
                <div className="text-lg font-black text-white">{fighter.points}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500">Points</div>
              </div>
              <div className="px-3 py-2">
                <div className="truncate text-lg font-black text-white">{fighter.gym}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.14em] text-zinc-500">Gym</div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">{fighter.country}</span>
          <span className="text-xs font-black uppercase tracking-[0.14em] text-red-100">View profile</span>
        </div>
      </button>
    </article>
  );
}

function LandingPage({ setPage, openProfile }) {
  const [fighters, setFighters] = useState([]);
  const [stats, setStats] = useState({ fighters: "Live", fights: "Active", countries: "Live" });
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    Promise.all([fighterApi.leaderboard({ limit: 3 }), fighterApi.list({ limit: 100 })])
      .then(([leaderboardResult, fighterResult]) => {
        if (ignore) return;
        const leaders = leaderboardResult.data || [];
        const allFighters = fighterResult.data || [];
        setFighters(leaders.map(normalizeCardFighter));
        setStats({
          fighters: fighterResult.pagination?.total || allFighters.length || leaderboardResult.pagination?.total || leaders.length,
          fights: "Active",
          countries: new Set(allFighters.map((fighter) => fighter.country)).size || "Live",
        });
      })
      .catch((caught) => {
        if (ignore) return;
        setFighters(fallbackFeaturedFighters);
        setStats({ fighters: "10+", fights: "Active", countries: "1+" });
        setError(caught.message);
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <main>
      <section className="relative min-h-[88vh] overflow-hidden pt-24">
        <img src="/assets/hero-arena.png" alt="MMA arena walkout" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#07080a_0%,rgba(7,8,10,.94)_37%,rgba(7,8,10,.58)_70%,rgba(7,8,10,.92)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-canvas to-transparent" />

        <div className="relative mx-auto grid min-h-[calc(88vh-6rem)] max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
          <div className="w-full max-w-[calc(100vw-2rem)] sm:max-w-3xl">
            <Badge tone="red">MMA fighter database</Badge>
            <h1 className="mt-6 max-w-4xl font-display text-5xl font-black leading-[1.02] text-white sm:text-7xl lg:text-7xl xl:text-8xl">Fight Records Database</h1>
            <p className="mt-6 max-w-[calc(100vw-2rem)] break-words text-lg leading-8 text-zinc-300 sm:max-w-2xl sm:text-xl">
              FightID is built like a serious combat sports database: verified fighter profiles, searchable amateur records, weight-class rankings, gym links, and clean discovery tools for real matchmaking.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => setPage("Fighters")} className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-blood px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-white shadow-red hover:bg-ember sm:w-auto">
                Search Database
                <ChevronRight size={18} />
              </button>
              <button onClick={() => setPage("Rankings")} className="inline-flex w-full items-center justify-center gap-2 rounded-sm border border-white/15 bg-white/5 px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-white hover:bg-white/10 sm:w-auto">
                Rankings
              </button>
            </div>
          </div>
          <div className="hidden rounded-sm border border-zinc-800 bg-[#101113]/95 p-4 shadow-[0_24px_70px_rgba(0,0,0,0.35)] backdrop-blur lg:block">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.18em] text-blood">Database snapshot</div>
                <h2 className="mt-1 font-display text-2xl font-black text-white">Top ranked fighters</h2>
              </div>
              <button onClick={() => setPage("Rankings")} className="rounded-sm border border-white/15 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-white hover:bg-white/10">
                Full table
              </button>
            </div>
            <div className="mt-3 divide-y divide-zinc-800">
              {(fighters.length ? fighters : fallbackFeaturedFighters).slice(0, 5).map((fighter, index) => (
                <button key={fighter.id} onClick={() => openProfile?.(fighter.id)} className="grid w-full grid-cols-[3rem_1fr_auto] items-center gap-3 py-3 text-left hover:bg-white/[0.03]">
                  <div className="text-center font-display text-2xl font-black text-zinc-500">#{fighter.rank || index + 1}</div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-black text-white">{fighter.name}</div>
                    <div className="mt-1 truncate text-xs font-bold uppercase tracking-[0.12em] text-zinc-500">{fighter.countryCode || fighter.country} / {fighter.weightClass}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-white">{fighter.record}</div>
                    <div className="text-[10px] font-black uppercase tracking-[0.12em] text-blood">{fighter.points} pts</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 border-y border-zinc-800 py-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="grid max-w-2xl grid-cols-3 gap-2 sm:gap-4">
            <Stat value={stats.fighters} label="Fighters" />
            <Stat value={stats.countries} label="Countries" />
            <Stat value={stats.fights} label="Active" />
          </div>
          <div className="flex max-w-3xl flex-wrap gap-2 text-xs font-black uppercase tracking-[0.14em] text-zinc-300">
            {["Verified records", "Amateur fighter index", "Live rankings", "Gym and country profiles"].map((item) => (
              <span key={item} className="rounded-sm border border-white/10 bg-black/30 px-3 py-2 backdrop-blur">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-4 lg:grid-cols-4">
          {[
            [ShieldCheck, "Verified records", "Keep fighter identities, gyms, countries, and fight histories organized in one public database."],
            [Activity, "Amateur-first profiles", "Give young and amateur fighters a clean profile page before they reach major promotions."],
            [Gauge, "Weighted rankings", "Opponent rank, activity, and status influence weekly leaderboard movement."],
            [Globe2, "Local discovery", "Search fighters by country, gym, weight class, rank, and activity without noisy extras."],
          ].map(([Icon, title, text]) => (
            <div key={title} className="rounded-sm border border-zinc-800 bg-[#101113] p-5">
              <Icon className="text-blood" size={24} />
              <h3 className="mt-4 font-display text-lg font-bold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <Badge>Fighter index</Badge>
            <h2 className="mt-4 font-display text-3xl font-black text-white sm:text-5xl">Ranked identities, real records.</h2>
          </div>
          <button onClick={() => setPage("Rankings")} className="inline-flex w-fit items-center gap-2 rounded-sm border border-white/15 px-4 py-3 text-sm font-bold text-white hover:bg-white/10">
            Full leaderboard
            <ArrowRight size={16} />
          </button>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {error && (
            <div className="md:col-span-3 rounded border border-white/10 bg-white/[0.03] p-4 text-sm font-semibold text-zinc-300">
              Live sync is reconnecting. Showing a polished preview while the fight database comes back online.
            </div>
          )}
          {!error && fighters.length === 0 && <div className="md:col-span-3"><LoadingPanel /></div>}
          {fighters.map((fighter) => (
            <FighterCard key={fighter.id} fighter={fighter} onOpen={openProfile} />
          ))}
        </div>
      </section>
    </main>
  );
}

function FightersPage({ openProfile }) {
  const [fighters, setFighters] = useState([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [weightClass, setWeightClass] = useState("");
  const [country, setCountry] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
    setLoading(true);
    setError("");

    fighterApi
      .list({ limit: 24, search, role, weightClass, country })
      .then((result) => {
        setFighters((result.data || []).map(normalizeCardFighter));
      })
      .catch((caught) => {
        if (caught.name !== "AbortError") {
          setFighters(fallbackFeaturedFighters);
          setError(caught.message);
        }
      })
      .finally(() => setLoading(false));

    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [search, role, weightClass, country]);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 pt-32 sm:px-6 lg:px-8">
      <div className="border-b border-zinc-800 pb-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge tone="red">Live fighter database</Badge>
          <h1 className="mt-4 font-display text-4xl font-black text-white sm:text-6xl">Fighter Database</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
            Search records, gyms, countries, points and profile status in one compact combat-sports index.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, nickname, or gym"
            className="rounded-sm border border-zinc-800 bg-[#101113] px-4 py-3 text-sm font-semibold text-white outline-none placeholder:text-zinc-500 focus:border-blood"
          />
          <select value={role} onChange={(event) => setRole(event.target.value)} className="rounded-sm border border-zinc-800 bg-[#101113] px-4 py-3 text-sm font-semibold text-white outline-none focus:border-blood">
            <option value="">All roles</option>
            <option value="PRO">Pro</option>
            <option value="AMATEUR">Amateur</option>
          </select>
          <button onClick={() => setShowFilters((value) => !value)} className="inline-flex items-center justify-center gap-2 rounded-sm border border-white/15 px-4 py-3 text-sm font-black text-white hover:bg-white/10">
            <Filter size={16} />
            Filter
          </button>
        </div>
        </div>
        {showFilters && (
          <div className="mt-5 grid gap-3 rounded-sm border border-zinc-800 bg-black/20 p-4 sm:grid-cols-4">
            <select value={weightClass} onChange={(event) => setWeightClass(event.target.value)} className="rounded-sm border border-zinc-800 bg-[#101113] px-4 py-3 text-sm font-semibold text-white outline-none focus:border-blood">
              <option value="">All weight classes</option>
              {weightClassOptions.map((item) => <option key={item} value={item}>{formatWeightClass(item)}</option>)}
            </select>
            <input value={country} onChange={(event) => setCountry(event.target.value.toUpperCase().slice(0, 2))} placeholder="Country e.g. AZ" className="rounded-sm border border-zinc-800 bg-[#101113] px-4 py-3 text-sm font-semibold text-white outline-none placeholder:text-zinc-500 focus:border-blood" />
            <select value={role} onChange={(event) => setRole(event.target.value)} className="rounded-sm border border-zinc-800 bg-[#101113] px-4 py-3 text-sm font-semibold text-white outline-none focus:border-blood">
              <option value="">All roles</option>
              <option value="PRO">Pro</option>
              <option value="AMATEUR">Amateur</option>
            </select>
            <button onClick={() => { setSearch(""); setRole(""); setWeightClass(""); setCountry(""); }} className="rounded-sm border border-white/15 px-4 py-3 text-sm font-black text-white hover:bg-white/10">
              Clear Filters
            </button>
          </div>
        )}
        <div className="mt-5 grid grid-cols-2 gap-3 text-xs font-black uppercase tracking-[0.14em] text-zinc-500 sm:grid-cols-4">
          <div className="rounded-sm border border-zinc-800 bg-black/20 px-3 py-2">Verified profiles</div>
          <div className="rounded-sm border border-zinc-800 bg-black/20 px-3 py-2">Amateur records</div>
          <div className="rounded-sm border border-zinc-800 bg-black/20 px-3 py-2">Country ranks</div>
          <div className="rounded-sm border border-zinc-800 bg-black/20 px-3 py-2">Gym links</div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {loading && <div className="md:col-span-2 xl:col-span-3"><LoadingPanel label="Fetching fighters from /api/fighters" /></div>}
        {error && (
          <div className="lg:col-span-2 rounded-sm border border-white/10 bg-white/[0.03] p-4 text-sm font-semibold text-zinc-300">
            Live sync is reconnecting. Showing a polished preview while the fighter database comes back online.
          </div>
        )}
        {!loading && !error && fighters.length === 0 && <div className="md:col-span-2 xl:col-span-3"><LoadingPanel label="No fighters matched this filter" /></div>}
        {fighters.map((fighter) => (
          <FighterCard key={fighter.id} fighter={fighter} onOpen={openProfile} />
        ))}
      </div>
    </main>
  );
}

function MethodBar({ method, total }) {
  const width = total > 0 ? `${Math.round((method.value / total) * 100)}%` : "0%";
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm">
        <span className="font-bold text-white">{method.label}</span>
        <span className="text-zinc-400">{method.value} wins</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full ${method.color}`} style={{ width }} />
      </div>
    </div>
  );
}

function SimpleFeaturePage({ title, badge, loader, renderItem, empty = "Nothing here yet.", user, loginRequired = false, onLoginClick }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (loginRequired && !user) {
      setLoading(false);
      return;
    }
    let ignore = false;
    setLoading(true);
    loader()
      .then((result) => {
        if (!ignore) setItems(result?.data || result || []);
      })
      .catch((caught) => {
        if (!ignore) setError(caught.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [user, loginRequired]);

  if (loginRequired && !user) {
    return <main className="mx-auto min-h-screen max-w-7xl px-4 pt-32 sm:px-6 lg:px-8"><div className="rounded border border-white/10 bg-[#111113] p-8"><Badge tone="red">{badge}</Badge><h1 className="mt-5 font-display text-4xl font-black text-white">Please login to continue</h1><button onClick={onLoginClick} className="mt-6 rounded bg-[#dc1f26] px-5 py-3 font-black text-white">Login</button></div></main>;
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 pt-32 sm:px-6 lg:px-8">
      {badge && <Badge tone="red">{badge}</Badge>}
      {title && <h1 className="mt-4 font-display text-4xl font-black text-white sm:text-6xl">{title}</h1>}
      {loading && <div className="mt-8"><LoadingPanel /></div>}
      {error && <div className="mt-8"><ErrorPanel message={error} /></div>}
      {!loading && !error && items.length === 0 && <div className="mt-8 rounded border border-white/10 bg-[#111113] p-8 text-zinc-400">{empty}</div>}
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{items.map(renderItem)}</div>
    </main>
  );
}

function MyProfilePage({ user, onLoginClick, onUserUpdate }) {
  const profile = user?.fighterProfile;
  const [form, setForm] = useState(() => ({
    fullName: profile?.fullName || "",
    nickname: profile?.nickname || "",
    dateOfBirth: profile?.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : "",
    country: profile?.country || "AZ",
    weightClass: profile?.weightClass || "LIGHTWEIGHT",
    gym: profile?.gym || "",
    bio: profile?.bio || "",
    instagramUrl: profile?.instagramUrl || "",
    youtubeUrl: profile?.youtubeUrl || "",
    coverPhotoUrl: profile?.coverPhotoUrl || "",
  }));
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profile) return;
    setForm({
      fullName: profile.fullName || "",
      nickname: profile.nickname || "",
      dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.slice(0, 10) : "",
      country: profile.country || "AZ",
      weightClass: profile.weightClass || "LIGHTWEIGHT",
      gym: profile.gym || "",
      bio: profile.bio || "",
      instagramUrl: profile.instagramUrl || "",
      youtubeUrl: profile.youtubeUrl || "",
      coverPhotoUrl: profile.coverPhotoUrl || "",
    });
  }, [profile]);

  if (!user) {
    return (
      <main className="mx-auto min-h-screen max-w-7xl px-4 pt-32 sm:px-6 lg:px-8">
        <div className="rounded-sm border border-white/10 bg-[#111113] p-8">
          <Badge tone="red">Profile</Badge>
          <h1 className="mt-5 font-display text-4xl font-black text-white">Login to edit your fighter profile</h1>
          <button onClick={onLoginClick} className="mt-6 rounded-sm bg-blood px-5 py-3 font-black text-white">Login</button>
        </div>
      </main>
    );
  }

  const inputClass = "w-full rounded-sm border border-white/10 bg-[#111113] px-4 py-3 text-sm font-semibold text-white outline-none placeholder:text-zinc-500 focus:border-blood";

  const updateField = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const saveProfile = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      let updatedProfile = await fighterApi.updateMe({
        fullName: form.fullName,
        nickname: form.nickname || null,
        dateOfBirth: form.dateOfBirth || undefined,
        country: (form.country || "AZ").toUpperCase(),
        weightClass: form.weightClass || "LIGHTWEIGHT",
        gym: form.gym || null,
        bio: form.bio || null,
        instagramUrl: form.instagramUrl || null,
        youtubeUrl: form.youtubeUrl || null,
        coverPhotoUrl: form.coverPhotoUrl || null,
      });

      let uploadWarning = "";
      if (photoFile) {
        try {
          updatedProfile = await fighterApi.uploadPhoto(photoFile);
          setPhotoFile(null);
        } catch (caught) {
          uploadWarning = caught.message?.includes("Cloudinary")
            ? "Photo upload skipped because Cloudinary storage is not configured on the server."
            : `Photo upload failed: ${caught.message}`;
          setPhotoFile(null);
        }
      }

      const nextUser = { ...user, fighterProfile: { ...user.fighterProfile, ...updatedProfile } };
      localStorage.setItem(userStorageKey, JSON.stringify(nextUser));
      onUserUpdate(nextUser);
      setMessage(uploadWarning || "Profile updated.");
    } catch (caught) {
      setError(caught.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 pt-32 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <aside className="self-start rounded-sm border border-zinc-800 bg-[#101113] p-5">
          <Badge tone="red">Fighter Profile</Badge>
          <img src={getFighterImage(profile?.profilePhotoUrl)} alt={form.fullName} className="mt-5 h-72 w-full rounded-sm border border-white/10 object-cover" />
          <label className="mt-4 block rounded-sm border border-white/10 bg-white/[0.03] p-4 text-sm font-bold text-zinc-200">
            Profile photo
            <input type="file" accept="image/*" onChange={(event) => setPhotoFile(event.target.files?.[0] || null)} className="mt-3 block w-full text-sm text-zinc-400 file:mr-4 file:rounded-sm file:border-0 file:bg-blood file:px-4 file:py-2 file:font-black file:text-white" />
          </label>
          <p className="mt-4 text-sm leading-6 text-zinc-400">Complete these details so your public fighter page looks real and useful.</p>
        </aside>

        <section className="rounded-sm border border-zinc-800 bg-[#101113] p-5 sm:p-6">
          <div>
            <Badge>My Profile</Badge>
            <h1 className="mt-4 font-display text-4xl font-black text-white sm:text-5xl">Edit Fighter Profile</h1>
          </div>

          {message && <div className="mt-6 rounded-sm border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-100">{message}</div>}
          {error && <div className="mt-6 rounded-sm border border-blood/40 bg-blood/15 px-4 py-3 text-sm font-bold text-red-100">{error}</div>}

          <form onSubmit={saveProfile} className="mt-6 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-bold text-zinc-200">
                Full name
                <input required value={form.fullName} onChange={(event) => updateField("fullName", event.target.value)} className={inputClass} />
              </label>
              <label className="grid gap-2 text-sm font-bold text-zinc-200">
                Nickname
                <input value={form.nickname} onChange={(event) => updateField("nickname", event.target.value)} className={inputClass} placeholder="Optional" />
              </label>
              <label className="grid gap-2 text-sm font-bold text-zinc-200">
                Date of birth
                <input type="date" value={form.dateOfBirth} onChange={(event) => updateField("dateOfBirth", event.target.value)} className={inputClass} />
              </label>
              <label className="grid gap-2 text-sm font-bold text-zinc-200">
                Country
                <input value={form.country} onChange={(event) => updateField("country", event.target.value.toUpperCase())} className={inputClass} maxLength={2} />
              </label>
              <label className="grid gap-2 text-sm font-bold text-zinc-200">
                Weight class
                <select value={form.weightClass} onChange={(event) => updateField("weightClass", event.target.value)} className={inputClass}>
                  {weightClassOptions.map((value) => <option key={value} value={value}>{formatWeightClass(value)}</option>)}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold text-zinc-200">
                Gym / club
                <input value={form.gym} onChange={(event) => updateField("gym", event.target.value)} className={inputClass} placeholder="Bakı Combat Club" />
              </label>
              <label className="grid gap-2 text-sm font-bold text-zinc-200 sm:col-span-2">
                Bio
                <textarea value={form.bio} onChange={(event) => updateField("bio", event.target.value)} className={`${inputClass} min-h-28 resize-y`} placeholder="Short fighter bio" />
              </label>
              <label className="grid gap-2 text-sm font-bold text-zinc-200">
                Instagram URL
                <input value={form.instagramUrl} onChange={(event) => updateField("instagramUrl", event.target.value)} className={inputClass} placeholder="https://instagram.com/..." />
              </label>
              <label className="grid gap-2 text-sm font-bold text-zinc-200">
                YouTube URL
                <input value={form.youtubeUrl} onChange={(event) => updateField("youtubeUrl", event.target.value)} className={inputClass} placeholder="https://youtube.com/..." />
              </label>
              <label className="grid gap-2 text-sm font-bold text-zinc-200 sm:col-span-2">
                Cover photo URL
                <input value={form.coverPhotoUrl} onChange={(event) => updateField("coverPhotoUrl", event.target.value)} className={inputClass} placeholder="https://..." />
              </label>
            </div>

            <button disabled={loading} className="rounded-sm bg-blood px-5 py-4 text-sm font-black uppercase tracking-[0.14em] text-white shadow-red hover:bg-ember disabled:opacity-60">
              {loading ? "Saving..." : "Save profile"}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

function HeadToHead() {
  const [query, setQuery] = useState("");
  const [fighters, setFighters] = useState([]);
  const [left, setLeft] = useState(null);
  const [right, setRight] = useState(null);
  const [activeSlot, setActiveSlot] = useState("left");
  const [loadingPick, setLoadingPick] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fighterApi
        .list({ search: query, limit: 10 })
        .then((r) => setFighters(r.data || []))
        .catch(() => setFighters([]));
    }, 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const selectFighter = async (id) => {
    setLoadingPick(id);
    try {
      const selected = await fighterApi.get(id);
      if (activeSlot === "left") {
        setLeft(selected);
        setActiveSlot("right");
      } else {
        setRight(selected);
        setActiveSlot("left");
      }
      setQuery("");
      setFighters([]);
    } finally {
      setLoadingPick("");
    }
  };

  const clearSlot = (slot) => {
    if (slot === "left") setLeft(null);
    else setRight(null);
    setActiveSlot(slot);
  };

  const rows = left && right ? [["Record", recordFromStats(left.stats), recordFromStats(right.stats)], ["Points", left.points, right.points], ["KO/TKO wins", left.stats?.methods?.KO_TKO || 0, right.stats?.methods?.KO_TKO || 0], ["Submission wins", left.stats?.methods?.SUBMISSION || 0, right.stats?.methods?.SUBMISSION || 0], ["Decision wins", left.stats?.methods?.DECISION || 0, right.stats?.methods?.DECISION || 0], ["Weight class", formatWeightClass(left.weightClass), formatWeightClass(right.weightClass)], ["Status", getStatus(left), getStatus(right)], ["Country", left.country, right.country]] : [];

  const slots = [
    { key: "left", label: "Fighter 1", fighter: left },
    { key: "right", label: "Fighter 2", fighter: right },
  ];

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 pt-28 sm:px-6 sm:pt-32 lg:px-8">
      <Badge tone="red">Head to Head</Badge>
      <h1 className="mt-4 font-display text-3xl font-black text-white sm:text-6xl">Compare Fighters</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400 sm:mt-3 sm:text-base">Tap a slot, search, then choose a fighter.</p>

      <div className="mt-5 grid grid-cols-2 gap-3 md:mt-8 md:gap-5">
        {slots.map((slot) => (
          <button
            key={slot.key}
            onClick={() => setActiveSlot(slot.key)}
            className={`rounded border p-3 text-left transition sm:p-5 ${
              activeSlot === slot.key ? "border-blood bg-blood/10 shadow-red" : "border-white/10 bg-[#111113] hover:bg-white/10"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <Badge tone={activeSlot === slot.key ? "red" : "dark"}>{slot.label}</Badge>
              {slot.fighter && (
                <span
                  onClick={(event) => {
                    event.stopPropagation();
                    clearSlot(slot.key);
                  }}
                  className="rounded border border-white/15 px-2 py-1 text-[10px] font-black text-white hover:bg-white/10 sm:px-3 sm:py-2 sm:text-xs"
                >
                  Clear
                </span>
              )}
            </div>
            {slot.fighter ? (
              <>
                <img src={getFighterImage(slot.fighter.profilePhotoUrl)} className="mt-3 h-28 w-full rounded object-cover sm:mt-5 sm:h-64" />
                <h2 className="mt-3 line-clamp-2 font-display text-lg font-black leading-tight text-white sm:mt-4 sm:text-3xl">{slot.fighter.fullName}</h2>
                <p className="mt-1 text-xs text-zinc-400 sm:text-sm">{recordFromStats(slot.fighter.stats)} / {formatWeightClass(slot.fighter.weightClass)}</p>
              </>
            ) : (
              <div className="mt-3 grid h-28 place-items-center rounded border border-dashed border-white/15 bg-white/[0.03] px-2 text-center text-sm text-zinc-400 sm:mt-5 sm:h-64 sm:text-base">
                Select {slot.label}
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="mt-5 rounded border border-white/10 bg-[#111113] p-4 sm:mt-8 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-black text-white sm:text-2xl">Choose {activeSlot === "left" ? "Fighter 1" : "Fighter 2"}</h2>
            <p className="mt-1 hidden text-sm text-zinc-400 sm:block">Search by name, nickname, gym, or country.</p>
          </div>
          <button onClick={() => setActiveSlot(activeSlot === "left" ? "right" : "left")} className="shrink-0 rounded border border-white/15 px-3 py-2 text-xs font-black text-white hover:bg-white/10 sm:px-4 sm:py-3 sm:text-sm">
            Switch
          </button>
        </div>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search fighters" className="mt-4 w-full rounded border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-blood sm:mt-5" />
        <div className="mt-3 grid max-h-72 gap-2 overflow-y-auto pr-1 sm:mt-4 sm:grid-cols-2 sm:gap-3 sm:overflow-visible lg:grid-cols-5">
          {fighters.map((fighter) => (
            <button key={fighter.id} disabled={loadingPick === fighter.id} onClick={() => selectFighter(fighter.id)} className="rounded border border-white/10 bg-white/[0.03] p-3 text-left text-white hover:bg-white/10 disabled:opacity-60">
              <span className="block font-black">{fighter.fullName}</span>
              <span className="mt-1 block text-xs text-zinc-500">{formatWeightClass(fighter.weightClass)} / {fighter.country}</span>
            </button>
          ))}
        </div>
      </div>

      {rows.length > 0 && (
        <div className="mt-5 rounded border border-white/10 bg-[#111113] p-4 sm:mt-8 sm:p-5">
          {rows.map(([label, l, r]) => (
            <div key={label} className="grid grid-cols-3 border-b border-white/10 py-3 text-center text-sm text-white sm:text-base">
              <span>{l}</span>
              <b>{label}</b>
              <span>{r}</span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
function FightSeekBoard() {
  return <SimpleFeaturePage title="Fight Board" badge="Fight Wanted" loader={() => seekApi.list({ limit: 30 })} empty="No fight listings for this weight class yet. Be the first to post." renderItem={(item) => <div key={item.id} className="rounded border border-white/10 bg-[#111113] p-5"><h3 className="font-display text-2xl font-black text-white">{item.fighter.fullName}</h3><p className="mt-2 text-zinc-400">{formatWeightClass(item.weightClass)} · {formatResult(item.ruleSet)} · {item.location}</p><p className="mt-3 text-sm text-zinc-500">{item.message}</p></div>} />;
}

function SparringFinder() {
  return <SimpleFeaturePage title="Sparring Finder" badge="Sparring" loader={() => fighterApi.list({ seekingSparring: "true", limit: 30 })} empty="No fighters are looking for sparring right now." renderItem={(fighter) => <div key={fighter.id} className="rounded border border-white/10 bg-[#111113] p-5"><img src={getFighterImage(fighter.profilePhotoUrl)} className="h-48 w-full rounded object-cover" /><h3 className="mt-4 font-display text-2xl font-black text-white">{fighter.fullName}</h3><p className="mt-2 text-zinc-400">{fighter.sparringLocation || fighter.country}</p><p className="mt-2 text-sm text-emerald-300">Seeking sparring partner</p></div>} />;
}

function TournamentHub() {
  return <SimpleFeaturePage title="Tournaments" badge="Bracket Hub" loader={() => tournamentApi.list({ limit: 30 })} empty="No tournaments yet." renderItem={(item) => <div key={item.id} className="rounded border border-white/10 bg-[#111113] p-5"><Badge tone="red">{item.status}</Badge><h3 className="mt-4 font-display text-2xl font-black text-white">{item.name}</h3><p className="mt-2 text-zinc-400">{formatWeightClass(item.weightClass)} · {formatResult(item.ruleSet)} · {item.size} slots</p></div>} />;
}

function GymHub() {
  const [tab, setTab] = useState("gyms");
  return <main className="mx-auto min-h-screen max-w-7xl px-4 pt-32 sm:px-6 lg:px-8"><Badge tone="red">Gym Network</Badge><h1 className="mt-4 font-display text-4xl font-black text-white sm:text-6xl">Gyms</h1><div className="mt-6 flex gap-3"><button onClick={() => setTab("gyms")} className="rounded bg-[#dc1f26] px-5 py-3 font-black text-white">Gyms</button><button onClick={() => setTab("leaderboard")} className="rounded border border-white/10 px-5 py-3 font-black text-white">Gym Leaderboard</button></div><SimpleFeaturePage title="" badge="" loader={tab === "gyms" ? () => gymApi.list({ limit: 30 }) : gymApi.leaderboard} empty="No gyms yet." renderItem={(gym) => <div key={gym.id} className="rounded border border-white/10 bg-[#111113] p-5"><h3 className="font-display text-2xl font-black text-white">{gym.name}</h3><p className="mt-2 text-zinc-400">{gym.city}, {gym.country}</p><p className="mt-2 text-sm text-zinc-500">{gym.fighterCount || 0} fighters · {gym.totalPoints || 0} points</p></div>} /></main>;
}

function MicCheckFeed({ user }) {
  const emojis = ["🔥", "💀", "😂", "🥶", "👊"];
  return <SimpleFeaturePage title="Mic Check 🎤" badge="Fight Talk" loader={micCheckApi.feed} empty="No Mic Checks yet." user={user} renderItem={(item) => <div key={item.id} className="rounded border border-blood/30 bg-[#111113] p-5"><div className="flex gap-4"><img src={getFighterImage(item.fighter.profilePhotoUrl)} className="h-20 w-20 rounded object-cover" /><div><h3 className="font-display text-2xl font-black text-white">{item.fighter.fullName}</h3><p className="text-zinc-400">{formatWeightClass(item.challenge.weightClass)} · {formatResult(item.challenge.ruleSet)}</p></div></div><p className="mt-5 text-2xl font-black italic text-white">"{item.message}"</p><div className="mt-5 flex gap-2">{emojis.map((emoji) => <button key={emoji} onClick={() => user && micCheckApi.react(item.id, emoji)} className="rounded border border-white/10 px-3 py-2 text-white">{emoji} {item.reactionCounts?.[emoji] || 0}</button>)}</div></div>} />;
}

function NationalChampions({ openProfile }) {
  const [data, setData] = useState({});
  const [weight, setWeight] = useState("LIGHTWEIGHT");
  useEffect(() => { leaderboardApi.national().then(setData).catch(() => setData({})); }, []);
  const rows = data[weight] || [];
  return <main className="mx-auto min-h-screen max-w-7xl px-4 pt-32 sm:px-6 lg:px-8"><Badge tone="red">National Champions</Badge><h1 className="mt-4 font-display text-4xl font-black text-white sm:text-6xl">Country #1 Fighters</h1><div className="mt-6 flex gap-2 overflow-x-auto">{weightClassOptions.map((item) => <button key={item} onClick={() => setWeight(item)} className={`rounded px-4 py-2 text-sm font-black ${weight === item ? "bg-[#dc1f26] text-white" : "border border-white/10 text-zinc-300"}`}>{formatWeightClass(item)}</button>)}</div><div className="mt-8 overflow-hidden rounded border border-white/10 bg-[#111113]"><table className="w-full text-left text-sm"><tbody>{rows.map((row) => <tr key={row.country} className="border-b border-white/10"><td className="p-4 text-white">{row.country}</td><td className="p-4"><button onClick={() => openProfile(row.fighter.id)} className="font-bold text-white">{row.fighter.fullName}</button></td><td className="p-4 text-zinc-300">{row.fighter.points} pts</td></tr>)}</tbody></table></div></main>;
}

function FighterProfilePage({ fighterId, openProfile, user, onLoginRequired }) {
  const [profile, setProfile] = useState(null);
  const [countryRank, setCountryRank] = useState("Live");
  const [weightRank, setWeightRank] = useState("Live");
  const [shareCopied, setShareCopied] = useState(false);
  const [badges, setBadges] = useState([]);
  const [nationalChampion, setNationalChampion] = useState(null);
  const [training, setTraining] = useState(null);
  const [trainingModalOpen, setTrainingModalOpen] = useState(false);
  const [trainingForm, setTrainingForm] = useState({
    type: "STRIKING",
    durationMins: "60",
    date: new Date().toISOString().slice(0, 10),
    note: "",
  });
  const [trainingSaving, setTrainingSaving] = useState(false);
  const [trainingError, setTrainingError] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError("");

    const loadProfile = async () => {
      const id = fighterId || (await fighterApi.list({ limit: 1 })).data?.[0]?.id;
      if (!id) throw new Error("No fighters returned by the API.");

      const fighter = await fighterApi.get(id);
      const [countryBoard, weightBoard] = await Promise.all([
        fighterApi.leaderboard({ country: fighter.country }),
        fighterApi.leaderboard({ weightClass: fighter.weightClass, role: getStatus(fighter).toUpperCase() }),
      ]);

      if (ignore) return;
      setProfile(fighter);
      setCountryRank(countryBoard.data?.find((item) => item.id === fighter.id)?.rank || "Live");
      setWeightRank(weightBoard.data?.find((item) => item.id === fighter.id)?.rank || "Live");
    };

    loadProfile()
      .catch((caught) => {
        if (!ignore) setError(caught.message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [fighterId]);

  useEffect(() => {
    if (!profile) return;
    badgeApi.forFighter(profile.id).then(setBadges).catch(() => setBadges([]));
    leaderboardApi.isChampion(profile.id).then(setNationalChampion).catch(() => setNationalChampion(null));
    trainingApi.forFighter(profile.id).then(setTraining).catch(() => setTraining(null));
  }, [profile]);

  const reloadTraining = async () => {
    if (!profile?.id) return;
    setTraining(await trainingApi.forFighter(profile.id));
  };

  const submitTraining = async (event) => {
    event.preventDefault();
    setTrainingSaving(true);
    setTrainingError("");
    try {
      await trainingApi.log({
        type: trainingForm.type,
        durationMins: Number(trainingForm.durationMins),
        date: trainingForm.date,
        note: trainingForm.note || undefined,
      });
      await reloadTraining();
      setTrainingModalOpen(false);
      setTrainingForm({ type: "STRIKING", durationMins: "60", date: new Date().toISOString().slice(0, 10), note: "" });
    } catch (caught) {
      setTrainingError(caught.message);
    } finally {
      setTrainingSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto min-h-screen max-w-7xl px-4 pt-32 sm:px-6 lg:px-8">
        <LoadingPanel label="Fetching fighter profile from /api/fighters/:id" />
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto min-h-screen max-w-7xl px-4 pt-32 sm:px-6 lg:px-8">
        <ErrorPanel message={error} action={{ label: "Browse fighters", onClick: () => openProfile(null) }} />
      </main>
    );
  }

  const methods = methodsFromStats(profile.stats);
  const totalMethodWins = methods.reduce((sum, method) => sum + method.value, 0);
  const status = getStatus(profile);
  const record = profile.stats?.record || {};
  const fightHistory = profile.fights || [];

  const shareProfile = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 1800);
    } catch {
      setShareCopied(false);
    }
  };

  return (
    <main className="pt-20">
      <section className="relative min-h-[520px] overflow-hidden">
        <img src={profile.coverPhotoUrl || fallbackCover} alt={`${profile.fullName} cover`} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#07080a_0%,rgba(7,8,10,.78)_45%,rgba(7,8,10,.52)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-canvas to-transparent" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[320px_1fr] lg:px-8">
          <div className="overflow-hidden rounded border border-white/10 bg-panel shadow-red">
            <img src={getFighterImage(profile.profilePhotoUrl)} alt={profile.fullName} className="h-[410px] w-full object-cover" />
          </div>
          <div className="flex flex-col justify-end pb-4">
            <div className="flex flex-wrap gap-3">
              <Badge tone={status === "Pro" ? "red" : "dark"}><ShieldCheck className="mr-2" size={14} /> {status}</Badge>
              {profile.verifiedByFederation?.name && <Badge>{profile.verifiedByFederation.name}</Badge>}
              <Badge tone="light">🎖️ {badges.length} badges</Badge>
            </div>
            <h1 className="mt-5 font-display text-5xl font-black leading-none text-white sm:text-7xl">{profile.fullName}</h1>
            {nationalChampion?.isChampion && (
              <div className="mt-5 rounded border border-yellow-300/40 bg-yellow-400/20 px-5 py-4 text-lg font-black text-yellow-100">
                🥇 {profile.country} National Champion · {formatWeightClass(profile.weightClass)}
              </div>
            )}
            <p className="mt-3 text-2xl font-bold text-zinc-300">"{profile.nickname || "No nickname"}"</p>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-zinc-300">{profile.bio || "Verified FightID fighter profile."}</p>
            <div className="mt-7 flex flex-wrap gap-3 text-sm font-bold text-zinc-300">
              <span className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2"><Flag size={16} /> {profile.country} {countryNames[profile.country] || profile.country}</span>
              <span className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2"><Dumbbell size={16} /> {formatWeightClass(profile.weightClass)}</span>
              <span className="inline-flex items-center gap-2 rounded border border-white/10 bg-white/5 px-3 py-2"><Globe2 size={16} /> {profile.gym || "Independent"}</span>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={shareProfile} className="inline-flex items-center justify-center gap-2 rounded border border-white/15 bg-white/5 px-6 py-4 text-sm font-black uppercase tracking-[0.12em] text-white hover:bg-white/10">
                <ArrowRight size={18} />
                {shareCopied ? "Link copied!" : "Share Profile"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
          <div className="grid gap-5">
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded border border-white/10 bg-panel p-5">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Record</div>
                <div className="mt-2 font-display text-4xl font-black text-white">{record.wins || 0}-{record.losses || 0}-{record.draws || 0}</div>
              </div>
              <div className="rounded border border-white/10 bg-panel p-5">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Points</div>
                <div className="mt-2 font-display text-4xl font-black text-white">{profile.points || 0}</div>
              </div>
              <div className="rounded border border-white/10 bg-panel p-5">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Country rank</div>
                <div className="mt-2 font-display text-4xl font-black text-white">#{countryRank}</div>
              </div>
              <div className="rounded border border-white/10 bg-panel p-5">
                <div className="text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Weight rank</div>
                <div className="mt-2 font-display text-4xl font-black text-white">#{weightRank}</div>
              </div>
            </div>

            <div className="rounded border border-white/10 bg-panel p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-black text-white">Win method breakdown</h2>
                  <p className="mt-1 text-sm text-zinc-400">Verified wins grouped by finish type.</p>
                </div>
                <Activity className="text-blood" />
              </div>
              <div className="mt-6 grid gap-5">
                {methods.map((method) => (
                  <MethodBar key={method.label} method={method} total={totalMethodWins} />
                ))}
              </div>
            </div>

            <div className="overflow-hidden rounded border border-white/10 bg-panel">
              <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-display text-2xl font-black text-white">Fight history</h2>
                  <p className="mt-1 text-sm text-zinc-400">Confirmed bouts and federation-reviewed records.</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.16em] text-zinc-500">
                    <tr>
                      {["Date", "Opponent", "Event", "Result", "Method", "Round", "Time"].map((head) => (
                        <th key={head} className="px-5 py-4 font-black">{head}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {fightHistory.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-8 text-center font-semibold text-zinc-400">No recorded fights yet.</td>
                      </tr>
                    ) : (
                      fightHistory.map((fight) => (
                        <tr key={fight.id} className="text-zinc-300">
                          <td className="px-5 py-4 font-semibold">{formatDate(fight.fightDate)}</td>
                          <td className="px-5 py-4 text-white">{fight.opponentName}</td>
                          <td className="px-5 py-4">{fight.eventName}</td>
                          <td className="px-5 py-4">
                            <span className={`rounded px-2 py-1 text-xs font-black ${fight.result === "WIN" ? "bg-emerald-500/15 text-emerald-300" : "bg-blood/15 text-red-200"}`}>{formatResult(fight.result)}</span>
                          </td>
                          <td className="px-5 py-4">{formatResult(fight.method)}</td>
                          <td className="px-5 py-4">{fight.round}</td>
                          <td className="px-5 py-4">{fight.fightTime}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded border border-white/10 bg-panel p-5">
              <h2 className="font-display text-2xl font-black text-white">Badges</h2>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {Object.entries(BADGE_META).map(([type, meta]) => {
                  const earned = badges.find((badge) => badge.type === type);
                  return (
                    <div key={type} title={`${meta.desc}${earned ? ` · Earned ${formatDate(earned.earnedAt)}` : ""}`} className={`rounded border border-white/10 bg-white/5 p-4 text-center ${earned ? "opacity-100" : "opacity-30"}`}>
                      <div className="text-3xl">{earned ? meta.emoji : "🔒"}</div>
                      <div className="mt-2 text-xs font-black uppercase tracking-[0.12em] text-white">{meta.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded border border-white/10 bg-panel p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-display text-2xl font-black text-white">Training Activity</h2>
                  <p className="mt-1 text-sm text-zinc-400">
                    This month: {training?.summary?.totalSessionsThisMonth || 0} sessions · {Number(training?.summary?.totalHoursThisMonth || 0).toFixed(1)} hours
                  </p>
                </div>
                {user?.fighterProfile?.id === profile.id && <button onClick={() => setTrainingModalOpen(true)} className="rounded bg-[#dc1f26] px-5 py-3 font-black text-white">Log Training Session</button>}
              </div>
              <div className="mt-5 grid gap-3">
                {(training?.data || []).slice(0, 10).map((log) => (
                  <div key={log.id} className="rounded border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
                    <b className="text-white">{formatResult(log.type)}</b> · {log.durationMins} mins · {formatDate(log.date)}
                    {log.note && <p className="mt-1 text-zinc-400">{log.note}</p>}
                  </div>
                ))}
                {(!training?.data || training.data.length === 0) && <p className="text-sm text-zinc-500">No training logs yet.</p>}
              </div>
            </div>
          </div>

          <aside className="grid gap-5 self-start">
            <div className="rounded border border-white/10 bg-panel p-5">
              <h2 className="font-display text-xl font-black text-white">Profile status</h2>
              <div className="mt-5 grid gap-3">
                {[
                  `${status} status from backend`,
                  profile.verifiedByFederation?.name || "Public amateur profile",
                  profile.isVerifiedPro ? "Pro verification active" : "Amateur profile active",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm font-semibold text-zinc-300">
                    <CheckCircle2 className="text-emerald-400" size={18} />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded border border-white/10 bg-panel p-5">
              <h2 className="font-display text-xl font-black text-white">Social links</h2>
              <div className="mt-4 grid gap-3">
                {profile.instagramUrl && (
                  <a href={profile.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded border border-white/10 px-4 py-3 text-left text-sm font-bold text-white hover:bg-white/10">
                    Instagram <span className="text-zinc-400">Open</span>
                  </a>
                )}
                {profile.youtubeUrl && (
                  <a href={profile.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded border border-white/10 px-4 py-3 text-left text-sm font-bold text-white hover:bg-white/10">
                    YouTube <span className="text-zinc-400">Open</span>
                  </a>
                )}
                {!profile.instagramUrl && !profile.youtubeUrl && <p className="text-sm font-semibold text-zinc-500">No public social links yet.</p>}
              </div>
            </div>
          </aside>
        </div>
      </section>
      {trainingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 px-4 backdrop-blur">
          <form onSubmit={submitTraining} className="mx-auto mt-20 max-w-lg rounded border border-white/10 bg-[#111113] p-6 shadow-red">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-2xl font-black text-white">Log Training Session</h2>
              <button type="button" onClick={() => setTrainingModalOpen(false)} className="rounded border border-white/15 p-2 text-white hover:bg-white/10"><X size={18} /></button>
            </div>
            {trainingError && <div className="mt-4 rounded border border-blood/40 bg-blood/15 p-3 text-sm font-semibold text-red-100">{trainingError}</div>}
            <div className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm font-bold text-white">
                Type
                <select value={trainingForm.type} onChange={(event) => setTrainingForm((form) => ({ ...form, type: event.target.value }))} className="w-full rounded border border-white/10 bg-white/5 px-4 py-3 text-white">
                  {trainingTypeOptions.map((item) => <option key={item} value={item}>{formatResult(item)}</option>)}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-bold text-white">
                Duration in minutes
                <input type="number" min="1" max="480" value={trainingForm.durationMins} onChange={(event) => setTrainingForm((form) => ({ ...form, durationMins: event.target.value }))} className="w-full rounded border border-white/10 bg-white/5 px-4 py-3 text-white" required />
              </label>
              <label className="grid gap-2 text-sm font-bold text-white">
                Date
                <input type="date" value={trainingForm.date} onChange={(event) => setTrainingForm((form) => ({ ...form, date: event.target.value }))} className="w-full rounded border border-white/10 bg-white/5 px-4 py-3 text-white" />
              </label>
              <label className="grid gap-2 text-sm font-bold text-white">
                Note
                <textarea value={trainingForm.note} onChange={(event) => setTrainingForm((form) => ({ ...form, note: event.target.value }))} maxLength={500} rows={4} className="w-full rounded border border-white/10 bg-white/5 px-4 py-3 text-white" placeholder="Optional session note" />
              </label>
            </div>
            <button disabled={trainingSaving} className="mt-5 w-full rounded bg-[#dc1f26] px-5 py-3 font-black text-white disabled:opacity-60">
              {trainingSaving ? "Saving..." : "Save Training"}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}

function RankingsPage({ openProfile }) {
  const [fighters, setFighters] = useState([]);
  const [role, setRole] = useState("");
  const [weightClass, setWeightClass] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");

    fighterApi
      .leaderboard({ limit: 50, role, weightClass })
      .then((result) => {
        setFighters((result.data || []).map(normalizeCardFighter));
      })
      .catch((caught) => setError(caught.message))
      .finally(() => setLoading(false));
  }, [role, weightClass]);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 pt-32 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge tone="red">Live Rankings</Badge>
          <h1 className="mt-4 font-display text-4xl font-black text-white sm:text-6xl">Rankings</h1>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <select value={role} onChange={(event) => setRole(event.target.value)} className="rounded border border-white/10 bg-canvas px-4 py-3 text-sm font-semibold text-white outline-none focus:border-blood">
            <option value="">All roles</option>
            <option value="PRO">Pro</option>
            <option value="AMATEUR">Amateur</option>
          </select>
          <select value={weightClass} onChange={(event) => setWeightClass(event.target.value)} className="rounded border border-white/10 bg-canvas px-4 py-3 text-sm font-semibold text-white outline-none focus:border-blood">
            <option value="">All weights</option>
            {["LIGHTWEIGHT", "WELTERWEIGHT", "MIDDLEWEIGHT", "FLYWEIGHT", "BANTAMWEIGHT", "FEATHERWEIGHT"].map((value) => (
              <option key={value} value={value}>{formatWeightClass(value)}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded border border-white/10 bg-panel">
        {loading && <div className="p-5"><LoadingPanel label="Fetching rankings from /api/fighters/leaderboard" /></div>}
        {error && <div className="p-5"><ErrorPanel message={error} /></div>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[840px] text-left text-sm">
              <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.16em] text-zinc-500">
                <tr>
                  {["Rank", "Fighter", "Status", "Country", "Weight", "Gym", "Points"].map((head) => (
                    <th key={head} className="px-5 py-4 font-black">{head}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {fighters.map((fighter) => (
                  <tr key={fighter.id} className="text-zinc-300">
                    <td className="px-5 py-4 font-display text-2xl font-black text-white">#{fighter.rank}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => openProfile(fighter.id)} className="font-bold text-white hover:text-red-100">{fighter.name}</button>
                      <div className="text-xs text-zinc-500">"{fighter.nickname}"</div>
                    </td>
                    <td className="px-5 py-4"><Badge tone={fighter.status === "Pro" ? "red" : "dark"}>{fighter.status}</Badge></td>
                    <td className="px-5 py-4">{fighter.country}</td>
                    <td className="px-5 py-4">{fighter.weightClass}</td>
                    <td className="px-5 py-4">{fighter.gym}</td>
                    <td className="px-5 py-4 font-black text-white">{fighter.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

function FederationPanel({ user, onLoginClick, openProfile }) {
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [fighters, setFighters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState("");
  const [note, setNote] = useState("");
  const canReview = ["ADMIN", "FEDERATION_REP"].includes(user?.role);
  const isAdmin = user?.role === "ADMIN";

  const loadPanel = async () => {
    setLoading(true);
    setError("");
    try {
      const [statsResult, pendingResult, fightersResult] = await Promise.all([
        adminApi.stats(),
        verificationApi.pending(),
        adminApi.fighters({ limit: 8 }),
      ]);
      setStats(statsResult);
      setRequests(pendingResult || []);
      setFighters(fightersResult.data || []);
    } catch (caught) {
      setError(caught.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canReview) loadPanel();
  }, [canReview]);

  const reviewRequest = async (requestId, decision) => {
    setActionLoading(requestId);
    setError("");
    try {
      if (decision === "approve") await verificationApi.approve(requestId, note);
      else await verificationApi.reject(requestId, note || "Not enough verified documentation.");
      setNote("");
      await loadPanel();
    } catch (caught) {
      setError(caught.message);
    } finally {
      setActionLoading("");
    }
  };

  const updateRole = async (fighterId, role) => {
    setActionLoading(fighterId);
    setError("");
    try {
      await adminApi.updateRole(fighterId, role);
      await loadPanel();
    } catch (caught) {
      setError(caught.message);
    } finally {
      setActionLoading("");
    }
  };

  if (!user) {
    return (
      <main className="mx-auto min-h-screen max-w-7xl px-4 pt-32 sm:px-6 lg:px-8">
        <div className="rounded border border-white/10 bg-panel p-8">
          <Badge tone="red">Federation</Badge>
          <h1 className="mt-5 font-display text-4xl font-black text-white">Login required</h1>
          <p className="mt-3 text-zinc-400">Federation tools are protected for admins and federation representatives.</p>
          <button onClick={onLoginClick} className="mt-6 rounded bg-blood px-5 py-3 font-black text-white shadow-red">Login</button>
        </div>
      </main>
    );
  }

  if (!canReview) {
    return (
      <main className="mx-auto min-h-screen max-w-7xl px-4 pt-32 sm:px-6 lg:px-8">
        <div className="rounded border border-white/10 bg-panel p-8">
          <Badge tone="red">Federation</Badge>
          <h1 className="mt-5 font-display text-4xl font-black text-white">Access restricted</h1>
          <p className="mt-3 text-zinc-400">This panel is available only for ADMIN and FEDERATION_REP accounts.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 pt-32 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge tone="red">Federation Command</Badge>
          <h1 className="mt-4 font-display text-4xl font-black text-white sm:text-6xl">Federation Panel</h1>
          <p className="mt-3 max-w-2xl text-zinc-400">Review Pro requests, monitor platform health, and manage fighter status.</p>
        </div>
        <button onClick={loadPanel} className="rounded border border-white/15 px-5 py-3 text-sm font-black text-white hover:bg-white/10">Refresh</button>
      </div>

      {loading && <div className="mt-8"><LoadingPanel label="Loading federation data" /></div>}
      {error && <div className="mt-8"><ErrorPanel message={error} action={{ label: "Try again", onClick: loadPanel }} /></div>}

      {!loading && !error && (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded border border-white/10 bg-panel p-5"><div className="text-3xl font-black text-white">{stats?.totalFighters || 0}</div><div className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Fighters</div></div>
            <div className="rounded border border-white/10 bg-panel p-5"><div className="text-3xl font-black text-white">{stats?.proCount || 0}</div><div className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Pros</div></div>
            <div className="rounded border border-white/10 bg-panel p-5"><div className="text-3xl font-black text-white">{stats?.fightsLogged || 0}</div><div className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Fights</div></div>
            <div className="rounded border border-white/10 bg-panel p-5"><div className="text-3xl font-black text-white">{stats?.activeChallenges || 0}</div><div className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-zinc-500">Active challenges</div></div>
          </div>

          <section className="mt-8 rounded border border-white/10 bg-panel p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-2xl font-black text-white">Pending Pro Verification</h2>
                <p className="mt-1 text-sm text-zinc-400">{requests.length} request{requests.length === 1 ? "" : "s"} waiting for review.</p>
              </div>
              <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Review note, optional for approve" className="w-full rounded border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-blood sm:max-w-md" />
            </div>
            <div className="mt-5 grid gap-3">
              {requests.length === 0 && <div className="rounded border border-white/10 bg-white/5 p-4 text-sm text-zinc-400">No pending Pro verification requests.</div>}
              {requests.map((request) => (
                <div key={request.id} className="grid gap-4 rounded border border-white/10 bg-white/[0.03] p-4 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div>
                    <button onClick={() => openProfile(request.fighterId)} className="font-display text-xl font-black text-white hover:text-red-100">{request.fighter?.fullName || "Fighter"}</button>
                    <div className="mt-1 text-sm text-zinc-400">{request.federation?.name} · submitted {formatDate(request.createdAt)}</div>
                    {request.documentUrl && <a href={request.documentUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-bold text-red-100 hover:text-white">Open document</a>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button disabled={actionLoading === request.id} onClick={() => reviewRequest(request.id, "approve")} className="rounded bg-emerald-600 px-4 py-3 text-sm font-black text-white disabled:opacity-60">Approve</button>
                    <button disabled={actionLoading === request.id} onClick={() => reviewRequest(request.id, "reject")} className="rounded bg-blood px-4 py-3 text-sm font-black text-white disabled:opacity-60">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 overflow-hidden rounded border border-white/10 bg-panel">
            <div className="border-b border-white/10 p-5">
              <h2 className="font-display text-2xl font-black text-white">Recent Fighters</h2>
              <p className="mt-1 text-sm text-zinc-400">Fast status overview for federation review.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] text-left text-sm">
                <thead className="bg-white/[0.04] text-xs uppercase tracking-[0.16em] text-zinc-500">
                  <tr>{["Fighter", "Role", "Country", "Weight", "Points", "Admin Action"].map((head) => <th key={head} className="px-5 py-4 font-black">{head}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {fighters.map((fighter) => (
                    <tr key={fighter.id} className="text-zinc-300">
                      <td className="px-5 py-4"><button onClick={() => openProfile(fighter.id)} className="font-bold text-white hover:text-red-100">{fighter.fullName}</button></td>
                      <td className="px-5 py-4"><Badge tone={fighter.isVerifiedPro ? "red" : "dark"}>{fighter.user?.role || "AMATEUR"}</Badge></td>
                      <td className="px-5 py-4">{fighter.country}</td>
                      <td className="px-5 py-4">{formatWeightClass(fighter.weightClass)}</td>
                      <td className="px-5 py-4 font-black text-white">{fighter.points}</td>
                      <td className="px-5 py-4">
                        {isAdmin ? (
                          <div className="flex gap-2">
                            <button disabled={actionLoading === fighter.id} onClick={() => updateRole(fighter.id, "PRO")} className="rounded border border-white/15 px-3 py-2 text-xs font-black text-white hover:bg-white/10 disabled:opacity-60">Make Pro</button>
                            <button disabled={actionLoading === fighter.id} onClick={() => updateRole(fighter.id, "AMATEUR")} className="rounded border border-white/15 px-3 py-2 text-xs font-black text-white hover:bg-white/10 disabled:opacity-60">Amateur</button>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-500">Admin only</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  );
}

function PlaceholderPage({ title, icon: Icon }) {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 pt-32 sm:px-6 lg:px-8">
      <div className="rounded border border-white/10 bg-panel p-8">
        <Icon className="text-blood" size={34} />
        <h1 className="mt-5 font-display text-4xl font-black text-white">{title}</h1>
        <p className="mt-3 max-w-2xl text-zinc-400">
          This section is queued for the next FightID build phase. The live fighter, profile, and leaderboard API integrations are now connected.
        </p>
      </div>
    </main>
  );
}

function FighterProfileRoute({ openProfile, user, onLoginRequired }) {
  const { id } = useParams();
  return <FighterProfilePage fighterId={id} openProfile={openProfile} user={user} onLoginRequired={onLoginRequired} />;
}

function RequireAuth({ user, onLoginRequired, children }) {
  useEffect(() => {
    if (!user) onLoginRequired?.();
  }, [user, onLoginRequired]);

  if (!user) return <Navigate to="/" replace />;
  return children;
}

function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center text-white">
      <div className="font-display text-8xl font-black text-blood">404</div>
      <h1 className="mt-4 font-display text-3xl font-black">Page not found</h1>
      <p className="mt-3 max-w-md text-zinc-400">The FightID page you opened does not exist yet.</p>
      <button onClick={() => navigate("/")} className="mt-6 rounded border border-white/15 px-6 py-3 font-bold hover:bg-white/10">
        Go Home
      </button>
    </main>
  );
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const page = pathToPage(location.pathname);
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(userStorageKey);
    if (!stored) return null;

    try {
      return JSON.parse(stored);
    } catch {
      localStorage.removeItem(userStorageKey);
      return null;
    }
  });
  const [authModal, setAuthModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [settings, setSettings] = useState(loadStoredSettings);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const t = translations[settings.language] || translations.az;
  const navigatePage = (nextPage) => navigate(pagePaths[nextPage] || "/");

  useEffect(() => {
    const palette = themePalettes[settings.theme] || themePalettes.dark;

    localStorage.setItem(settingsStorageKey, JSON.stringify(settings));
    document.documentElement.dataset.fightidTheme = settings.theme;
    document.documentElement.dataset.fightidLanguage = settings.language;
    document.documentElement.dataset.fightidCompact = String(settings.compactMode);
    document.documentElement.dataset.fightidReduceMotion = String(settings.reduceMotion);

    const styleId = "fightid-settings-overrides";
    let style = document.getElementById(styleId);
    if (!style) {
      style = document.createElement("style");
      style.id = styleId;
      document.head.appendChild(style);
    }

    style.textContent = `
      :root {
        --fightid-accent: ${settings.accent};
        --fightid-canvas: ${palette.canvas};
        --fightid-panel: ${palette.panel};
        --fightid-elevated: ${palette.elevated};
        --fightid-text: ${palette.text};
        --fightid-border: ${palette.border};
      }
      body { background: var(--fightid-canvas) !important; color: var(--fightid-text) !important; }
      .bg-canvas { background-color: var(--fightid-canvas) !important; }
      .bg-canvas\\/80 { background-color: color-mix(in srgb, var(--fightid-canvas), transparent 20%) !important; }
      .bg-panel,
      .bg-\\[\\#111113\\],
      .bg-\\[\\#0a0a0b\\] { background-color: var(--fightid-panel) !important; }
      .text-bone { color: var(--fightid-text) !important; }
      .border-white\\/10,
      .border-white\\/15 { border-color: var(--fightid-border) !important; }
      .bg-blood { background-color: var(--fightid-accent) !important; }
      .bg-blood\\/10 { background-color: color-mix(in srgb, var(--fightid-accent), transparent 90%) !important; }
      .bg-blood\\/15 { background-color: color-mix(in srgb, var(--fightid-accent), transparent 85%) !important; }
      .bg-blood\\/20 { background-color: color-mix(in srgb, var(--fightid-accent), transparent 80%) !important; }
      .text-blood { color: var(--fightid-accent) !important; }
      .border-blood { border-color: var(--fightid-accent) !important; }
      .border-blood\\/30,
      .border-blood\\/40 { border-color: color-mix(in srgb, var(--fightid-accent), transparent 58%) !important; }
      .shadow-red { box-shadow: 0 0 30px color-mix(in srgb, var(--fightid-accent), transparent 58%) !important; }
      html[data-fightid-theme="contrast"] .text-zinc-400 { color: #d4d4d8 !important; }
      html[data-fightid-theme="contrast"] .text-zinc-500 { color: #b7b7c0 !important; }
      html[data-fightid-compact="true"] { font-size: 14px; }
      html[data-fightid-reduce-motion="true"] *,
      html[data-fightid-reduce-motion="true"] *::before,
      html[data-fightid-reduce-motion="true"] *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        scroll-behavior: auto !important;
        transition-duration: 0.01ms !important;
      }
    `;
  }, [settings]);

  useEffect(() => {
    const storedAccessToken = localStorage.getItem(accessTokenStorageKey);
    const refreshToken = localStorage.getItem(refreshTokenStorageKey);
    if (!storedAccessToken && !refreshToken) return;

    let ignore = false;

    const clearSession = () => {
      setAccessToken(null);
      localStorage.removeItem(accessTokenStorageKey);
      localStorage.removeItem(refreshTokenStorageKey);
      localStorage.removeItem(userStorageKey);
      setUser(null);
    };

    const restoreSession = async () => {
      try {
        if (storedAccessToken) {
          setAccessToken(storedAccessToken);
          const result = await authApi.me();
          if (ignore) return;
          localStorage.setItem(userStorageKey, JSON.stringify(result.user));
          setUser(result.user);
          return;
        }

        const result = await authApi.refresh(refreshToken);
        if (ignore) return;
        setAccessToken(result.accessToken);
        localStorage.setItem(refreshTokenStorageKey, result.refreshToken);
        if (result.user) {
          localStorage.setItem(userStorageKey, JSON.stringify(result.user));
          setUser(result.user);
        }
      } catch {
        if (ignore) return;
        clearSession();
      }
    };

    restoreSession();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!user?.id) return undefined;
    const socket = createFightIdSocket(user.id);
    const showToast = (message) => {
      setToast(message);
      window.setTimeout(() => setToast(null), 3000);
    };
    socket.on("fighter:won", () => showToast("Your fighter just won!"));
    socket.on("training:new", () => showToast("Your fighter just logged a training session 💪"));
    socket.on("notification:new", (notification) => showToast(notification.message));
    return () => socket.disconnect();
  }, [user]);

  useEffect(() => {
    document.body.classList.toggle("fightid-home", page === "Home");
    return () => document.body.classList.remove("fightid-home");
  }, [page]);

  useEffect(() => {
    const translate = () => applyPageTranslations(settings.language);
    const root = document.getElementById("root");
    translate();
    if (!root) return undefined;

    const observer = new MutationObserver(() => window.requestAnimationFrame(translate));
    observer.observe(root, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["placeholder"] });
    return () => observer.disconnect();
  }, [settings.language, page, authModal, settingsOpen, user]);

  useEffect(() => {
    const handleForcedLogout = () => {
      setAccessToken(null);
      localStorage.removeItem(accessTokenStorageKey);
      localStorage.removeItem(refreshTokenStorageKey);
      localStorage.removeItem(userStorageKey);
      setUser(null);
      navigate("/");
    };

    window.addEventListener("auth:logout", handleForcedLogout);
    return () => window.removeEventListener("auth:logout", handleForcedLogout);
  }, [navigate]);

  const openProfile = (fighterId) => {
    navigate(fighterId ? `/fighters/${fighterId}` : "/fighters");
  };

  const openAuth = (tab) => {
    setAuthModal(tab);
  };

  const closeAuth = () => {
    setAuthModal(null);
  };

  const updateSettings = (patch) => {
    setSettings((current) => ({ ...current, ...patch }));
  };

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem(refreshTokenStorageKey);

    try {
      if (refreshToken) await authApi.logout(refreshToken);
    } finally {
      setAccessToken(null);
      localStorage.removeItem(accessTokenStorageKey);
      localStorage.removeItem(refreshTokenStorageKey);
      localStorage.removeItem(userStorageKey);
      setUser(null);
      navigate("/");
    }
  };

  const handleAuthSuccess = (nextUser) => {
    setUser(nextUser);
    navigate("/profile");
  };

  const handleUserUpdate = (nextUser) => {
    setUser(nextUser);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-transparent text-bone">
      <AppHeader
        page={page}
        setPage={navigatePage}
        user={user}
        settings={settings}
        t={t}
        onSettingsClick={() => setSettingsOpen(true)}
        onLoginClick={() => openAuth("login")}
        onRegisterClick={() => openAuth("register")}
        onLogout={handleLogout}
      />
      <Routes>
        <Route path="/" element={<LandingPage setPage={navigatePage} openProfile={openProfile} />} />
        <Route path="/fighters" element={<FightersPage openProfile={openProfile} />} />
        <Route path="/fighters/:id" element={<FighterProfileRoute openProfile={openProfile} user={user} onLoginRequired={() => openAuth("login")} />} />
        <Route path="/rankings" element={<RankingsPage openProfile={openProfile} />} />
        <Route
          path="/profile"
          element={
            <RequireAuth user={user} onLoginRequired={() => openAuth("login")}>
              <MyProfilePage user={user} onLoginClick={() => openAuth("login")} onUserUpdate={handleUserUpdate} />
            </RequireAuth>
          }
        />
        <Route path="/gyms" element={<GymHub />} />
        <Route path="/gyms/:id" element={<GymHub />} />
        <Route path="/tournaments" element={<TournamentHub user={user} />} />
        <Route path="/tournaments/:id" element={<TournamentHub user={user} />} />
        <Route path="/compare" element={<HeadToHead />} />
        <Route path="/fight-board" element={<FightSeekBoard user={user} onLoginClick={() => openAuth("login")} />} />
        <Route path="/national-champions" element={<NationalChampions openProfile={openProfile} />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {authModal && <AuthModal initialTab={authModal} onClose={closeAuth} onSuccess={handleAuthSuccess} />}
      <SettingsPanel open={settingsOpen} settings={settings} onChange={updateSettings} onClose={() => setSettingsOpen(false)} t={t} />
      {toast && <div className="fixed bottom-5 right-5 z-[120] rounded border border-blood/40 bg-[#111113] px-5 py-4 font-bold text-white shadow-red">{toast}</div>}
      <footer className="border-t border-white/10 px-4 py-8 text-center text-sm text-zinc-500">
        <span className="font-black uppercase tracking-[0.18em] text-zinc-300">FightID</span>
        <span className="mx-3 text-zinc-700">/</span>
        Verified combat network for fighters, federations, and fight fans.
      </footer>
    </div>
  );
}


