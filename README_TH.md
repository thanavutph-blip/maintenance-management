# Maintenance Management System — Free Starter

ชุดต้นแบบสำหรับ Firebase Spark (ฟรีตามโควตา) มี Google Login, สถานะ pending/approved/suspended, บทบาท admin/editor/viewer, ระบบ, งานซ่อม, ผู้รับเหมา และประเมินผู้รับเหมา

## ก่อนเริ่ม
- ต้องมีบัญชี Google
- สร้าง Firebase Project และเลือก Spark plan
- ห้ามส่งรหัสผ่าน Google, service account private key หรือข้อมูลลับให้ผู้อื่น
- Firebase web config เป็นค่าระบุตัวโปรเจ็กต์ ไม่ใช่รหัสผ่าน แต่ควรตั้ง Firestore Security Rules ให้ถูกต้อง

## ตั้งค่า Firebase
1. สร้างโปรเจ็กต์ที่ https://console.firebase.google.com/
2. Project settings > Your apps > Add app > Web แล้วคัดลอก firebaseConfig
3. Authentication > Sign-in method > เปิด Google
4. Firestore Database > Create database (production mode)
5. แก้ `firebaseConfig` ใน `app.js` ด้วยค่าจาก Firebase Console
6. ใน Firestore Rules วาง `firestore.rules` แล้ว Publish
7. ติดตั้ง Node.js และ Firebase CLI: `npm install -g firebase-tools`
8. เข้าสู่ระบบ: `firebase login`
9. คัดลอก `.firebaserc.example` เป็น `.firebaserc` แล้วแทนค่า project ID
10. จากโฟลเดอร์นี้รัน `firebase deploy --only hosting,firestore:rules`

เว็บไซต์จะอยู่ที่ `https://PROJECT_ID.web.app`

## ตั้ง Admin 2 คนครั้งแรก (สำคัญ)
1. ให้บัญชี Google ของ Admin ทั้งสองคน Login เข้ามาก่อน ระบบจะสร้างเอกสาร users/{uid} เป็น pending
2. ใน Firestore Console > users เปิดเอกสาร UID ของแต่ละคน
3. เปลี่ยน `role` เป็น `admin` และ `status` เป็น `approved` แล้วบันทึก
4. ให้ Admin ทั้งสอง Logout แล้ว Login ใหม่
5. หลังจากนั้น Admin สามารถอนุมัติสมาชิกและกำหนด Editor/Viewer จากเมนูสมาชิกบนเว็บไซต์ได้

## ข้อจำกัดและความปลอดภัย
- Spark ให้โควตาฟรี แต่เมื่อเกินโควตา บริการที่มีโควตาอาจหยุดจนรอบถัดไป ไม่ได้แปลว่ามีบริการไม่จำกัด
- ระบบนี้ตั้งใจไม่ใช้ Cloud Functions/บริการที่ต้องอัปเกรดเป็น Blaze
- การสมัครใหม่สร้างได้เฉพาะเอกสารของ UID ตัวเองในสถานะ pending; การอนุมัติ/เปลี่ยน role ทำได้เฉพาะ Admin ตาม Firestore Rules
- ห้ามเปิด Firestore แบบ test mode หรือ rules ที่อนุญาต read/write ทุกคน
- รุ่นนี้ยังไม่รองรับแนบไฟล์, PDF/Excel export, audit log แบบละเอียด, การแจ้งเตือนอัตโนมัติ หรือ workflow อนุมัติงานซ่อม
- ก่อนใช้งานในองค์กรจริงควรให้ผู้ดูแล IT ตรวจสอบนโยบายข้อมูลและสำรองข้อมูล

## โครงสร้างข้อมูล
`users`, `systems`, `repairs`, `contractors`, `evaluations`
