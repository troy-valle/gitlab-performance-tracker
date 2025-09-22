import { NextApiRequest, NextApiResponse } from 'next';
import { NextResponse } from 'next/server';
import { getUserSummary, users } from '@/util/gitlab';
import { stat } from 'fs';

type Params = {
  userId: string;
};

export async function GET(request: NextApiRequest, { params }: { params: Params }) {
    const { searchParams } = new URL(request.url!);
    const userId = Number.parseInt((await params).userId);
    const sinceDate = searchParams.get('sinceDate');

    if (!userId || !sinceDate) {
        return NextResponse.json({ error: 'userIds and sinceDate are required', status: 400 });
    }
    
    const toDate = searchParams.get('toDate') || undefined;

    try {
        const user = users.find(u => u.id === userId); 
        if(!user) {
            return NextResponse.json({ error: 'User not found', status: 404 });
        }
        
        const userSummary = await getUserSummary(user, sinceDate, toDate);
        return NextResponse.json(userSummary);
    } catch (error) {
        console.error('Error fetching user summaries:', error);
        return NextResponse.json({ error: 'Internal Server Error', status: 500 });
    }
};