# ตารางเรียนของฉัน (Schedule App)

เว็บแอปจัดตารางเรียนรายสัปดาห์ สร้างด้วย React + Vite ธีมสีดำ-ม่วง
เลือกช่วงเวลาได้อิสระ (เช่น 8:30-12:30) ระบบจะจัดวางคาบเรียนในตารางให้อัตโนมัติ

## โครงสร้างโฟลเดอร์

```
schedule-app/
├── index.html                # HTML entry point
├── package.json
├── vite.config.js
├── public/
└── src/
    ├── main.jsx               # จุดเริ่มต้นของแอป (mount React)
    ├── App.jsx                # component หลัก รวม state และ logic
    ├── index.css              # ธีมสีดำ-ม่วงทั้งหมด
    ├── components/
    │   ├── Toolbar.jsx         # แถบปุ่มด้านบน (เพิ่มคาบ / export / ล้างข้อมูล)
    │   ├── ScheduleTable.jsx   # ตารางเรียนแบบ timeline ที่จัดวางคาบอัตโนมัติ
    │   └── ClassModal.jsx      # ฟอร์ม เพิ่ม/แก้ไข/ลบ คาบเรียน
    ├── data/
    │   └── constants.js        # วัน, สี, ค่าเริ่มต้นต่างๆ
    └── utils/
        ├── time.js              # คำนวณ ticks/columns ของตาราง (auto layout)
        ├── storage.js           # โหลด/บันทึกลง localStorage
        └── exporters.js         # Export JSON / PNG / PDF
```

## วิธีติดตั้งและรัน

```bash
npm install
npm run dev
```

จากนั้นเปิดลิงก์ที่ Vite แสดงในเทอร์มินัล (ปกติคือ http://localhost:5173)

## Build สำหรับ production

```bash
npm run build
npm run preview
```

ไฟล์ที่ build แล้วจะอยู่ในโฟลเดอร์ `dist/` พร้อม deploy ขึ้นเว็บ (Vercel, Netlify, GitHub Pages ฯลฯ)

## ฟีเจอร์

- เพิ่ม/แก้ไข/ลบคาบเรียน เลือกวัน เวลาเริ่ม-สิ้นสุดได้อิสระ
- ตารางจัดคอลัมน์เวลาและ colspan ของคาบให้อัตโนมัติตามช่วงเวลาที่กำหนด
- เลือกสีคาบเรียนได้อิสระ (มีจานสีสำเร็จรูป + color picker)
- บันทึกข้อมูลอัตโนมัติด้วย `localStorage` (อยู่ในเบราว์เซอร์เครื่องนั้น)
- Export ตารางเป็น PDF, PNG (รูปภาพ), และ JSON (ข้อมูลดิบ)

## หมายเหตุ

- ข้อมูลจะหายไปถ้าเคลียร์ localStorage ของเบราว์เซอร์ ควร Export JSON เก็บไว้เป็นระยะ
