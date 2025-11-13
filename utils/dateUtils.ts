
import { Status } from '../types';

export const getStatusAndDays = (expiryDate: Date): { status: Status; daysRemaining: number } => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let status: Status;
    if (diffDays < 0) {
        status = Status.EXPIRED;
    } else if (diffDays <= 3) {
        status = Status.EXPIRING_SOON;
    } else {
        status = Status.FRESH;
    }

    return { status, daysRemaining: diffDays };
};
