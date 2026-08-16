export const APP_NAME = 'Lodhi Connect';
export const APP_AREA = 'Lodhi Colony · C2 & D1 Blocks';
export const BLOCKS = ['C2','D1'] as const;
export const COMPLAINT_CATEGORIES = [
  'Water / Plumbing','Electricity','Cleaning / Garbage','Sewerage / Drainage','Road / Pavement',
  'Street Light','Park / Green Area','Parking','Noise / Disturbance','Stray Animals','Security',
  'Common Area','Staff / Maintenance','Other'
] as const;
export const STATUSES = ['submitted','acknowledged','assigned','in_progress','resolved','closed'] as const;
export const STATUS_LABELS: Record<string,string> = {
  submitted:'Submitted', acknowledged:'Acknowledged', assigned:'Assigned', in_progress:'In Progress', resolved:'Resolved', closed:'Closed'
};
