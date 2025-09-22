import { NextApiRequest, NextApiResponse } from 'next';
import { getUserSummary, users } from '@/util/gitlab';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (!req.query.userId || !req.query.sinceDate) {
        return res.status(400).json({ error: 'userIds and sinceDate are required' });
    }

    const userId = Number.parseInt(req.query.userId as string);
    const sinceDate = req.query.sinceDate as string;
    const toDate = req.query.toDate ? req.query.toDate as string : undefined;

    try {
        const user = users.find(u => u.id === userId); 
        if(!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        const userSummaries = await getUserSummary(user, sinceDate, toDate);
        return res.status(200).json(userSummaries);
    } catch (error) {
        console.error('Error fetching user summaries:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};