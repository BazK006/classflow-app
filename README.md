# 📅 ClassFlow App — ตารางเรียนของฉัน

เว็บแอปพลิเคชันสำหรับจัดตารางเรียนและกิจกรรมรายสัปดาห์ พัฒนาด้วย **React + Vite** มาพร้อมธีม **Dark / Purple** ที่เรียบง่าย ทันสมัย และออกแบบให้ใช้งานได้ทั้งบนคอมพิวเตอร์และมือถือ

ClassFlow ช่วยให้คุณจัดคาบเรียนตามช่วงเวลาที่ต้องการ ดูตารางรายสัปดาห์ จัดการรายละเอียดรายวิชา และส่งออกข้อมูลเพื่อเก็บสำรองได้สะดวก โดยข้อมูลจะถูกบันทึกไว้ในเบราว์เซอร์ผ่าน `localStorage` ไม่จำเป็นต้องมีบัญชีผู้ใช้หรือ Backend

<p align="center">
  <img src="https://img.shields.io/badge/React-UI-61DAFB?logo=react&amp;logoColor=20232A" alt="React badge" />
  <img src="https://img.shields.io/badge/Vite-Dev%20Server-646CFF?logo=vite&amp;logoColor=white" alt="Vite badge" />
  <img src="https://img.shields.io/badge/Bootstrap-5-7952B3?logo=bootstrap&amp;logoColor=white" alt="Bootstrap badge" />
  <img src="https://img.shields.io/badge/Storage-localStorage-6B7280" alt="localStorage badge" />
</p>

---

## 🖥️ ตัวอย่างหน้าเว็บ

<p align="center">
  <img src="src/image/example_web.png" alt="ภาพตัวอย่างหน้าเว็บ ClassFlow App" width="100%" />
</p>

---

## ✨ ฟีเจอร์เด่น

- **🗓️ ตารางเรียนแบบยืดหยุ่น** — กำหนดเวลาเริ่มต้นและสิ้นสุดของแต่ละคาบได้ โดยระบบจัดวางคาบเรียนตามช่วงเวลาจริงให้อัตโนมัติ
- **📱 รองรับมือถือ** — ปรับรูปแบบการแสดงผลให้ใช้งานบนหน้าจอขนาดเล็กได้สะดวก
- **➕ เพิ่ม แก้ไข และลบรายวิชา** — จัดการข้อมูลรหัสวิชา ชื่อวิชา กลุ่มเรียน หน่วยกิต วัน เวลา ผู้สอน ห้องเรียน และสีประจำวิชา
- **🎨 ปรับแต่งสีรายวิชา** — เลือกสีจากจานสีที่เตรียมไว้หรือเลือกสีที่ต้องการด้วย Color Picker
- **📋 สรุปรายวิชาที่ลงทะเบียน** — ดูรายละเอียดรายวิชาในตารางสรุป และเรียงข้อมูลตามวันเรียนตั้งแต่วันจันทร์ถึงวันศุกร์
- **💾 บันทึกอัตโนมัติ** — เก็บข้อมูลไว้ใน `localStorage` ของเบราว์เซอร์ ไม่ต้องบันทึกเองทุกครั้ง
- **📤 ส่งออกข้อมูลได้หลายรูปแบบ**
  - **PDF (`.pdf`)** — ส่งออกตารางเรียนสำหรับอ่านหรือพิมพ์
  - **PNG (`.png`)** — บันทึกตารางเป็นรูปภาพเพื่อเปิดดูหรือแชร์
  - **JSON (`.json`)** — สำรองข้อมูลตารางเรียนไว้ใช้ในภายหลัง
  - **Excel (`.xlsx`)** — ส่งออกตารางและรายละเอียดรายวิชาไปจัดการต่อใน Excel หรือแอปสเปรดชีตที่รองรับ

---

## 🛠️ Tech Stack & Tools

| เครื่องมือ          | ใช้สำหรับ                                      | เว็บไซต์                                                                             |
| ------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------ |
| **React**           | สร้าง UI ด้วย Component และจัดการ State        | [react.dev](https://react.dev/)                                                      |
| **Vite**            | Development Server และ Build โปรเจกต์          | [vite.dev](https://vite.dev/)                                                        |
| **Bootstrap 5**     | Layout และองค์ประกอบ UI                        | [getbootstrap.com](https://getbootstrap.com/)                                        |
| **Bootstrap Icons** | ไอคอนภายในแอป                                  | [icons.getbootstrap.com](https://icons.getbootstrap.com/)                            |
| **SweetAlert2**     | กล่องแจ้งเตือนและหน้าต่างยืนยันการทำงาน        | [sweetalert2.github.io](https://sweetalert2.github.io/)                              |
| **html2canvas**     | แปลงองค์ประกอบ HTML เป็นภาพ                    | [html2canvas.hertzen.com](https://html2canvas.hertzen.com/)                          |
| **jsPDF**           | สร้างและส่งออกไฟล์ PDF                         | [GitHub: jsPDF](https://github.com/parallax/jsPDF)                                   |
| **ExcelJS**         | สร้างไฟล์ Excel (`.xlsx`)                      | [GitHub: ExcelJS](https://github.com/exceljs/exceljs)                                |
| **Custom CSS**      | ธีม Dark / Purple, Animation และ Responsive UI | —                                                                                    |
| **localStorage**    | บันทึกข้อมูลภายในเบราว์เซอร์                   | [MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) |

---

## 📁 Project Structure

```text
schedule-app/
├── index.html
├── package.json
├── vite.config.js
├── public/
│   └── ...                     # Static assets เช่น favicon
└── src/
    ├── main.jsx                # จุดเริ่มต้นและ Mount React
    ├── App.jsx                 # State และ Logic หลักของแอป
    ├── index.css               # สไตล์และธีมของแอป
    ├── components/
    │   ├── Toolbar.jsx         # เพิ่มคาบเรียนและเมนูส่งออกข้อมูล
    │   ├── ScheduleTable.jsx   # ตารางเรียนแบบ Timeline
    │   ├── ClassModal.jsx      # ฟอร์มเพิ่มและแก้ไขรายวิชา
    │   ├── Summary_subject.jsx # ตารางสรุปรายวิชา
    │   └── Footer.jsx          # ส่วนท้ายของแอป
    ├── data/
    │   └── constants.js        # ค่าคงที่ เช่น รายชื่อวันและสีเริ่มต้น
    ├── image/
    │   └── example_web.png     # ภาพตัวอย่างหน้าเว็บสำหรับ README
    └── utils/
        ├── time.js             # ฟังก์ชันช่วยจัดการเวลา
        ├── storage.js          # อ่านและบันทึกข้อมูลใน localStorage
        ├── exporters.js        # ส่งออกไฟล์ PDF, PNG, JSON และ Excel
        └── modal.js            # ฟังก์ชันช่วยจัดการ Modal และการแจ้งเตือน
```

> **หมายเหตุ:** โครงสร้างข้างต้นอ้างอิงจากไฟล์ที่ใช้ในโปรเจกต์ปัจจุบัน หากมีการเพิ่ม ลบ หรือเปลี่ยนชื่อไฟล์ ควรอัปเดตส่วนนี้ให้ตรงกับ Repository จริง

---

## 🚀 Getting Started

### 1. สิ่งที่ต้องมี

- [Node.js](https://nodejs.org/) เวอร์ชันที่รองรับกับ Vite ที่ใช้ในโปรเจกต์
- npm ซึ่งมาพร้อมกับ Node.js
- Git (หากต้องการ Clone โปรเจกต์จาก Repository)

### 2. ดาวน์โหลดโปรเจกต์

หากมีโฟลเดอร์โปรเจกต์ในเครื่องอยู่แล้ว ให้เปิด Terminal ที่โฟลเดอร์นั้นได้เลย หรือ Clone จาก Repository:

```bash
git clone <repository-url>
cd <project-folder>
```

แทนที่ `<repository-url>` ด้วย URL ของ Git Repository จริง และแทนที่ `<project-folder>` ด้วยชื่อโฟลเดอร์ที่ได้จากการ Clone

### 3. ติดตั้ง Dependencies

```bash
npm install
```

### 4. รันในโหมด Development

```bash
npm run dev
```

เปิด URL ที่แสดงใน Terminal โดยปกติ Vite จะใช้:

```text
http://localhost:5173
```

### 5. ทดลองใช้งานบนมือถือ

หากคอมพิวเตอร์และมือถือเชื่อมต่อ Wi-Fi เครือข่ายเดียวกัน ให้รันคำสั่ง:

```bash
npm run dev -- --host
```

จากนั้นเปิด URL แบบ Network ที่แสดงใน Terminal บนมือถือ หากเข้าไม่ได้ ให้ตรวจสอบว่าอุปกรณ์อยู่เครือข่ายเดียวกันและ Firewall อนุญาตการเชื่อมต่อ

---

## 📦 Build สำหรับ Production

สร้างไฟล์สำหรับนำไป Deploy:

```bash
npm run build
```

ไฟล์ที่ Build แล้วจะอยู่ในโฟลเดอร์ `dist/`

ทดสอบ Build ในเครื่องก่อน Deploy:

```bash
npm run preview
```

สามารถนำโปรเจกต์ไป Deploy บนบริการอย่าง [Vercel](https://vercel.com/), [Netlify](https://www.netlify.com/) หรือ [GitHub Pages](https://pages.github.com/) ได้ โดยตรวจสอบการตั้งค่า Base Path และคำแนะนำของผู้ให้บริการให้ตรงกับรูปแบบการ Deploy ที่เลือก

---

## 💡 ข้อควรรู้เกี่ยวกับข้อมูล

- ข้อมูลตารางเรียนถูกเก็บใน `localStorage` ของเบราว์เซอร์ที่ใช้งาน
- ข้อมูล **ไม่ได้ซิงก์ข้ามอุปกรณ์หรือข้ามเบราว์เซอร์โดยอัตโนมัติ**
- หากล้างข้อมูลเว็บไซต์หรือ Browser Data ข้อมูลที่เก็บไว้ในเบราว์เซอร์อาจหายได้
- แนะนำให้ใช้ **Export JSON (`.json`)** สำรองข้อมูลเป็นระยะ และเก็บไฟล์ไว้ในที่ปลอดภัย
- ก่อนเปลี่ยนอุปกรณ์หรือเบราว์เซอร์ ควรตรวจสอบว่ามีไฟล์สำรองที่ต้องการเก็บไว้แล้ว

---

## 🔮 แนวทางต่อยอด

ไอเดียสำหรับการพัฒนาต่อในอนาคต เช่น ระบบ Import ข้อมูลจากไฟล์สำรอง การจัดตารางแยกตามภาคการศึกษา การปรับแต่งธีม และการซิงก์ข้อมูลผ่าน Cloud ในกรณีที่ต้องการเพิ่ม Backend ในอนาคต

---

<p align="center">
  <strong>Made with 💜 for a more organized study life.</strong><br />
  <sub>ClassFlow App — ตารางเรียนของฉัน</sub><br />
  <sub>อัปเดตล่าสุด: 19 ตุลาคม 2026</sub>
</p>
