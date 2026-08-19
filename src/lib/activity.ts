import ActivityLog from '@/models/ActivityLog';
import { getSessionUser } from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';

export async function logActivity(
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'OTHER',
  entityType: 'Transaction' | 'Category' | 'Partner' | 'Person' | 'Asset' | 'Vehicle' | 'System',
  details: string,
  entityId?: any
) {
  try {
    await connectToDatabase();
    const user = await getSessionUser();
    
    // If no user is found, default to 'System' (e.g. for seed scripts)
    const userName = user?.name || 'System';
    const userId = user?.userId || null;

    await ActivityLog.create({
      user: userName,
      userId,
      action,
      entityType,
      entityId,
      details,
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
    // We swallow the error so that a logging failure doesn't crash the main operation
  }
}
