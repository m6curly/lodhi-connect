export type Profile = { id:string; name:string; email:string; phone:string; block:'C2'|'D1'; house_number:string; role:'resident'|'admin' };
export type Complaint = { id:string; complaint_number:string; resident_id:string; block:string; house_number:string; category:string; title:string; description:string; priority:string; status:string; assigned_staff_name:string|null; assignment_remark:string|null; created_at:string; updated_at:string; resolved_at:string|null };
export type Announcement = { id:string; title:string; content:string; is_published:boolean; created_at:string };
export type GalleryItem = { id:string; image_url:string; caption:string; event_date:string|null; created_at:string };
