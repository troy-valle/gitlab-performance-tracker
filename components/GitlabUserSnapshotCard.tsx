"use client";
/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from 'react';
import { GitlabUserSummary, GitlabUser } from "@/util/gitlab";
import Link from "next/link";

interface GitlabUserSummaryCardProps {
    user: GitlabUser,
    startDate: string;
    endDate: string;
}

export default function GitlabUserSnapshotCard({
    user,
    startDate,
    endDate
}: GitlabUserSummaryCardProps) {
    const [userSummary, setUserSummary] = useState<GitlabUserSummary>();
    const [totalCommits, setTotalCommits] = useState<number>();
    
    useEffect(() => {
        const fetchData = async () => {
            const res = await fetch(`/api/user/${user.id}/summary?sinceDate=${startDate}&toDate=${endDate}`);
            setUserSummary(await res.json());
        }

        fetchData();
    })

    useEffect(() => {
        let commits = 0;
        if(userSummary) {
            for(const i of userSummary.commits) commits += i.commits.length;
        }
        setTotalCommits(commits);
    }, [userSummary])

    return (
        <Link className="p-2 m-2 rounded-lg border" href={`/user/${user.username}`}>
            <img className="rounded-[30px] mx-auto" width={60} height={60} src={user.avatar_url} alt="Profile Pic" />
            <div className="text-center pt-2 text-lg font-medium">{user.name}</div>
            <div>Merge Request Author Count: {userSummary?.mergeRequests.author.filter(mr => mr.state === 'merged' && mr.source_branch.indexOf("revert-") == -1).length}</div>
            <div>Merge Request Reviewer Count: {userSummary?.mergeRequests.reviewer.filter(mr => mr.state === 'merged' && mr.source_branch.indexOf("revert-") == -1).length}</div>
            <div>Commit Count: {totalCommits}</div>
        </Link>
    )
}