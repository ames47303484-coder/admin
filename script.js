import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/12.12.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA8iDHs1GcZYBZSCbF1GjMgR63jILrFNcU",
  authDomain: "hgglg-5947a.firebaseapp.com",
  projectId: "hgglg-5947a",
  storageBucket: "hgglg-5947a.firebasestorage.app",
  messagingSenderId: "31328681718",
  appId: "1:31328681718:web:2fac4b4d406120eda8f6d7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.saveDb = async function(key, data) {
    try { await setDoc(doc(db, "storage", key), { data }); } catch(e) { console.error("DB_ERR", e); }
};
const _originalSetItem = localStorage.setItem.bind(localStorage);
localStorage.setItem = function(k, v) {
    _originalSetItem(k, v);
    if ([DB_STUDENTS, DB_SECTIONS, DB_LESSONS, DB_ADS].includes(k)) {
        saveDb(k, JSON.parse(v));
    }
};

const DB_STUDENTS = 'edu_platform_students_v3';
const DB_SECTIONS = 'edu_platform_sections_v3';
const DB_LESSONS = 'edu_platform_lessons_v3';
const DB_ADS = 'edu_platform_ads_v3';

let students = [];
let sections = [];
let lessons = [];
let ads = [];

window.onload = async () => {
    try {
        const fetchDoc = async (key) => {
            const snap = await getDoc(doc(db, "storage", key));
            return snap.exists() ? snap.data().data : [];
        };
        students = await fetchDoc(DB_STUDENTS);    
        sections = await fetchDoc(DB_SECTIONS);    
        lessons = await fetchDoc(DB_LESSONS);    
        ads = await fetchDoc(DB_ADS);
        
        _originalSetItem(DB_STUDENTS, JSON.stringify(students));
        _originalSetItem(DB_SECTIONS, JSON.stringify(sections));
        _originalSetItem(DB_LESSONS, JSON.stringify(lessons));
        _originalSetItem(DB_ADS, JSON.stringify(ads));
    } catch(e) { console.error(e); }

    setTimeout(() => showInstallPrompt(), 2000);

    const isAdminLogged = sessionStorage.getItem('adminLogged_v3');
    if (isAdminLogged === 'true') {
        showAdminApp();
    }
};

const adminLoginForm = document.getElementById('adminLoginForm');
if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const pwd = document.getElementById('adminPassword').value;
        if (pwd === '1001') {
            sessionStorage.setItem('adminLogged_v3', 'true');
            showAdminApp();
        } else {
            const err = document.getElementById('loginError');
            err.innerText = "❌ الرمز السري غير صحيح.";
            err.style.display = "block";
        }
    });
}

function showAdminApp() {
    document.getElementById('loginScreen').classList.remove('active');
    document.getElementById('appScreen').classList.add('active');
    populateSectionSelects();
    renderStudents();
    renderSections();
    renderLessons();
    renderAds();
}

window.switchTab = function(tabId) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(li => li.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    const navItem = document.getElementById('nav-' + tabId);
    if(navItem) navItem.classList.add('active');
}

// Custom 3D Popup logic
window.showPopup = function(title, message) {
    document.getElementById('popupTitle').innerText = title;
    document.getElementById('popupMessage').innerText = message;
    document.getElementById('customPopup').classList.add('active');
}
window.closePopup = function() {
    document.getElementById('customPopup').classList.remove('active');
}

// Global PWA prompt logic
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});

window.showInstallPrompt = function() {
    if (!localStorage.getItem('pwa_prompt_shown_v1')) {
        const installModal = document.createElement('div');
        installModal.id = 'installPwaModal';
        installModal.innerHTML = `
            <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(5px); z-index: 9999; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.5s;">
                <div class="3d-card" style="background: white; width: 90%; max-width: 350px; border-radius: 20px; padding: 30px 20px; text-align: center; position: relative;">
                    <div style="font-size: 50px; margin-bottom: 15px; animation: popBounce 0.5s;">📱</div>
                    <h3 style="font-size: 22px; color: #1e3c72; margin-bottom: 10px; font-weight: 900;">حمل التطبيق الآن!</h3>
                    <p style="color: #7f8c8d; font-size: 15px; font-weight: 600; margin-bottom: 25px;">حمل التطبيق ليكون الاستخدام سلس ومباشر وأسهل عليك في المرات القادمة.</p>
                    <button id="btnPwaInstall" style="width: 100%; padding: 14px; background: #6a11cb; color: white; border: none; border-radius: 12px; font-size: 16px; font-weight: 800; cursor: pointer; box-shadow: 0 5px 15px rgba(106, 17, 203, 0.4); margin-bottom: 10px;">تحميل التطبيق</button>
                    <button id="btnPwaClose" style="width: 100%; padding: 12px; background: transparent; color: #7f8c8d; border: none; font-size: 14px; font-weight: 700; cursor: pointer;">تخطي الآن</button>
                </div>
            </div>
        `;
        document.body.appendChild(installModal);
        
        document.getElementById('btnPwaInstall').onclick = async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    deferredPrompt = null;
                }
            } else {
                alert('الرجاء الإضافة إلى الشاشة الرئيسية (Add to Home Screen) من خلال إعدادات المتصفح.');
            }
            document.body.removeChild(installModal);
            localStorage.setItem('pwa_prompt_shown_v1', 'true');
        };
        
        document.getElementById('btnPwaClose').onclick = () => {
            document.body.removeChild(installModal);
            localStorage.setItem('pwa_prompt_shown_v1', 'true');
        };
    }
}


function getEmbedUrl(url) {
    let videoId = "";
    if (url.includes("v=")) videoId = url.split("v=")[1].split("&")[0];
    else if (url.includes("youtu.be/")) videoId = url.split("youtu.be/")[1].split("?")[0];
    else if (url.includes("embed/")) videoId = url.split("embed/")[1].split("?")[0];
    else if (url.includes("shorts/")) videoId = url.split("shorts/")[1].split("?")[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : url;
}

// Student form
document.getElementById('addStudentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const fullName = document.getElementById('studentName').value.trim();
    const username = document.getElementById('studentUsername').value.trim();
    const days = parseInt(document.getElementById('studentDays').value);

    const now = Date.now();
    const addedTime = days * 24 * 60 * 60 * 1000;

    const existingIndex = students.findIndex(s => s.username === username);
    if (existingIndex >= 0) {
        let currentEnd = students[existingIndex].endDate;
        students[existingIndex].endDate = (currentEnd > now) ? currentEnd + addedTime : now + addedTime;
        students[existingIndex].fullName = fullName;
        showPopup('نجاح التجديد', 'تم تجديد اشتراك الطالب بنجاح! 🚀');
    } else {
        students.push({ fullName, username, endDate: now + addedTime });
        showPopup('نجاح الإضافة', 'تمت إضافة الطالب وتفعيل اشتراكه بنجاح! 🎉');
    }

    localStorage.setItem(DB_STUDENTS, JSON.stringify(students));
    this.reset();
    renderStudents();
});

// Section form
document.getElementById('addSectionForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const sectionName = document.getElementById('sectionName').value.trim();
    sections.push({ id: Date.now(), name: sectionName });
    localStorage.setItem(DB_SECTIONS, JSON.stringify(sections));
    showPopup('نجاح الإضافة', 'تمت إضافة القسم بنجاح! 🗂️');
    this.reset();
    renderSections();
    populateSectionSelects();
});

// Lesson form
document.getElementById('addLessonForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const sectionId = document.getElementById('lessonSection').value;
    const title = document.getElementById('lessonTitle').value.trim();
    const url = document.getElementById('lessonUrl').value.trim();

    if(!sectionId) {
        showPopup('خطأ', 'الرجاء اختيار القسم أولاً');
        return;
    }

    lessons.push({ id: Date.now(), sectionId: sectionId, title, videoUrl: getEmbedUrl(url) });
    localStorage.setItem(DB_LESSONS, JSON.stringify(lessons));
    showPopup('نجاح النشر', 'تم نشر الدرس بنجاح! 📚');
    this.reset();
    renderLessons();
});

// Ad form
document.getElementById('addAdForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const title = document.getElementById('adTitle').value.trim();
    const content = document.getElementById('adContent').value.trim();
    const date = new Date().toLocaleDateString('ar-EG');

    ads.unshift({ id: Date.now(), title, text: content, date });
    localStorage.setItem(DB_ADS, JSON.stringify(ads));
    showPopup('نجاح النشر', 'تم نشر الإعلان للطلاب! 📢');
    this.reset();
    renderAds();
});

// Render Functions
function renderStudents() {
    const list = document.getElementById('studentsList');
    const searchInput = document.getElementById('searchStudentInput');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    
    let filteredStudents = students;
    if (query) {
        filteredStudents = students.filter(s => s.fullName.toLowerCase().includes(query) || s.username.toLowerCase().includes(query));
    }

    list.innerHTML = filteredStudents.length ? '' : '<p style="text-align:center; color:#7f8c8d; font-weight:700;">لا يوجد طلاب مسجلين أو مطابقين للبحث.</p>';
    
    const now = Date.now();
    filteredStudents.forEach((s) => {
        let index = students.indexOf(s);
        let daysLeft = Math.ceil((s.endDate - now) / (1000 * 60 * 60 * 24));
        let isExpired = daysLeft <= 0;
        let isExpiringSoon = daysLeft > 0 && daysLeft <= 3;
        
        list.innerHTML += `
        <div class="data-item ${isExpired ? 'expired' : ''} ${isExpiringSoon ? 'expiring-soon' : ''}">
            <div class="data-info">
                <strong>👤 ${s.fullName}</strong>
                <span>اليوزر: @${s.username}</span><br>
                <div class="badge ${isExpired ? 'expired' : isExpiringSoon ? 'warning' : 'active'}">
                    ${isExpired ? '❌ منتهي الصلاحية' : isExpiringSoon ? `⚠️ ينتهي قريباً (${daysLeft} يوم)` : `✅ متبقي ${daysLeft} يوم`}
                </div>
            </div>
            <div class="action-btns" style="flex-direction:row;">
                <button onclick="openEditStudent(${index})" class="btn-edit">تعديل</button>
                <button onclick="deleteData('students', ${index})" class="btn-delete">حذف</button>
            </div>
        </div>`;
    });
}

function populateSectionSelects() {
    const selectAdd = document.getElementById('lessonSection');
    const selectEdit = document.getElementById('editLessonSection');
    const options = '<option value="" disabled selected>اختر القسم...</option>' + 
                    sections.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
    if(selectAdd) selectAdd.innerHTML = options;
    if(selectEdit) selectEdit.innerHTML = options;
}

function renderSections() {
    const list = document.getElementById('sectionsList');
    list.innerHTML = sections.length ? '' : '<p style="text-align:center; color:#7f8c8d; font-weight:700;">لا يوجد أقسام مضافة.</p>';
    sections.forEach((s, index) => {
        list.innerHTML += `
        <div class="data-item">
            <div class="data-info">
                <strong>🗂️ ${s.name}</strong>
            </div>
            <div class="action-btns" style="flex-direction:row;">
                <button onclick="openEditSection(${index})" class="btn-edit">تعديل</button>
                <button onclick="deleteData('sections', ${index})" class="btn-delete">حذف</button>
            </div>
        </div>`;
    });
}

function renderLessons() {
    const list = document.getElementById('lessonsList');
    list.innerHTML = lessons.length ? '' : '<p style="text-align:center; color:#7f8c8d; font-weight:700;">لا يوجد دروس منشورة.</p>';
    lessons.forEach((l, index) => {
        const sec = sections.find(s => s.id == l.sectionId) || sections.find(s => s.name === l.section);
        const sectionName = sec ? sec.name : (l.section || 'قسم غير محدد');
        list.innerHTML += `
        <div class="data-item">
            <div class="data-info">
                <span style="color:#6a11cb;">🗂️ ${sectionName}</span>
                <strong>▶ ${l.title}</strong>
            </div>
            <div class="action-btns" style="flex-direction:row;">
                <button onclick="openEditLesson(${index})" class="btn-edit">تعديل</button>
                <button onclick="deleteData('lessons', ${index})" class="btn-delete">حذف</button>
            </div>
        </div>`;
    });
}

function renderAds() {
    const list = document.getElementById('adsList');
    list.innerHTML = ads.length ? '' : '<p style="text-align:center; color:#7f8c8d; font-weight:700;">لا توجد إعلانات منشورة.</p>';
    ads.forEach((a, index) => {
        list.innerHTML += `
        <div class="data-item">
            <div class="data-info">
                <span>📅 ${a.date}</span>
                <strong style="color:#f39c12;">📢 ${a.title}</strong>
                <p style="font-size:14px; font-weight:600; white-space:pre-wrap; color:#34495e; margin-top:5px;">${a.text || a.content}</p>
            </div>
            <div class="action-btns">
                <button onclick="deleteData('ads', ${index})" class="btn-delete">حذف</button>
            </div>
        </div>`;
    });
}

window.deleteData = function(type, index) {
    if(type === 'students') { students.splice(index, 1); localStorage.setItem(DB_STUDENTS, JSON.stringify(students)); renderStudents(); }
    if(type === 'sections') { 
        const secId = sections[index].id;
        sections.splice(index, 1); 
        localStorage.setItem(DB_SECTIONS, JSON.stringify(sections));
        lessons = lessons.filter(l => l.sectionId != secId);
        localStorage.setItem(DB_LESSONS, JSON.stringify(lessons));
        renderSections(); populateSectionSelects(); renderLessons(); 
    }
    if(type === 'lessons') { lessons.splice(index, 1); localStorage.setItem(DB_LESSONS, JSON.stringify(lessons)); renderLessons(); }
    if(type === 'ads') { ads.splice(index, 1); localStorage.setItem(DB_ADS, JSON.stringify(ads)); renderAds(); }
}

// Edit Student
window.openEditStudent = function(index) {
    const s = students[index];
    document.getElementById('editStudentIndex').value = index;
    document.getElementById('editStudentName').value = s.fullName || '';
    document.getElementById('editStudentUsername').value = s.username || '';
    
    let daysLeft = Math.ceil((s.endDate - Date.now()) / (1000 * 60 * 60 * 24));
    document.getElementById('editStudentDays').value = daysLeft > 0 ? daysLeft : 0;
    
    document.getElementById('editStudentModal').classList.add('active');
}
window.closeEditStudent = function() {
    document.getElementById('editStudentModal').classList.remove('active');
}
window.saveEditStudent = function() {
    const index = document.getElementById('editStudentIndex').value;
    const name = document.getElementById('editStudentName').value.trim();
    const username = document.getElementById('editStudentUsername').value.trim();
    const days = parseInt(document.getElementById('editStudentDays').value);
    
    if(name && username) {
        students[index].fullName = name;
        students[index].username = username;
        if (!isNaN(days)) {
            students[index].endDate = Date.now() + (days * 24 * 60 * 60 * 1000);
        }
        localStorage.setItem(DB_STUDENTS, JSON.stringify(students));
        renderStudents();
        closeEditStudent();
        showPopup('نجاح', 'تم تعديل بيانات الطالب بنجاح!');
    } else {
        showPopup('خطأ', 'يرجى تعبئة الاسم واليوزر');
    }
}

// Edit Section 
window.openEditSection = function(index) {
    document.getElementById('editSectionIndex').value = index;
    document.getElementById('editSectionNameInput').value = sections[index].name;
    document.getElementById('editSectionModal').classList.add('active');
}
window.closeEditSection = function() {
    document.getElementById('editSectionModal').classList.remove('active');
}
window.saveEditSection = function() {
    const index = document.getElementById('editSectionIndex').value;
    const name = document.getElementById('editSectionNameInput').value.trim();
    if(name) {
        sections[index].name = name;
        localStorage.setItem(DB_SECTIONS, JSON.stringify(sections));
        renderSections();
        populateSectionSelects();
        renderLessons();
        closeEditSection();
        showPopup('تم التعديل', 'تم حفظ تعديلات القسم بنجاح!');
    }
}

// Edit Lesson
window.openEditLesson = function(index) {
    const lesson = lessons[index];
    document.getElementById('editLessonIndex').value = index;
    document.getElementById('editLessonSection').value = lesson.sectionId || "";
    document.getElementById('editLessonTitle').value = lesson.title;
    document.getElementById('editLessonUrl').value = lesson.videoUrl;
    document.getElementById('editLessonModal').classList.add('active');
}
window.closeEditLesson = function() {
    document.getElementById('editLessonModal').classList.remove('active');
}
window.saveEditLesson = function() {
    const index = document.getElementById('editLessonIndex').value;
    const sectionId = document.getElementById('editLessonSection').value;
    const title = document.getElementById('editLessonTitle').value.trim();
    const url = document.getElementById('editLessonUrl').value.trim();
    
    if(title && url && sectionId) {
        lessons[index].sectionId = sectionId;
        lessons[index].title = title;
        lessons[index].videoUrl = getEmbedUrl(url);
        localStorage.setItem(DB_LESSONS, JSON.stringify(lessons));
        renderLessons();
        closeEditLesson();
        showPopup('تم التعديل', 'تم حفظ تعديلات الدرس بنجاح!');
    }
}


